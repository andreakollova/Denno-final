
import React, { useState, useEffect } from 'react';
import { summarizeUrl, generateLearningPack } from '../services/geminiService';
import { getUserProfile, markLearningTopicComplete } from '../services/storageService';
import { LinkIcon, SendIcon, BotIcon, AcademicIcon, SparklesIcon, RefreshIcon } from '../components/Icons';
import { LearningPack } from '../types';
import ReactMarkdown from 'react-markdown';

// Categorized topics to ensure variety on every refresh
const TOPIC_CATEGORIES = {
  "Tech & AI": [
    "Umelá inteligencia", "Strojové učenie (ML)", "Hlboké učenie (Deep Learning)", "Neurónové siete", 
    "Veľké jazykové modely (LLM)", "Generatívna AI", "ChatGPT a GPT modely", "Prompt Engineering",
    "Počítačové videnie", "Spracovanie jazyka (NLP)", "AGI (Všeobecná AI)", "Difúzne modely",
    "RAG (Retrieval-Augmented Generation)", "AI Agenty", "Etické zarovnanie (AI Alignment)",
    "Turingov test", "AI Halucinácie", "Blockchain", "Web3", "Kyberbezpečnosť", 
    "Metaverse", "Kvantové počítanie", "Smart Contracts", "Internet vecí (IoT)", 
    "Rozšírená realita (AR)", "Deepfakes", "Big Data", "Cloud Computing", "Autonómne vozidlá",
    "Reinforcement Learning", "Supervised Learning", "Unsupervised Learning", "Transformer Model",
    "Attention Mechanism", "Tokenizácia", "Fine-tuning", "Zero-shot Learning", "Few-shot Learning",
    "Bias v AI", "AI Etika", "Explainable AI (XAI)", "Singularita", "Robotika", "Federated Learning"
  ],
  "Veda & Vesmír": [
    "Kvantová fyzika", "CRISPR", "Epigenetika", "Teória relativity", "Čierne diery", 
    "Termodynamika", "Entropia", "Mikrobióm", "Syntetická biológia", "Fúzna energia", 
    "Temná hmota", "Astrobiológia", "Nanotechnológie", "Kmeňové bunky", "Neuroveda"
  ],
  "Filozofia & Myslenie": [
    "Stoicizmus", "Nihilizmus", "Utilitarizmus", "Kritické myslenie", "Teória hier", 
    "Logické klamy", "Efektívny altruizmus", "Epistemológia", "Etika cnosti", 
    "Existenicializmus", "Daoizmus", "Meditácia", "Vedomie (Consciousness)"
  ],
  "Biznis & Ekonomika": [
    "Makroekonómia", "Inflácia", "Finančná gramotnosť", "Paretov princíp (80/20)", 
    "Zložené úročenie", "Pasívny príjem", "Behaviorálna ekonómia", "Startupy", 
    "Marketingová psychológia", "Agile metodika", "Time Management", "Deep Work"
  ],
  "Psychológia & Zdravie": [
    "Dopamínový detox", "Flow state", "Neuroplasticita", "Cirkadiánny rytmus", 
    "Biohacking", "Dlhovekosť (Longevity)", "Emočná inteligencia", "Kognitívne skreslenia", 
    "Ego", "Mindfulness", "Psychológia davu", "Reč tela", "Placebo efekt"
  ],
  "História & Kultúra": [
    "História umenia", "Renesancia", "Hodvábna cesta", "Antický Rím", 
    "Priemyselná revolúcia", "Architektúra", "Minimalizmus", "Postmodernizmus", 
    "Mytológia", "Lingvistika", "Geopolitika"
  ]
};

interface ToolsPageProps {
  validateAccess?: (action: () => void) => void;
}

const ToolsPage: React.FC<ToolsPageProps> = ({ validateAccess }) => {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Learning Pack State
  const [learnTopic, setLearnTopic] = useState('');
  const [learningPack, setLearningPack] = useState<LearningPack | null>(null);
  const [learningLoading, setLearningLoading] = useState(false);
  const [displayedPacks, setDisplayedPacks] = useState<string[]>([]);

  useEffect(() => {
    refreshPacks();
  }, []);

  const refreshPacks = () => {
    const profile = getUserProfile();
    const completed = new Set(profile.completedLearningTopics.map(t => t.toLowerCase()));

    // 70% AI Topics (7 items) + 30% Other Topics (3 items)
    const newSelection: string[] = [];

    // 1. Get AI Topics
    const aiCategory = TOPIC_CATEGORIES["Tech & AI"];
    const availableAi = aiCategory.filter(item => !completed.has(item.toLowerCase()));
    const shuffledAi = [...availableAi].sort(() => 0.5 - Math.random());
    const selectedAi = shuffledAi.slice(0, 7);
    newSelection.push(...selectedAi);

    // 2. Get Other Topics
    const otherCategories = Object.entries(TOPIC_CATEGORIES).filter(([key]) => key !== "Tech & AI");
    const otherTopicsPool: string[] = [];
    
    otherCategories.forEach(([_, items]) => {
        otherTopicsPool.push(...items.filter(item => !completed.has(item.toLowerCase())));
    });
    
    const shuffledOthers = [...otherTopicsPool].sort(() => 0.5 - Math.random());
    const remainingSlots = 10 - newSelection.length;
    const selectedOthers = shuffledOthers.slice(0, remainingSlots);
    newSelection.push(...selectedOthers);

    // Final shuffle so AI topics aren't just at the top
    const finalMix = newSelection.sort(() => 0.5 - Math.random());
    setDisplayedPacks(finalMix);
  };

  const handleExplain = async () => {
    if (!url || loading) return;

    // GATE: Feature limited
    const execute = async () => {
        setLoading(true);
        setResult(null);

        try {
        const profile = getUserProfile();
        const summary = await summarizeUrl(url, profile.selectedPersona);
        setResult(summary);
        } catch (e) {
        setResult("Nepodarilo sa spracovať odkaz.");
        } finally {
        setLoading(false);
        }
    };

    if (validateAccess) {
        validateAccess(execute);
    } else {
        execute();
    }
  };

  const handleCreateLearningPack = async (topicOverride?: string) => {
    const topicToUse = topicOverride || learnTopic;
    if (!topicToUse || learningLoading) return;
    
    // GATE: Feature limited
    const execute = async () => {
        // Update input if clicked from popular list
        if (topicOverride) setLearnTopic(topicOverride);

        setLearningLoading(true);
        setLearningPack(null);
        try {
        const profile = getUserProfile();
        const pack = await generateLearningPack(topicToUse, profile.selectedPersona);
        
        // Mark as completed so it doesn't show up again
        markLearningTopicComplete(topicToUse);
        // Refresh the list immediately
        refreshPacks();

        setLearningPack(pack);
        } catch (e) {
        alert("Nepodarilo sa vytvoriť rýchlokurz.");
        } finally {
        setLearningLoading(false);
        }
    };

    if (validateAccess) {
        validateAccess(execute);
    } else {
        execute();
    }
  };

  const resetLearning = () => {
    setLearningPack(null);
    setLearnTopic('');
  };

  return (
    <div className="px-6 py-8 animate-in fade-in pb-32">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Nástroje</h1>
      <p className="text-slate-500 dark:text-slate-400 mb-8">Rýchle AI funkcie pre tvoju zvedavosť.</p>

      {/* Feature 44: Fast Learning Packs */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden mb-8">
        <div className="bg-slate-900 dark:bg-slate-950 p-6 text-white border-b border-slate-800">
          <div className="flex items-center gap-2 mb-2">
            <AcademicIcon className="w-5 h-5 text-indigo-300" />
            <h2 className="font-bold text-lg">AI rýchlokurzy</h2>
          </div>
          <p className="text-slate-400 text-sm">
            Zadaj tému a vytvorím ti štruktúrovaný "5-minútový rýchlokurz".
          </p>
        </div>

        <div className="p-6">
          {!learningPack && (
            <div className="flex gap-2 mb-6">
               <input 
                type="text" 
                placeholder="napr. Kvantová fyzika, NFT..."
                value={learnTopic}
                onChange={(e) => setLearnTopic(e.target.value)}
                className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-3 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-[#6466f1] outline-none"
              />
               <button 
                onClick={() => handleCreateLearningPack()}
                disabled={learningLoading || !learnTopic}
                className="bg-[#6466f1] text-white px-4 py-2 rounded-lg disabled:opacity-50 hover:bg-indigo-700 transition-colors font-bold text-sm"
              >
                {learningLoading ? '...' : 'Vytvoriť'}
              </button>
            </div>
          )}

          {/* Popular Packs Selection */}
          {!learningPack && !learningLoading && (
            <div className="mb-2">
               <div className="flex items-center justify-between mb-3">
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Populárne témy</p>
                 <button 
                   onClick={refreshPacks}
                   className="text-slate-400 hover:text-[#6466f1] dark:hover:text-indigo-400 transition-colors flex items-center gap-1 text-xs font-bold bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-lg border border-slate-100 dark:border-slate-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:border-indigo-100 dark:hover:border-indigo-800"
                   title="Nové témy"
                 >
                   <RefreshIcon className="w-3 h-3" />
                   Obmeniť
                 </button>
               </div>
               
               {displayedPacks.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">Všetky populárne témy sú už dokončené! Skúste zadať vlastnú.</p>
               ) : (
                  <div className="flex flex-wrap gap-2">
                    {displayedPacks.map(topic => (
                      <button 
                        key={topic}
                        onClick={() => handleCreateLearningPack(topic)}
                        className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-slate-600 dark:text-slate-300 hover:text-[#6466f1] dark:hover:text-indigo-300 border border-slate-200 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-800 rounded-lg text-xs font-bold transition-colors"
                      >
                        {topic}
                      </button>
                    ))}
                  </div>
               )}
            </div>
          )}

          {/* Loading State */}
          {learningLoading && !learningPack && (
             <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <SparklesIcon className="w-8 h-8 text-[#6466f1] animate-spin" />
                <p className="text-sm font-medium text-slate-500 animate-pulse">
                   AI profesor pripravuje tvoj kurz...
                </p>
             </div>
          )}

          {/* Result View */}
          {learningPack && (
            <div className="animate-in slide-in-from-bottom-4">
               
               <button 
                 onClick={resetLearning}
                 className="mb-6 flex items-center gap-2 text-xs font-bold text-[#6466f1] dark:text-indigo-300 hover:text-indigo-800 dark:hover:text-indigo-100 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-2 rounded-lg self-start transition-colors"
               >
                 <span className="text-lg leading-none">←</span> Späť na výber
               </button>

               <div className="space-y-6">
                   
                   {/* 1. Definition */}
                   <div className="bg-indigo-50/50 dark:bg-indigo-900/20 p-5 rounded-xl border border-indigo-100 dark:border-indigo-900/40">
                      <h3 className="text-xs font-bold text-[#6466f1] dark:text-indigo-300 uppercase tracking-wide mb-2">Definícia</h3>
                      <p className="text-lg font-bold text-slate-900 dark:text-white">{learningPack.definition}</p>
                   </div>

                   {/* 2. Key Concepts */}
                   <div>
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">Kľúčové koncepty</h3>
                      <div className="space-y-3">
                         {learningPack.keyConcepts.map((concept, i) => (
                            <div key={i} className="flex gap-3 bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                               <span className="flex-shrink-0 w-6 h-6 bg-indigo-100 dark:bg-indigo-900/50 text-[#6466f1] dark:text-indigo-300 rounded-full flex items-center justify-center text-xs font-bold">{i+1}</span>
                               <span className="text-sm text-slate-700 dark:text-slate-300">{concept}</span>
                            </div>
                         ))}
                      </div>
                   </div>

                   {/* 3. History */}
                   <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-xl border border-slate-100 dark:border-slate-800">
                       <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">História v skratke</h3>
                       <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{learningPack.history}</p>
                   </div>

                   {/* 4. Future */}
                   <div className="relative pl-4 border-l-4 border-[#6466f1] dark:border-indigo-500">
                       <h3 className="text-xs font-bold text-[#6466f1] dark:text-indigo-400 uppercase tracking-wide mb-1">Budúcnosť</h3>
                       <p className="text-sm text-slate-700 dark:text-slate-300 italic">"{learningPack.futureOutlook}"</p>
                   </div>

                   {/* 5. Quiz */}
                   <div className="bg-slate-900 dark:bg-slate-950 text-white p-5 rounded-xl border border-slate-800">
                       <h3 className="text-xs font-bold text-indigo-300 uppercase tracking-wide mb-2">Rýchly kvíz</h3>
                       <p className="font-medium mb-4">{learningPack.quizQuestion}</p>
                       <div className="text-xs text-white/50 text-center uppercase tracking-widest border-t border-white/10 pt-4">
                          Odpovedz si sám pre seba :)
                       </div>
                   </div>

                   <button 
                     onClick={resetLearning}
                     className="w-full py-4 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-[#6466f1] dark:hover:text-indigo-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors border border-dashed border-slate-200 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-800"
                   >
                     Nová téma
                   </button>
               </div>
            </div>
          )}
        </div>
      </div>

      {/* Explain Link Card */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden mb-8">
        <div className="bg-gradient-to-r from-[#6466f1] to-purple-600 p-6 text-white">
          <div className="flex items-center gap-2 mb-2">
            <LinkIcon className="w-5 h-5 text-indigo-100" />
            <h2 className="font-bold text-lg">Vysvetliť odkaz</h2>
          </div>
          <p className="text-indigo-100 text-sm">
            Vlož link na článok a AI ti ho okamžite zhrnie v tvojom obľúbenom štýle.
          </p>
        </div>

        <div className="p-6">
          <div className="flex gap-2 mb-6">
            <input 
              type="url" 
              placeholder="https://..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-[#6466f1] outline-none text-slate-900 dark:text-white"
            />
            <button 
              onClick={handleExplain}
              disabled={loading || !url}
              className="bg-slate-900 dark:bg-white dark:text-slate-900 text-white p-3 rounded-lg disabled:opacity-50 hover:bg-slate-800 transition-colors"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 dark:border-slate-900/30 border-t-white dark:border-t-slate-900 rounded-full animate-spin"></div>
              ) : (
                <SendIcon className="w-5 h-5" />
              )}
            </button>
          </div>

          {result && (
            <div className="bg-slate-50 dark:bg-slate-950 rounded-xl p-4 border border-slate-100 dark:border-slate-800 animate-in slide-in-from-bottom-2">
              <div className="flex items-center gap-2 mb-3">
                <BotIcon className="w-4 h-4 text-[#6466f1]" />
                <span className="text-xs font-bold text-slate-400 uppercase">AI zhrnutie</span>
              </div>
              <div className="prose prose-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                <ReactMarkdown>{result}</ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      </div>
      
    </div>
  );
};

export default ToolsPage;
