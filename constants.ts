
import { Topic, PersonaType } from './types';

export const CATEGORY_EMOJIS: Record<string, string> = {
  'Slovensko': '🇸🇰',
  'Veda a budúcnosť': '🧬',
  'Šport a zábava': '⚽',
  'AI a tech core': '🤖',
  'Biznis a práca': '💼',
  'Spoločnosť': '🌍',
  'Lifestyle': '🧘',
  'Zahraničie': '🌐',
  'Kontroverzia': '🔥'
};

export const getCategoryForTags = (tags: string[]): string => {
    // Priority specific checks first
    for (const tag of tags) {
        const t = tag.toLowerCase();
        if (t.includes('kontroverzia') || t.includes('škandál')) return 'Kontroverzia';
        if (t.includes('ai') || t.includes('tech')) return 'AI a tech core';
        if (t.includes('šport') || t.includes('futbal') || t.includes('hokej')) return 'Šport a zábava';
        if (t.includes('slovensko')) return 'Slovensko';
        if (t.includes('medicína') || t.includes('veda')) return 'Veda a budúcnosť';
        if (t.includes('biznis') || t.includes('trhy')) return 'Biznis a práca';
        if (t.includes('lifestyle') || t.includes('zdravie')) return 'Lifestyle';
    }
    return 'Spoločnosť'; // Default
};

export const PERSONA_UI_DATA: Record<PersonaType, { label: string; description: string }> = {
  [PersonaType.DEFAULT]: { label: 'Redaktor (predvolené)', description: 'Profesionálny, stručný a jasný prehľad dňa. Ideálny pre každodenné čítanie.' },
  [PersonaType.CEO]: { label: 'Biznisový stratég (CEO)', description: 'Zamerané na ROI, trhové dopady a stratégiu. Žiadna omáčka, len fakty.' },
  [PersonaType.ELI5]: { label: 'Kamarát (jednoducho)', description: 'Jednoduché analógie, žiadny odborný žargón. Hravé a pochopiteľné pre každého.' },
  [PersonaType.NERD]: { label: 'Technický expert', description: 'Hlboký ponor do technických detailov, špecifikácií a metodológie.' }
};

export const getSystemInstructionContent = (persona: PersonaType) => `
You are a highly skilled personal news editor fluent in Slovak.
Your goal is to process a list of article titles and summaries and create a structured daily digest.
The output MUST be in valid JSON format.
The language of the output content MUST be Slovak.

Style Guide: ${PERSONA_PROMPTS[persona]}

Structure your response to match this JSON schema:
{
  "mainTitle": "string (A catchy title for today's digest)",
  "oneSentenceOverview": "string (The single most important sentence summarizing the day)",
  "busyRead": [
    { "title": "string (A full, descriptive headline, 5-10 words)", "summary": "string (1 sentence summary)" }
  ],
  "sections": [
    {
      "title": "string (Section header)",
      "whatIsNew": "string (What actually happened)",
      "whatChanged": "string (How is this different from before or what changed)",
      "keyPoints": ["string", "string", "string", "string", "string"] (Exactly 5 bullet points summarizing the whole event),
      "sourceLink": "string (The EXACT Link URL of the source article used for this section)",
      "tags": ["string", "string"] (EXACTLY 1 or 2 tags. IMPORTANT: Tags MUST be single words. Transform multi-word phrases to single nouns. E.g. 'Artificial Intelligence' -> 'AI', 'Social Media' -> 'Social'. NO spaces allowed in tags.)
    }
  ]
}

Guidelines:
- "busyRead" must contain exactly the 3 most important stories. The titles here should be descriptive sentences, NOT just short keywords.
- Group related articles into 5 to 8 distinct sections.
- CAPITALIZATION RULE: All titles (mainTitle, section titles, busyRead titles) MUST be in Slovak sentence case. Only the first letter and proper nouns should be capitalized. Do NOT use English Title Case.
  - Correct: "Nová legislatíva EÚ ovplyvní trh"
  - Incorrect: "Nová Legislatíva EÚ Ovplyvní Trh"
- Do not include 'Article 1' text.
- STRICTLY RESPECT SOURCE CONTEXT: If articles come from a specific source category (e.g. Women's Sports, Slovak Repre), ensure the digest reflects that specific context. Do not mix unrelated topics.
`;

export const PERSONA_PROMPTS: Record<PersonaType, string> = {
  [PersonaType.DEFAULT]: "Keep the tone professional, concise, yet engaging. Focus on clarity.",
  [PersonaType.CEO]: "Act as a busy CEO executive. Focus on business impact, ROI, market shifts, and strategic implications. Be extremely concise. Cut the fluff.",
  [PersonaType.ELI5]: "Explain like I am 5 years old. Use simple analogies. Avoid complex jargon. Focus on the basic 'what' and 'why'. be fun.",
  [PersonaType.NERD]: "Act as a technical expert. Go deep into the specifications, methodology, and technical details. Do not simplify technical terms."
};

export const AVAILABLE_TOPICS: Topic[] = [
  // --- Kategória: Slovensko ---
  {
    id: 'slovakia_domestic',
    name: 'Slovenské spravodajstvo',
    category: 'Slovensko',
    rssUrls: [
      'https://www.aktuality.sk/rss/domace/',
      'https://domov.sme.sk/rss/rss.xml',
      'https://dennikn.sk/slovensko/feed',
      'https://www.teraz.sk/rss/slovensko.rss',
      'https://spravy.rtvs.sk/rss/slovensko',
      'https://www.webnoviny.sk/kategoria/slovensko/feed/',
      'https://www.pravda.sk/rss/xml/domace/',
      'https://www.ta3.com/rss/slovensko'
    ]
  },
  {
    id: 'slovakia_world',
    name: 'Aktuality zo sveta',
    category: 'Slovensko',
    rssUrls: [
      'https://www.aktuality.sk/rss/zahranicne/',
      'https://svet.sme.sk/rss/rss.xml',
      'https://dennikn.sk/svet/feed',
      'https://spravy.rtvs.sk/rss/svet',
      'https://hnonline.sk/rss/svet',
      'https://www.pravda.sk/rss/xml/svet/'
    ]
  },
  {
    id: 'slovakia_economy',
    name: 'Slovenská ekonomika a biznis',
    category: 'Slovensko',
    rssUrls: [
      'https://index.sme.sk/rss/rss.xml',
      'https://www.trend.sk/rss/vsetko',
      'https://www.aktuality.sk/rss/ekonomika/',
      'https://www.forbes.sk/feed/',
      'https://hnonline.sk/rss/finweb',
      'https://www.obchod.sk/rss',
      'https://openiazoch.zoznam.sk/rss/'
    ]
  },

  // --- Kategória: Veda a budúcnosť ---
  {
    id: 'medicine',
    name: 'Medicína',
    category: 'Veda a budúcnosť',
    rssUrls: [
      'https://www.nature.com/nature.rss',
      'https://rss.sciencedaily.com/health_medicine.xml',
      'https://www.nih.gov/news-events/feed.xml',
      'https://www.medicalnewstoday.com/feed',
      'https://rss.medicalxpress.com/medical-news.xml',
      'https://www.nejm.org/medical-research/rss',
      'https://www.thelancet.com/rss/feed/thelancet_current.xml',
      'https://www.statnews.com/feed/',
      'https://www.medscape.com/cx/rssfeeds/medscape.xml',
      'https://www.eurekalert.org/rss/medicine_health.xml'
    ]
  },
  {
    id: 'new_ai_models',
    name: 'Nové AI modely & SOTA',
    category: 'Veda a budúcnosť',
    rssUrls: [
      'https://huggingface.co/blog/feed.xml',
      'https://openai.com/news/rss.xml',
      'https://deepmind.google/discover/blog/rss.xml',
      'https://www.anthropic.com/feed',
      'https://ai.meta.com/blog/rss.xml',
      'https://www.microsoft.com/en-us/research/feed/',
      'https://simonwillison.net/atom/ab/',
      'https://blog.langchain.dev/rss/',
      'https://aws.amazon.com/blogs/machine-learning/feed/',
      'https://stability.ai/blog/rss.xml',
      'https://research.google/blog/rss',
      'https://bdtechtalks.com/feed/',
      'https://www.midjourney.com/feed',
      'https://blogs.nvidia.com/feed/'
    ]
  },
  {
    id: 'science',
    name: 'Veda a inovácie',
    category: 'Veda a budúcnosť',
    rssUrls: [
      'https://www.science.org/rss/news_current.xml',
      'https://www.sciencedaily.com/rss/top_news.xml',
      'https://www.wired.com/feed/category/science/latest/rss',
      'https://www.nature.com/nature.rss',
      'https://www.newscientist.com/feed/home/',
      'https://phys.org/rss-feed/',
      'https://feeds.arstechnica.com/arstechnica/science',
      'https://www.scientificamerican.com/rss/home/',
      'https://www.smithsonianmag.com/rss/science-nature/',
      'https://futurism.com/feed',
      'https://gizmodo.com/tag/science/rss',
      'https://www.eurekalert.org/rss/technology_engineering.xml',
      'https://www.quantamagazine.org/feed/',
      'https://www.nasa.gov/rss/dyn/breaking_news.rss',
      'https://www.therobotreport.com/feed/'
    ]
  },
  {
    id: 'quantum',
    name: 'Kvantové počítanie',
    category: 'Veda a budúcnosť',
    rssUrls: [
      'https://thequantuminsider.com/feed/',
      'https://www.sciencedaily.com/rss/computers_math/quantum_computers.xml',
      'https://quantamagazine.org/feed',
      'https://quantumcomputingreport.com/feed/',
      'https://phys.org/rss-feed/quantum-physics/',
      'https://qt.eu/feed/'
    ]
  },
  {
    id: 'ar_vr',
    name: 'AR/VR a spatial computing',
    category: 'Veda a budúcnosť',
    rssUrls: [
      'https://uploadvr.com/feed',
      'https://www.roadtovr.com/feed/',
      'https://www.vrfocus.com/feed/',
      'https://arstechnica.com/tag/virtual-reality/feed/',
      'https://www.moguravr.com/feed/',
      'https://mixed-news.com/en/feed/'
    ]
  },
  {
    id: 'robotics',
    name: 'Robotika',
    category: 'Veda a budúcnosť',
    rssUrls: [
      'https://spectrum.ieee.org/rss/robotics/fulltext',
      'https://www.sciencedaily.com/rss/computers_math/robotics.xml',
      'https://www.therobotreport.com/feed/',
      'https://robots.net/feed/',
      'https://news.mit.edu/rss/topic/robotics',
      'https://techxplore.com/rss-feed/robotics-news/'
    ]
  },
  {
    id: 'space',
    name: 'Vesmír a letectvo',
    category: 'Veda a budúcnosť',
    rssUrls: [
      'https://www.space.com/feeds/news',
      'https://spacenews.com/feed/',
      'https://www.nasa.gov/rss/dyn/breaking_news.rss',
      'https://www.esa.int/rssfeed/Our_Activities/Space_News',
      'https://www.universetoday.com/feed/',
      'https://skyandtelescope.org/feed/',
      'https://arstechnica.com/space/feed/'
    ]
  },
  {
    id: 'renewable_energy',
    name: 'Energetika a udržateľnosť',
    category: 'Veda a budúcnosť',
    rssUrls: [
      'https://www.iea.org/rss/news',
      'https://www.bloomberg.com/feeds/bloomberg-green/rss',
      'https://www.euronews.com/rss/green',
      'https://www.sustainability-times.com/feed/',
      'https://cleantechnica.com/feed/',
      'https://www.renewableenergyworld.com/feed/',
      'https://www.power-technology.com/feed/',
      'https://oilprice.com/rss/main',
      'https://www.energy.gov/news/rss',
      'https://pv-magazine.com/feed/'
    ]
  },
  {
    id: 'food_tech',
    name: 'Food tech',
    category: 'Veda a budúcnosť',
    rssUrls: [
      'https://thespoon.tech/feed/',
      'https://www.foodnavigator.com/RSS/Feed/LN/Daily-News',
      'https://agfundernews.com/feed',
      'https://www.fooddive.com/feeds/news/',
      'https://techcrunch.com/tag/food-tech/feed/',
      'https://www.greenqueen.com.hk/feed/'
    ]
  },

  // --- Kategória: Šport a zábava ---
  {
    id: 'sport_repre',
    name: 'Šport (všeobecné)',
    category: 'Šport a zábava',
    rssUrls: [
      'https://sport.aktuality.sk/rss/',
      'https://sport.sme.sk/rss/rss.xml',
      'https://sportky.zoznam.sk/rss',
      'https://dennikn.sk/sport/feed',
      'https://sport.pravda.sk/rss/xml/',
      'https://www.teraz.sk/rss/sport.rss',
      'https://www.olympic.sk/rss',
      'https://www.onlajny.eu/feed/news',
      'https://www.futbalsfz.sk/rss',
      'https://www.hockeyslovakia.sk/sk/rss/news',
      'https://slovakbasket.sk/rss.xml',
      'https://slovakhandball.sk/rss.xml'
    ]
  },
  {
    id: 'sports_marketing',
    name: 'Športový marketing',
    category: 'Šport a zábava',
    rssUrls: [
      'https://www.sportspromedia.com/feed/',
      'https://sbcnews.co.uk/category/marketing/feed/',
      'https://www.sportico.com/feed/',
      'https://www.marketingweek.com/feed/',
      'https://insideworldfootball.com/category/marketing/feed/',
      'https://sportsbusinessjournal.com/rss/all',
      'https://www.sportindustry.biz/feed'
    ]
  },
  {
    id: 'sports_biz',
    name: 'Technológie a šport',
    category: 'Šport a zábava',
    rssUrls: [
      'https://frontofficesports.com/feed/',
      'https://www.sporttechie.com/feed/',
      'https://sportsbusinessjournal.com/rss/all',
      'https://www.insidethegames.biz/rss/news'
    ]
  },
  {
    id: 'sport_football',
    name: 'Futbal',
    category: 'Šport a zábava',
    rssUrls: [
      'https://sport.aktuality.sk/rss/futbal/',
      'https://www.goal.com/feeds/en/news',
      'https://www.skysports.com/rss/12040',
      'https://www.uefa.com/rssfeed/news/rss.xml',
      'https://www.espn.com/espn/rss/soccer/news',
      'https://talksport.com/feed/football/',
      'https://www.90min.com/posts.rss'
    ]
  },
  {
    id: 'sport_hockey',
    name: 'Hokej',
    category: 'Šport a zábava',
    rssUrls: [
      'https://sport.aktuality.sk/rss/hokej/',
      'https://www.nhl.com/rss/news',
      'https://www.tsn.ca/rss/nhl',
      'https://hockeyslovakia.sk/sk/rss/news',
      'https://www.sportsnet.ca/feed/hockey/',
      'https://www.hockeybuzz.com/rss/hockey_buzz.xml'
    ]
  },
  {
    id: 'sport_basketball',
    name: 'Basketbal',
    category: 'Šport a zábava',
    rssUrls: [
      'https://www.nba.com/rss/nba_rss.xml',
      'https://www.eurohoops.net/feed/',
      'https://www.espn.com/espn/rss/nba/news',
      'https://slovakbasket.sk/rss.xml',
      'https://www.slamonline.com/feed/',
      'https://hoopshype.com/feed/'
    ]
  },
  {
    id: 'f1_motorsport',
    name: 'F1 a motoršport',
    category: 'Šport a zábava',
    rssUrls: [
      'https://www.autosport.com/rss/feed/f1',
      'https://www.motorsport.com/rss/f1/news/',
      'https://www.formula1.com/content/fom-website/en/latest/all.xml',
      'https://the-race.com/feed/',
      'https://www.planetf1.com/feed/',
      'https://www.crash.net/rss/f1'
    ]
  },
  {
    id: 'sport_field_hockey',
    name: 'Pozemný hokej',
    category: 'Šport a zábava',
    rssUrls: [
      'https://www.thehockeypaper.co.uk/feed',
      'https://fieldhockey.com/index.php?format=feed&type=rss',
      'https://fih.ch/rss-news',
      'https://www.eurohockey.org/feed/',
      'https://usafieldhockey.com/rss'
    ]
  },
  {
    id: 'gaming',
    name: 'Gaming a e-športy',
    category: 'Šport a zábava',
    rssUrls: [
      'https://kotaku.com/rss',
      'https://www.polygon.com/rss/index.xml',
      'https://www.ign.com/rss/articles/feed',
      'https://www.eurogamer.net/?format=rss',
      'https://www.gamespot.com/feeds/news/',
      'https://www.pcgamer.com/rss/',
      'https://dotesports.com/feed',
      'https://esportsinsider.com/feed'
    ]
  },
  {
    id: 'womens_sports',
    name: 'Ženy v športe',
    category: 'Šport a zábava',
    rssUrls: [
      'https://justwomenssports.com/feed/',
      'https://feeds.theguardian.com/theguardian/sport/womens-sport/rss',
      'https://www.espn.com/espn/rss/w-sport/news',
      'https://thegist.com/sports/feed/',
      'https://www.skysports.com/rss/12040'
    ]
  },

  // --- Kategória: Ostatné (Tech, Biznis, Lifestyle) ---
  {
    id: 'ai_tech',
    name: 'Všeobecné AI a tech',
    category: 'AI a tech core',
    rssUrls: [
      'https://techcrunch.com/category/artificial-intelligence/feed/',
      'https://www.theverge.com/rss/technology/index.xml',
      'https://www.technologyreview.com/feed/',
      'https://venturebeat.com/category/ai/feed/',
      'https://thenextweb.com/feed',
      'https://www.engadget.com/rss.xml',
      'https://arstechnica.com/feed/',
      'https://www.wired.com/feed/category/science/latest/rss',
      'https://www.cnet.com/rss/news/',
      'https://gizmodo.com/tag/tech/rss'
    ]
  },
  {
    id: 'ui_ux_design',
    name: 'UI/UX a kreatívny dizajn',
    category: 'AI a tech core',
    rssUrls: [
      'https://uxdesign.cc/feed',
      'https://www.smashingmagazine.com/categories/ux-design/index.xml',
      'https://sidebar.io/feed.xml',
      'https://www.nngroup.com/feed/rss/',
      'https://abduzeedo.com/feed.xml',
      'https://uxplanet.org/feed',
      'https://www.creativebloq.com/feed'
    ]
  },
  {
    id: 'cybersecurity',
    name: 'Kybernetická bezpečnosť',
    category: 'AI a tech core',
    rssUrls: [
      'https://krebsonsecurity.com/feed/',
      'https://thehackernews.com/rss.xml',
      'https://www.bleepingcomputer.com/feed/',
      'https://threatpost.com/feed/',
      'https://www.darkreading.com/rss.xml',
      'https://www.securityweek.com/feed/',
      'https://nakedsecurity.sophos.com/feed/'
    ]
  },
  {
    id: 'consumer_tech',
    name: 'Spotrebná elektronika',
    category: 'AI a tech core',
    rssUrls: [
      'https://www.engadget.com/rss.xml',
      'https://www.wired.com/feed/category/gear/latest/rss',
      'https://www.cnet.com/rss/news/',
      'https://www.tomsguide.com/feeds/all',
      'https://9to5mac.com/feed/',
      'https://www.androidauthority.com/feed',
      'https://gizmodo.com/tag/gadgets/rss'
    ]
  },
  {
    id: 'smart_home',
    name: 'Smart home a IoT',
    category: 'AI a tech core',
    rssUrls: [
      'https://staceyoniot.com/feed/',
      'https://www.iotworldtoday.com/rss.xml',
      'https://www.the-ambient.com/feed',
      'https://www.theverge.com/rss/smart-home/index.xml',
      'https://www.cnet.com/rss/smart-home/',
      'https://www.homekitauthority.com/feed/'
    ]
  },
  {
    id: 'business_startups',
    name: 'Biznis a startupy',
    category: 'Biznis a práca',
    rssUrls: [
      'https://feeds.feedburner.com/entrepreneur/latest',
      'http://feeds.feedburner.com/TechCrunch/startups',
      'https://venturebeat.com/feed/',
      'https://www.ycombinator.com/blog/rss',
      'https://www.fastcompany.com/feed',
      'https://www.businessinsider.com/rss?type=cluster&id=finance',
      'https://www.inc.com/rss.xml',
      'https://fortune.com/feed/section/finance',
      'https://www.marketwatch.com/rss/topstories'
    ]
  },
  {
    id: 'deals_acquisitions',
    name: 'Fúzie, akvizície a dealy',
    category: 'Biznis a práca',
    rssUrls: [
      'https://techcrunch.com/tag/mergers-and-acquisitions/feed/',
      'https://www.pehub.com/feed/',
      'https://mergersandinquisitions.com/feed/',
      'https://pitchbook.com/news/rss',
      'https://www.axios.com/feeds/pro-dealbook'
    ]
  },
  {
    id: 'economy',
    name: 'Ekonomika a trhy',
    category: 'Biznis a práca',
    rssUrls: [
      'https://www.economist.com/finance-and-economics/rss.xml',
      'https://feeds.bloomberg.com/economics/news.xml',
      'https://www.cnbc.com/id/10000664/device/rss/rss.html',
      'https://fortune.com/feed',
      'https://finance.yahoo.com/news/rssindex',
      'https://www.wsj.com/xml/rss/3_7031.xml',
      'https://www.ft.com/rss/home/us'
    ]
  },
  {
    id: 'investing',
    name: 'Osobné financie a investovanie',
    category: 'Biznis a práca',
    rssUrls: [
      'https://www.kiplinger.com/feed',
      'https://www.investopedia.com/feedbuilder/feed/public/reviews_feed',
      'https://www.marketwatch.com/rss/topstories',
      'https://feeds.contenthub.fool.com/fool/headlines',
      'https://seekingalpha.com/feed.xml',
      'https://www.morningstar.com/feed',
      'https://www.nerdwallet.com/blog/feed/',
      'https://www.cnbc.com/id/15839069/device/rss/rss.html'
    ]
  },
  {
    id: 'creator_economy',
    name: 'Creator economy',
    category: 'Biznis a práca',
    rssUrls: [
      'https://techcrunch.com/tag/creator-economy/feed/',
      'https://www.theinformation.com/rss/creator-economy.xml',
      'https://www.tubefilter.com/feed/',
      'https://www.socialmediatoday.com/feeds/news/',
      'https://later.com/blog/rss'
    ]
  },
  {
    id: 'productivity',
    name: 'Produktivita a work trends',
    category: 'Biznis a práca',
    rssUrls: [
      'https://lifehacker.com/rss',
      'https://zenhabits.net/feed/',
      'https://jamesclear.com/feed',
      'https://blog.doist.com/rss/',
      'https://tim.blog/feed/',
      'https://aliabdaal.com/feed/',
      'https://todoist.com/inspiration/feed',
      'https://www.fastcompany.com/work-life/rss'
    ]
  },
  {
    id: 'hr_leadership',
    name: 'HR a leadership',
    category: 'Biznis a práca',
    rssUrls: [
      'https://hbr.org/feeds/rss',
      'https://www.shrm.org/feed',
      'https://www.worklife.news/feed/',
      'https://www.tlnt.com/feed',
      'https://www.hrdive.com/feeds/news/'
    ]
  },
  {
    id: 'real_estate',
    name: 'Reality a smart cities',
    category: 'Biznis a práca',
    rssUrls: [
      'https://www.smartcitiesworld.net/rss/news',
      'https://www.inman.com/feed/',
      'https://www.curbed.com/rss/index.xml',
      'https://www.architecturaldigest.com/feed/rss',
      'https://www.realtor.com/news/feed/',
      'https://www.mansionglobal.com/rss'
    ]
  },
  {
    id: 'politics',
    name: 'Globálna politika',
    category: 'Spoločnosť',
    rssUrls: [
      'https://feeds.bbci.co.uk/news/world/rss.xml',
      'https://www.politico.eu/feed/',
      'https://www.aljazeera.com/xml/rss/all.xml',
      'https://www.reutersagency.com/feed/?best-topics=political-general&post_kind=best',
      'https://foreignpolicy.com/feed/',
      'https://thediplomat.com/feed/',
      'https://www.dw.com/en/top-stories/s-9097/rss.xml',
      'https://www.theguardian.com/world/rss'
    ]
  },
  {
    id: 'eu_regulation',
    name: 'EÚ tech regulácie',
    category: 'Spoločnosť',
    rssUrls: [
      'https://eur-lex.europa.eu/RSS/feed.xml',
      'https://techcrunch.com/tag/europe/feed/',
      'https://www.euractiv.com/feed/',
      'https://www.politico.eu/section/technology/feed/',
      'https://edri.org/feed/'
    ]
  },
  {
    id: 'culture_media',
    name: 'Kultúra a médiá',
    category: 'Spoločnosť',
    rssUrls: [
      'https://www.theguardian.com/culture/rss',
      'https://www.niemanlab.org/feed/',
      'https://variety.com/feed/',
      'https://www.rollingstone.com/culture/culture-news/feed/',
      'https://www.newyorker.com/feed/culture',
      'https://www.theatlantic.com/feed/category/culture/',
      'https://www.vulture.com/rss'
    ]
  },
  {
    id: 'education',
    name: 'Vzdelávanie a e-learning',
    category: 'Spoločnosť',
    rssUrls: [
      'https://www.edutopia.org/feeds/latest',
      'https://thejournal.com/rss-feeds/news.aspx',
      'https://www.edsurge.com/articles_rss',
      'https://www.insidehighered.com/rss/feed/news_feed',
      'https://www.chronicle.com/rss',
      'https://elearningindustry.com/feed'
    ]
  },
  {
    id: 'health_longevity',
    name: 'Zdravie a dlhovekosť',
    category: 'Lifestyle',
    rssUrls: [
      'https://peterattiamd.com/feed/',
      'https://www.nia.nih.gov/news/rss',
      'https://www.nature.com/nature.rss',
      'https://www.health.harvard.edu/rss',
      'https://longevity.technology/feed/',
      'https://www.bluezones.com/feed/',
      'https://www.sciencedaily.com/rss/health_medicine/longevity.xml',
      'https://www.medicalnewstoday.com/feed'
    ]
  },
  {
    id: 'mental_health',
    name: 'Duševné zdravie',
    category: 'Lifestyle',
    rssUrls: [
      'https://psychcentral.com/feed',
      'https://www.scientificamerican.com/rss/mind-and-brain/',
      'https://themighty.com/feed/',
      'https://www.helpguide.org/feed',
      'https://www.mindful.org/feed/',
      'https://tinybuddha.com/feed/',
      'https://www.positivityblog.com/feed/',
      'https://greatergood.berkeley.edu/rss/all',
      'https://zenhabits.net/feed/',
      'https://www.happierhuman.com/feed/',
      'https://positivepsychology.com/feed/',
      'https://www.verywellmind.com/feed/rss',
      'https://www.psychologytoday.com/us/feed/news'
    ]
  },
  {
    id: 'psychology',
    name: 'Psychológia a rozhodovanie',
    category: 'Lifestyle',
    rssUrls: [
      'https://fs.blog/feed/',
      'https://www.behavioraleconomics.com/feed/',
      'https://digest.bps.org.uk/feed/',
      'https://www.spring.org.uk/feed',
      'https://www.psyblog.co.uk/feed/',
      'https://psypost.org/feed',
      'https://www.sciencedaily.com/rss/mind_brain/psychology.xml',
      'https://www.apa.org/news/psycport/rss.xml',
      'https://www.psychologicalscience.org/feed'
    ]
  },
  {
    id: 'fitness',
    name: 'Fitness a výživa',
    category: 'Lifestyle',
    rssUrls: [
      'https://www.healthline.com/nutrition/rss.xml',
      'https://breakingmuscle.com/feed/',
      'https://examine.com/feed/rss/',
      'https://barbend.com/feed/',
      'https://www.menshealth.com/rss/fitness.xml',
      'https://www.menshealth.com/rss/nutrition.xml',
      'https://www.womenshealthmag.com/rss/fitness.xml',
      'https://www.self.com/feed/fitness/rss'
    ]
  },
  {
    id: 'parenting',
    name: 'Rodičovstvo a rodinné tech',
    category: 'Lifestyle',
    rssUrls: [
      'https://www.todaysparent.com/feed/',
      'https://coolmompicks.com/feed/',
      'https://www.parents.com/feed',
      'https://www.thebump.com/rss',
      'https://www.scarymommy.com/feed',
      'https://www.fatherly.com/feed'
    ]
  },
  {
    id: 'travel',
    name: 'Cestovanie a hospitality',
    category: 'Lifestyle',
    rssUrls: [
      'https://skift.com/feed/',
      'https://www.travelandleisure.com/feed/daily',
      'https://www.lonelyplanet.com/news/rss',
      'https://www.cntraveler.com/feed/rss',
      'https://thepointsguy.com/feed/',
      'https://www.nationalgeographic.com/travel/rss',
      'https://www.afar.com/feed/rss'
    ]
  },
  {
    id: 'music_lifestyle',
    name: 'Hudba',
    category: 'Lifestyle',
    rssUrls: [
      'https://www.rollingstone.com/music/music-news/feed/',
      'https://pitchfork.com/feed/feed-news/rss',
      'https://www.billboard.com/feed/',
      'https://www.nme.com/feed',
      'https://consequence.net/feed/',
      'https://www.stereogum.com/feed/'
    ]
  },
  {
    id: 'fashion',
    name: 'Móda a luxus',
    category: 'Lifestyle',
    rssUrls: [
      'https://www.businessoffashion.com/feeds/news-analysis',
      'https://www.vogue.com/feed/rss',
      'https://hypebeast.com/feed',
      'https://www.harpersbazaar.com/rss/all.xml/',
      'https://www.elle.com/rss/all.xml/',
      'https://www.gq.com/feed/style/rss',
      'https://highsnobiety.com/feed'
    ]
  }
];
