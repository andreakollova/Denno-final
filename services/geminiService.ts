
import { GoogleGenAI, Type, Chat } from "@google/genai";
import { Article, DailyDigest, DigestSection, PersonaType, LearningPack } from '../types';
import { getSystemInstructionContent } from '../constants';
import { fetchTextWithFallback } from './rssService';

// Helper to get a fresh AI client instance
// This ensures we always use the current environment API key
const getAiClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

// Strict mapping for common multi-word tags to single words
const TAG_MAPPINGS: Record<string, string> = {
  'umelá inteligencia': 'AI',
  'artificial intelligence': 'AI',
  'životné prostredie': 'Ekológia',
  'sociálne siete': 'Social',
  'kybernetická bezpečnosť': 'Kyber',
  'virtuálna realita': 'VR',
  'rozšírená realita': 'AR',
  'kvantové počítanie': 'Kvantum',
  'pozemný hokej': 'Hokej',
  'športový marketing': 'Marketing',
  'alternatívne bielkoviny': 'Potraviny',
  'duševné zdravie': 'Psychológia',
  'klimatické zmeny': 'Klíma',
  'smart home': 'IoT',
  'európska únia': 'EÚ',
  'ľudské zdroje': 'HR',
  'fúzie a akvizície': 'Dealy',
  'spotrebná elektronika': 'Gadgets',
  'obnoviteľné zdroje': 'Energia',
  'vesmírny výskum': 'Vesmír',
  'globálna politika': 'Politika',
  'stredný východ': 'Konflikt',
  'cestovný ruch': 'Travel',
  'hry a e-šport': 'Gaming',
  'ui/ux dizajn': 'Dizajn',
  'ux dizajn': 'UX'
};

const sanitizeTag = (tag: string): string => {
  const lower = tag.toLowerCase().trim();
  
  // 1. Check direct mapping
  if (TAG_MAPPINGS[lower]) return TAG_MAPPINGS[lower];

  // 2. If it's already single word, capitalize first letter and return
  if (!lower.includes(' ')) {
    return tag.charAt(0).toUpperCase() + tag.slice(1);
  }

  // 3. Fallback: Split by space and take the longest word (heuristic: noun is usually longer than adjective in Slovak)
  const words = lower.split(/\s+/);
  const longestWord = words.reduce((a, b) => a.length >= b.length ? a : b, '');
  
  return longestWord.charAt(0).toUpperCase() + longestWord.slice(1);
};

// Helper to shuffle array
const shuffleArray = <T>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};

export const generateDailyDigest = async (articles: Article[], persona: PersonaType, isRegeneration: boolean = false): Promise<DailyDigest> => {
  const ai = getAiClient();
  if (articles.length === 0) {
    throw new Error("Žiadne články na spracovanie.");
  }

  // 1. Sort by date first (Newest first)
  const sortedByDate = articles.sort((a, b) => new Date(b.published).getTime() - new Date(a.published).getTime());

  let finalPool: Article[] = [];

  // 2. SELECT ARTICLES STRATEGY
  if (isRegeneration) {
      // VARIETY MODE (User clicked "Try Again")
      // Goal: Show different stories than the first run.
      // Logic: Take the top 150 articles and SHUFFLE them completely. 
      // This breaks the "Top 20" lock, allowing newer/niche stories to bubble up to the top spots 
      // which the AI uses for "V skratke" (Busy Read).
      const pool = sortedByDate.slice(0, 150);
      finalPool = shuffleArray(pool).slice(0, 80);
  } else {
      // BEST OF BEST MODE (First Run of Day)
      // Goal: Ensure the user sees the absolute most important news.
      // Logic: Keep TOP 20 FIXED. Shuffle the rest.
      const breakingNews = sortedByDate.slice(0, 20); // Guaranteed to be in the prompt
      const otherNews = sortedByDate.slice(20, 120); 
      const shuffledOthers = shuffleArray(otherNews);
      
      // Combine: 20 Fixed + 60 Random
      finalPool = [...breakingNews, ...shuffledOthers].slice(0, 80);
  }

  // 3. Final Shuffle
  // Randomize the ORDER of the input to the AI to prevent position bias (LLMs focus on start/end).
  const promptInputArticles = shuffleArray(finalPool);

  const articlesText = promptInputArticles.map(a => `Title: ${a.title}\nLink: ${a.link}\nSummary: ${a.summary}\nSource: ${a.source}\n`).join('\n---\n');

  const prompt = `Here are the news articles from the last 120 hours:\n\n${articlesText}\n\nCreate a comprehensive digest with 5 to 8 distinct sections. Ensure all titles use Slovak sentence case (only first letter capitalized). IMPORTANT: For each section, you MUST provide the exact 'sourceLink' of the article you used.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      systemInstruction: getSystemInstructionContent(persona),
      temperature: isRegeneration ? 0.85 : 0.7, // Higher temp for regeneration to force different wording/angles
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          mainTitle: { type: Type.STRING },
          oneSentenceOverview: { type: Type.STRING },
          busyRead: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                summary: { type: Type.STRING }
              },
              required: ["title", "summary"]
            }
          },
          sections: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                whatIsNew: { type: Type.STRING },
                whatChanged: { type: Type.STRING },
                keyPoints: { 
                    type: Type.ARRAY, 
                    items: { type: Type.STRING },
                    description: "5 bullet points summarizing the event"
                },
                sourceLink: { type: Type.STRING, description: "The EXACT Link URL of the source article used for this section" },
                tags: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING, description: "Strictly SINGLE WORD tag (e.g. 'Ekonomika')" },
                  maxItems: 2
                }
              },
              required: ["title", "whatIsNew", "whatChanged", "keyPoints", "tags", "sourceLink"]
            }
          }
        },
        required: ["mainTitle", "oneSentenceOverview", "busyRead", "sections"]
      }
    }
  });

  const text = response.text;
  if (!text) {
      throw new Error("Failed to generate digest content");
  }

  const jsonResponse = JSON.parse(text);
  const todayId = new Date().toISOString().split('T')[0];

  // Map directly without image processing but SANITIZE TAGS
  const enrichedSections = jsonResponse.sections.map((s: any) => ({
    ...s,
    tags: s.tags.map(sanitizeTag) // Enforce single word tags
  }));

  return {
    id: todayId,
    date: new Date().toISOString(),
    mainTitle: jsonResponse.mainTitle,
    oneSentenceOverview: jsonResponse.oneSentenceOverview,
    busyRead: jsonResponse.busyRead,
    sections: enrichedSections,
    sourceArticles: sortedByDate, // Save ORIGINAL sorted list for "Generate More" context
    createdAt: Date.now(),
    personaUsed: persona
  };
};

export const generateAdditionalSections = async (
  articles: Article[], 
  existingSections: DigestSection[], 
  persona: PersonaType
): Promise<DigestSection[]> => {
  const ai = getAiClient();
  
  if (articles.length === 0) return [];

  // Shuffle for variety in additional sections too
  const shuffledArticles = shuffleArray(articles).slice(0, 80);

  const articlesText = shuffledArticles.map(a => `Title: ${a.title}\nLink: ${a.link}\nSummary: ${a.summary}\n`).join('\n---\n');
  const existingTitles = existingSections.map(s => s.title).join(", ");

  const prompt = `
    Here are the news articles:\n${articlesText}\n
    
    The current digest already covers these topics/titles:
    [${existingTitles}]
    
    TASK: Generate 3 NEW, DISTINCT sections based on the articles that cover different stories or angles NOT yet covered in the list above.
    
    IMPORTANT RULES:
    1. The output language MUST be SLOVAK.
    2. If the source article is in English, TRANSLATE the title and content to Slovak.
    3. Ensure strict Slovak sentence case for titles (e.g., "Nová funkcia v iPhone" not "Nová Funkcia V iPhone").
    4. Provide 'sourceLink' for each section.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      systemInstruction: getSystemInstructionContent(persona), // Reuse style
      temperature: 0.8, // Higher temperature for novelty
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            whatIsNew: { type: Type.STRING },
            whatChanged: { type: Type.STRING },
            keyPoints: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING }
            },
            sourceLink: { type: Type.STRING },
            tags: {
              type: Type.ARRAY,
              items: { type: Type.STRING, description: "Strictly SINGLE WORD tag only" },
              maxItems: 2
            }
          },
          required: ["title", "whatIsNew", "whatChanged", "keyPoints", "tags", "sourceLink"]
        }
      }
    }
  });

  const text = response.text;
  if (!text) return [];

  const rawSections = JSON.parse(text) as DigestSection[];

  // Return sections with sanitized tags
  return rawSections.map(s => ({
    ...s,
    tags: s.tags.map(sanitizeTag)
  }));
};

export const createChatSession = (section: DigestSection): Chat => {
  const ai = getAiClient();
  
  // Safe accessor for keyPoints to handle legacy data or empty arrays
  const keyPointsText = section.keyPoints && section.keyPoints.length > 0
    ? section.keyPoints.join("; ")
    : (section.whatToWatch || "Žiadne ďalšie detaily.");

  const contextString = `
    Téma článku: ${section.title}
    Čo je nové: ${section.whatIsNew}
    Čo sa zmenilo: ${section.whatChanged}
    Kľúčové body: ${keyPointsText}
  `;

  return ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: `Si nápomocný AI asistent pre spravodajskú aplikáciu.
      Používateľ číta správu z denného prehľadu s nasledujúcim kontextom:
      ${contextString}

      Tvojou úlohou je odpovedať na doplňujúce otázky používateľa k tejto konkrétnej téme.
      Pravidlá:
      1. Odpovedaj stručne, jasne a v slovenskom jazyku.
      2. Buď priateľský.`
    }
  });
};

export const summarizeUrl = async (url: string, persona: PersonaType): Promise<string> => {
  const ai = getAiClient();
  try {
    const content = await fetchTextWithFallback(url);
    if (!content) {
      throw new Error("Nedá sa načítať obsah stránky.");
    }
    
    // Limit content size roughly
    const truncatedContent = content.substring(0, 15000);

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Summarize this text in Slovak language. Use the following persona: ${persona}. Text: ${truncatedContent}`,
      config: {
        systemInstruction: "You are a helpful assistant. Summarize the provided web content. Return only the summary text, formatted with Markdown."
      }
    });

    return response.text || "Nepodarilo sa vygenerovať zhrnutie.";

  } catch (error) {
    console.error("Link summary error:", error);
    return "Prepáč, nepodarilo sa mi načítať alebo analyzovať tento odkaz.";
  }
}

// Feature 43: Encyclopedia - Explain a term
export const explainTerm = async (term: string, persona: PersonaType): Promise<string> => {
  const ai = getAiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `Explain the concept or topic "${term}" clearly in Slovak. Use the persona: ${persona}. Keep it under 150 words.`,
    config: {
      systemInstruction: "You are an AI Encyclopedia. Your goal is to provide clear, accurate, and concise definitions of complex terms found in news articles. Output in Slovak Markdown."
    }
  });
  return response.text || "Nepodarilo sa nájsť vysvetlenie.";
};

// Feature 44: Fast Learning Packs
export const generateLearningPack = async (topic: string, persona: PersonaType): Promise<LearningPack> => {
  const ai = getAiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `Create a "10-minute Fast Learning Pack" about: ${topic}. Language: Slovak.`,
    config: {
      systemInstruction: `You are an educational AI. Create a structured crash course on the given topic. 
      Persona: ${persona}.
      Structure the JSON response exactly as requested.`,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          topic: { type: Type.STRING },
          definition: { type: Type.STRING, description: "Simple definition of the topic" },
          history: { type: Type.STRING, description: "Brief history or timeline in 2-3 sentences" },
          keyConcepts: { type: Type.ARRAY, items: { type: Type.STRING }, description: "3-5 bullet points of main concepts" },
          futureOutlook: { type: Type.STRING, description: "What to expect in the future" },
          quizQuestion: { type: Type.STRING, description: "One simple quiz question to test understanding" }
        },
        required: ["topic", "definition", "history", "keyConcepts", "futureOutlook", "quizQuestion"]
      }
    }
  });

  if (!response.text) throw new Error("Generovanie zlyhalo");
  return JSON.parse(response.text) as LearningPack;
};
