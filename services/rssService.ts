
import { Article } from '../types';
import { AVAILABLE_TOPICS } from '../constants';

// Definition of proxy strategies
interface ProxyConfig {
  name: string;
  getUrl: (target: string) => string;
  extract: (response: Response) => Promise<string>;
}

// Ordered list of proxies to try
const PROXIES: ProxyConfig[] = [
  {
    name: 'CorsProxy',
    getUrl: (url) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
    extract: (res) => res.text(),
  },
  {
    name: 'AllOrigins',
    getUrl: (url) => `https://api.allorigins.win/get?url=${encodeURIComponent(url)}&t=${Date.now()}`,
    extract: async (res) => {
      const json = await res.json();
      if (!json.contents) throw new Error('AllOrigins: No content returned');
      return json.contents;
    },
  },
  {
    name: 'CodeTabs',
    getUrl: (url) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
    extract: (res) => res.text(),
  }
];

// --- SIMPLE CACHE IMPLEMENTATION ---
const CACHE_KEY_PREFIX = 'rss_cache_';
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

const getCachedContent = (url: string): string | null => {
  try {
    const item = localStorage.getItem(CACHE_KEY_PREFIX + url);
    if (!item) return null;
    
    const parsed = JSON.parse(item);
    if (Date.now() - parsed.timestamp < CACHE_TTL) {
      return parsed.content;
    }
    localStorage.removeItem(CACHE_KEY_PREFIX + url);
    return null;
  } catch (e) {
    return null;
  }
};

const setCachedContent = (url: string, content: string) => {
  try {
    localStorage.setItem(CACHE_KEY_PREFIX + url, JSON.stringify({
      timestamp: Date.now(),
      content
    }));
  } catch (e) {
    // Quota exceeded, ignore
  }
};

// Helper to pause execution
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to shuffle proxies to distribute load
const getRotatedProxies = () => {
    const shuffled = [...PROXIES];
    // Randomize to avoid hitting the same proxy repeatedly
    const firstIndex = Math.floor(Math.random() * shuffled.length);
    const first = shuffled.splice(firstIndex, 1);
    return [...first, ...shuffled];
};

// Fallback specifically for RSS feeds using rss2json service
// This is often more reliable than parsing raw XML from proxies
const fetchWithRss2Json = async (url: string, sourceName: string): Promise<Article[]> => {
  try {
    // Add random param to avoid server-side caching of errors
    const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}&_t=${Date.now()}`; 
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (data.status === 'ok' && Array.isArray(data.items)) {
      return data.items.map((item: any) => ({
        title: item.title,
        summary: item.description || item.content || "",
        link: item.link,
        published: item.pubDate || new Date().toISOString(),
        source: sourceName,
        rawDate: item.pubDate ? new Date(item.pubDate) : new Date(),
        imageUrl: item.enclosure?.link || item.thumbnail,
      }));
    }
  } catch (e) {
    // console.warn(`[RSS] RSS2JSON failed for ${url}`, e);
  }
  return [];
};

export const fetchTextWithFallback = async (url: string): Promise<string | null> => {
  // 1. Check Cache
  const cached = getCachedContent(url);
  if (cached) return cached;

  // 2. Fetch fresh with Load Balancing
  const proxiesToTry = getRotatedProxies();

  for (const proxy of proxiesToTry) {
    try {
      const proxyUrl = proxy.getUrl(url);
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 15000); // 15s timeout

      const response = await fetch(proxyUrl, {
        signal: controller.signal,
        headers: { 'Cache-Control': 'no-cache' }
      });
      clearTimeout(id);

      if (response.ok) {
        const text = await proxy.extract(response);
        // Basic validation
        if (text && (text.includes('<rss') || text.includes('<feed') || text.includes('<?xml') || text.includes('<html'))) {
          setCachedContent(url, text);
          return text;
        }
      }
    } catch (e) {
      // Continue to next proxy
    }
  }
  return null;
};

const parseXML = (xmlText: string, sourceName: string): Article[] => {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, "text/xml");

    if (xmlDoc.querySelector("parsererror")) return [];

    const articles: Article[] = [];
    const now = new Date();
    const timeLimit = new Date(now.getTime() - 120 * 60 * 60 * 1000); // 5 days back

    const getText = (parent: Element, selector: string) => {
      let el = parent.querySelector(selector);
      if (!el) {
          const els = parent.getElementsByTagNameNS("*", selector);
          if (els.length > 0) el = els[0];
      }
      return el ? el.textContent || "" : "";
    };

    const getDate = (parent: Element) => {
      const dateStr = getText(parent, "pubDate") || getText(parent, "published") || getText(parent, "updated") || getText(parent, "dc:date");
      if (!dateStr) return null;
      const d = new Date(dateStr);
      return isNaN(d.getTime()) ? null : d;
    };

    const processNode = (node: Element) => {
      const title = getText(node, "title");
      if (!title) return null;

      let summary = "";
      const contentEncoded = node.getElementsByTagNameNS("*", "encoded")[0];
      if (contentEncoded) {
        summary = contentEncoded.textContent || "";
      } else {
        summary = getText(node, "description") || getText(node, "summary") || getText(node, "content");
      }

      let link = getText(node, "link");
      if (!link) {
        const linkNode = node.querySelector("link");
        if (linkNode) link = linkNode.getAttribute("href") || "";
      }
      if (!link) { // Atom fallback
         const links = Array.from(node.getElementsByTagName("link"));
         const altLink = links.find(l => l.getAttribute("rel") === "alternate") || links[0];
         if (altLink) link = altLink.getAttribute("href") || altLink.textContent || "";
      }

      const effectiveDate = getDate(node) || new Date(); 

      let imageUrl: string | undefined = undefined;
      const mediaContent = node.getElementsByTagNameNS("*", "content");
      if (mediaContent.length > 0) {
          const url = mediaContent[0].getAttribute("url");
          if (url) imageUrl = url;
      }
      if (!imageUrl) {
          const enclosure = node.querySelector("enclosure");
          if (enclosure) imageUrl = enclosure.getAttribute("url") || undefined;
      }

      // Extract image from HTML description if not found elsewhere
      if (!imageUrl && summary) {
          const imgMatch = summary.match(/<img[^>]+src=["']([^"']+)["']/);
          if (imgMatch) imageUrl = imgMatch[1];
      }

      const cleanSummary = summary
        .replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1')
        .replace(/<[^>]*>?/gm, '') // Strip HTML tags
        .replace(/\s+/g, ' ')
        .substring(0, 500)
        .trim();

      return {
        title: title.trim(),
        summary: cleanSummary || title,
        link: link,
        published: effectiveDate.toISOString(),
        source: sourceName,
        rawDate: effectiveDate,
        imageUrl: imageUrl,
      };
    };

    const itemNodes = Array.from(xmlDoc.getElementsByTagName("item"));
    const entryNodes = Array.from(xmlDoc.getElementsByTagName("entry"));
    const nsItemNodes = itemNodes.length === 0 ? Array.from(xmlDoc.getElementsByTagNameNS("*", "item")) : [];
    const nsEntryNodes = entryNodes.length === 0 ? Array.from(xmlDoc.getElementsByTagNameNS("*", "entry")) : [];

    const allNodes = new Set([...itemNodes, ...entryNodes, ...nsItemNodes, ...nsEntryNodes]);
    const parsedItems = Array.from(allNodes).map(processNode).filter((item) => item !== null) as any[];

    parsedItems.forEach((item) => {
      if (item.rawDate > timeLimit) {
        articles.push(item);
      }
    });

    // Fallback: Always return top 5 even if dates are weird/old
    if (articles.length === 0 && parsedItems.length > 0) {
      parsedItems.slice(0, 5).forEach((item) => articles.push(item));
    }

    return articles;
  } catch (e) {
    return [];
  }
};

const fetchRssFeed = async (url: string, sourceName: string): Promise<Article[]> => {
  let articles: Article[] = [];

  // Strategy: Try Proxy Fetch -> If fail or empty, Try RSS2JSON -> If fail, empty.
  
  // 1. Try text proxies
  const xmlContent = await fetchTextWithFallback(url);
  if (xmlContent) {
    articles = parseXML(xmlContent, sourceName);
  }

  // 2. Strong Fallback to RSS2JSON if proxies fail OR if parsing failed (0 articles)
  if (articles.length === 0) {
    const fallbackArticles = await fetchWithRss2Json(url, sourceName);
    if (fallbackArticles.length > 0) {
      return fallbackArticles;
    }
  }

  return articles;
};

// Batch processing with throttling
async function processInBatches<T, R>(
  items: T[],
  batchSize: number,
  processFn: (item: T) => Promise<R>
): Promise<R[]> {
  const results: R[] = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    
    // Execute batch
    const batchResults = await Promise.all(batch.map(item => 
        processFn(item).catch(() => [] as any)
    ));
    
    results.push(...batchResults);

    // Delay to avoid rate limits (429) - REDUCED to 50ms for speed
    if (i + batchSize < items.length) {
      await delay(50); 
    }
  }
  return results;
}

export const fetchArticlesForTopics = async (topicIds: string[]): Promise<Article[]> => {
  const allArticles: Article[] = [];
  const selectedTopics = AVAILABLE_TOPICS.filter(t => topicIds.includes(t.id));

  // Limit to 40 feeds max to prevent total timeout if user selects everything
  const MAX_FEEDS = 40; 
  let tasks = selectedTopics.flatMap(topic => 
    topic.rssUrls.map(url => ({ url, sourceName: topic.name }))
  );

  if (tasks.length > MAX_FEEDS) {
      tasks = tasks.slice(0, MAX_FEEDS);
  }

  // Batch size 3 is safe for free proxies
  const results = await processInBatches(tasks, 3, async (task: { url: string; sourceName: string }) => {
    return await fetchRssFeed(task.url, task.sourceName);
  });

  results.forEach(feedArticles => {
    if (Array.isArray(feedArticles)) {
        allArticles.push(...feedArticles);
    }
  });

  // Remove duplicates based on Link
  const uniqueArticles = Array.from(new Map(allArticles.map(item => [item.link, item])).values());
  return uniqueArticles;
};
