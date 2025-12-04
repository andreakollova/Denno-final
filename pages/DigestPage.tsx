
import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { DailyDigest, AppTab, DigestSection, PersonaType } from '../types';
import { getDigestById, saveDigest, getSelectedTopicIds, getUserProfile, deleteDigest, isInsightSaved, saveInsight, removeInsight } from '../services/storageService';
import { fetchArticlesForTopics } from '../services/rssService';
import { generateDailyDigest, generateAdditionalSections, explainTerm } from '../services/geminiService';
import DigestCard from '../components/DigestCard';
import ChatModal from '../components/ChatModal';
import { SnakeGame } from '../components/SnakeGame'; 
import { SparklesIcon, RefreshIcon, PlusCircleIcon, BookIcon, XIcon } from '../components/Icons';
import { PERSONA_UI_DATA } from '../constants';

interface DigestPageProps {
  changeTab: (tab: AppTab) => void;
  autoStart?: boolean;
  onAutoStartConsumed?: () => void;
  onProfileUpdate?: () => void;
  validateAccess?: (action: () => void) => void;
  resetTrigger?: number;
}

const DigestPage: React.FC<DigestPageProps> = ({ changeTab, autoStart, onAutoStartConsumed, onProfileUpdate, validateAccess, resetTrigger }) => {
  const [digest, setDigest] = useState<DailyDigest | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  
  // Generate More State
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadingMoreText, setLoadingMoreText] = useState('');
  
  const [error, setError] = useState<string | null>(null);
  const [activeChatSection, setActiveChatSection] = useState<DigestSection | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [profile, setProfile] = useState(getUserProfile());
  
  // Loading Animation State
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [articleCount, setArticleCount] = useState(0);
  const [fadeProp, setFadeProp] = useState('opacity-100 translate-y-0');
  
  // Encyclopedia State
  const [encyclopediaTerm, setEncyclopediaTerm] = useState<string | null>(null);
  const [encyclopediaContent, setEncyclopediaContent] = useState<string | null>(null);
  const [encyclopediaLoading, setEncyclopediaLoading] = useState(false);

  // Trigger re-render when saving
  const [lastSave, setLastSave] = useState(0);

  // --- DAY CHANGE DETECTION ---
  useEffect(() => {
    const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
            const now = new Date();
            const todayStr = now.toDateString();
            const currentStr = currentDate.toDateString();

            if (todayStr !== currentStr) {
                console.log("New day detected, resetting to Home Screen...");
                setCurrentDate(now);
                
                const todayId = now.toISOString().split('T')[0];
                const existing = getDigestById(todayId);
                
                if (existing) {
                    setDigest(existing);
                } else {
                    setDigest(null);
                }
            }
        }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    handleVisibilityChange();

    return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [currentDate]);


  useEffect(() => {
    const todayId = new Date().toISOString().split('T')[0];
    const existing = getDigestById(todayId);
    if (existing && !autoStart) {
      setDigest(existing);
    }
    setProfile(getUserProfile());
  }, [lastSave]);

  useEffect(() => {
    if (resetTrigger && resetTrigger > 0) {
        setDigest(null);
        setLoading(false);
        setError(null);
        setCurrentDate(new Date());
    }
  }, [resetTrigger]);

  useEffect(() => {
    if (!loadingMore) return;
    
    const messages = [
        "Hľadám ďalšie zaujímavé témy...",
        "Analyzujem zvyšné články...",
        "Prekladám a formátujem...",
        "Ešte chvíľočku..."
    ];
    
    setLoadingMoreText(messages[0]);
    let i = 0;
    
    const interval = setInterval(() => {
        i = (i + 1) % messages.length;
        setLoadingMoreText(messages[i]);
    }, 2000); 

    return () => clearInterval(interval);
  }, [loadingMore]);

  // Effect for rotating loading messages
  useEffect(() => {
    if (!loading) return;

    let interval: ReturnType<typeof setInterval>;
    let timeout: ReturnType<typeof setTimeout>;

    if (!isAiProcessing) {
        // PHASE 1: FETCHING
        setLoadingStep('Hľadám najnovšie správy...');
        setFadeProp('opacity-100 translate-y-0');
        
        // After 2 seconds, show "Nebude to trvať dlhšie ako minútku..."
        const durationTimeout = setTimeout(() => {
             setFadeProp('opacity-0 translate-y-2');
             setTimeout(() => {
                 setLoadingStep('Nebude to trvať dlhšie ako minútku...');
                 setFadeProp('opacity-100 translate-y-0');
             }, 600);
        }, 2000);

        // Start rotating filler messages after 5 seconds
        let lastFillerIndex = -1;
        interval = setInterval(() => {
            setFadeProp('opacity-0 translate-y-2');
            setTimeout(() => {
                const fillerMessages = [
                    "Kontaktujem spravodajské servery...",
                    "Overujem dostupnosť zdrojov...",
                    "Sťahujem obsah článkov...",
                    "Triedim relevantné informácie..."
                ];
                
                let nextIndex;
                do {
                    nextIndex = Math.floor(Math.random() * fillerMessages.length);
                } while (nextIndex === lastFillerIndex && fillerMessages.length > 1);
                
                lastFillerIndex = nextIndex;
                
                setLoadingStep(fillerMessages[nextIndex]);
                setFadeProp('opacity-100 translate-y-0');
            }, 600); 
        }, 4000); // Slower rotation

        return () => {
            clearTimeout(durationTimeout);
            clearInterval(interval);
        };

    } else {
        // PHASE 2: AI PROCESSING
        if (interval!) clearInterval(interval);

        const personaLabel = PERSONA_UI_DATA[profile.selectedPersona]?.label || profile.selectedPersona;
        
        const messages = [
          `Ďakujem za tvoju trpezlivosť...`,
          `Analyzujem ${articleCount} stiahnutých článkov...`,
          `Aplikujem mód: ${personaLabel}...`,
          `Hľadám kľúčové súvislosti a trendy...`,
          `Píšem zhrnutia a formátujem text...`
        ];
    
        let i = 0;
        
        setFadeProp('opacity-0 translate-y-2');
        setTimeout(() => {
            setLoadingStep(messages[0]);
            setFadeProp('opacity-100 translate-y-0');
        }, 600);
    
        interval = setInterval(() => {
          setFadeProp('opacity-0 translate-y-2');
    
          setTimeout(() => {
            i = (i + 1) % messages.length;
            setLoadingStep(messages[i]);
            setFadeProp('opacity-100 translate-y-0');
          }, 600);
    
        }, 4000); 
    }

    return () => {
        clearTimeout(timeout!);
        clearInterval(interval!);
    };
  }, [loading, isAiProcessing, articleCount, profile.selectedPersona]);


  const handleGenerate = async () => {
    const topics = getSelectedTopicIds();
    if (topics.length === 0) {
      changeTab(AppTab.SETTINGS);
      return;
    }

    setLoading(true);
    setIsAiProcessing(false);
    setError(null);

    setLoadingStep('Hľadám najnovšie správy...');
    setFadeProp('opacity-100 translate-y-0'); 

    try {
      const articles = await fetchArticlesForTopics(topics);
      
      if (articles.length === 0) {
        throw new Error('Nepodarilo sa stiahnuť žiadne články. Skontrolujte internetové pripojenie alebo skúste iné témy.');
      }

      setArticleCount(articles.length);
      setIsAiProcessing(true);

      const newDigest = await generateDailyDigest(articles, profile.selectedPersona);
      
      saveDigest(newDigest);
      setDigest(newDigest);
      
      const newProfile = getUserProfile();
      setProfile(newProfile); 
      onProfileUpdate && onProfileUpdate();

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Nastala chyba pri generovaní prehľadu.');
    } finally {
      setIsAiProcessing(false);
      setLoading(false);
      setLoadingStep('');
    }
  };

  const handleGenerateMore = async () => {
    if (!digest || !digest.sourceArticles || loadingMore) return;
    
    if (validateAccess) {
        validateAccess(async () => {
            await executeGenerateMore();
        });
    } else {
        await executeGenerateMore();
    }
  };

  const executeGenerateMore = async () => {
    if (!digest) return;
    setLoadingMore(true);
    try {
      const newSections = await generateAdditionalSections(
        digest.sourceArticles,
        digest.sections,
        profile.selectedPersona
      );
      
      if (newSections.length === 0) {
        alert("Nepodarilo sa nájsť ďalšie unikátne témy v dnešných článkoch.");
      } else {
        const updatedDigest = {
          ...digest,
          sections: [...digest.sections, ...newSections]
        };
        saveDigest(updatedDigest);
        setDigest(updatedDigest);
      }
    } catch (e) {
      console.error("Generate more error", e);
      alert("Chyba pri generovaní ďalšieho obsahu.");
    } finally {
      setLoadingMore(false);
    }
  };

  const handleReset = () => {
    if (validateAccess) {
        validateAccess(() => {
            if (digest) {
                deleteDigest(digest.id);
                setDigest(null);
            }
        });
    } else {
        if (digest) {
            deleteDigest(digest.id);
            setDigest(null);
        }
    }
  };

  const handleToggleSave = (section: DigestSection) => {
    if (!digest) return;

    const id = `${digest.id}-${section.title.substring(0, 10).replace(/\s+/g, '')}`;
    const saved = isInsightSaved(section.title, digest.id);

    if (saved) {
      removeInsight(id);
    } else {
      saveInsight(section, digest.id, digest.date);
    }
    setLastSave(Date.now());
  };

  const handleTagClick = async (tag: string) => {
    const execute = async () => {
        setEncyclopediaTerm(tag);
        setEncyclopediaContent(null);
        setEncyclopediaLoading(true);
        try {
        const text = await explainTerm(tag, profile.selectedPersona);
        setEncyclopediaContent(text);
        } catch (e) {
        setEncyclopediaContent("Nepodarilo sa načítať vysvetlenie.");
        } finally {
        setEncyclopediaLoading(false);
        }
    };

    if (validateAccess) {
        validateAccess(execute);
    } else {
        execute();
    }
  };

  const closeEncyclopedia = () => {
    setEncyclopediaTerm(null);
    setEncyclopediaContent(null);
  };

  const handleChatOpen = (section: DigestSection) => {
      if (validateAccess) {
          validateAccess(() => setActiveChatSection(section));
      } else {
          setActiveChatSection(section);
      }
  };

  useEffect(() => {
    if (autoStart) {
        handleGenerate();
        if (onAutoStartConsumed) {
            onAutoStartConsumed();
        }
    }
  }, [autoStart]);

  const getGreeting = () => {
    const hour = currentDate.getHours();
    if (hour < 10) return 'Dobré ráno';
    if (hour < 18) return 'Dobrý deň';
    return 'Dobrý večer';
  };

  const formattedDate = currentDate.toLocaleDateString('sk-SK', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long' 
  });


  if (loading) {
    return (
      <div className="absolute inset-0 flex items-center justify-center w-full overflow-hidden">
        
        {/* Full Screen Snake Game Background */}
        <SnakeGame />

        {/* Floating Loading Card (Pointer events none allows clicking through to game) */}
        <div className="relative z-10 flex flex-col items-center justify-center pointer-events-none p-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 dark:border-slate-700">
            <div className="relative w-16 h-16 mb-4">
            <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-200 dark:border-indigo-900 rounded-full animate-ping opacity-25"></div>
            <div className="absolute top-0 left-0 w-full h-full border-4 border-[#6466f1] rounded-full border-t-transparent animate-spin"></div>
            <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                <SparklesIcon className="w-5 h-5 text-[#6466f1] animate-pulse" />
            </div>
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1 tracking-tight">Pripravujem prehľad</h3>
            <p className={`text-xs text-slate-500 dark:text-slate-400 font-medium transition-all duration-700 ease-in-out h-4 transform text-center ${fadeProp}`}>
                {loadingStep}
            </p>
        </div>
      </div>
    );
  }

  if (!digest) {
    return (
      <div className="relative flex flex-col items-center justify-center min-h-[calc(100dvh-80px)] px-6 overflow-hidden">
        
        <style>{`
            @keyframes blob-float-1 {
                0%, 100% { transform: translate(0, 0) scale(1); }
                50% { transform: translate(-20px, 20px) scale(1.1); }
            }
            @keyframes blob-float-2 {
                0%, 100% { transform: translate(0, 0) scale(1); }
                50% { transform: translate(20px, -20px) scale(1.1); }
            }
            .animate-blob-1 { animation: blob-float-1 15s ease-in-out infinite; }
            .animate-blob-2 { animation: blob-float-2 18s ease-in-out infinite; }
        `}</style>
        
        <div className="absolute -top-60 -right-[800px] w-[800px] h-[800px] bg-[#6466f1] rounded-full blur-[120px] opacity-[0.15] dark:opacity-[0.12] animate-blob-1 pointer-events-none mix-blend-multiply dark:mix-blend-normal"></div>
        
        <div className="absolute -bottom-60 -left-[800px] w-[800px] h-[800px] bg-purple-600 rounded-full blur-[120px] opacity-[0.15] dark:opacity-[0.12] animate-blob-2 pointer-events-none mix-blend-multiply dark:mix-blend-normal"></div>


        <div className="relative z-10 text-center w-full max-w-sm">
          <div className="flex items-center justify-center gap-2 mb-4">
             <span className="text-xs font-bold text-[#6466f1] uppercase tracking-widest opacity-80">
              {formattedDate}
            </span>
          </div>
          
          <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight leading-tight">
            {getGreeting()}.
          </h1>

          <p className="text-lg text-slate-500 dark:text-slate-400 mb-8 font-light">
            Tvoj osobný AI kurátor je pripravený.<br/>
            <span className="text-xs mt-2 block opacity-70">Mód: <span className="uppercase font-bold">{PERSONA_UI_DATA[profile.selectedPersona]?.label || profile.selectedPersona}</span></span>
          </p>
          
          {error && (
            <div className="mb-8 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm border border-red-100 dark:border-red-900 shadow-sm">
              <p className="mb-2">{error}</p>
              <button 
                onClick={handleGenerate}
                className="text-xs font-bold bg-white dark:bg-slate-800 border border-red-200 dark:border-red-800 px-3 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/50 transition-colors"
              >
                Skúsiť znova
              </button>
            </div>
          )}

          <button 
            onClick={handleGenerate}
            className="group relative w-full bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-bold py-5 px-8 rounded-xl shadow-xl shadow-indigo-500/20 transition-all transform hover:scale-[1.02] active:scale-[0.98] overflow-hidden hover:bg-[#6466f1] dark:hover:bg-[#6466f1] dark:hover:text-white"
          >
            <div className="relative flex items-center justify-center gap-3">
              <SparklesIcon className="w-5 h-5 text-indigo-300 group-hover:text-white transition-colors" />
              <span>Vygenerovať denný prehľad</span>
            </div>
          </button>
          
          <p className="mt-6 text-xs text-slate-400 font-medium">
            Poháňané Google Gemini 2.0 Flash
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>
        {`
          @keyframes deepBreathing {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          .animate-deep-gradient {
            background-size: 200% 200%;
            animation: deepBreathing 10s ease infinite;
          }
        `}
      </style>
      <div className="animate-in fade-in duration-500">
        
        <div className="px-6 py-6 pb-32 space-y-8">
            
            <div className="mb-4">
               <div className="mb-4">
                 <p className="text-xs font-bold text-[#6466f1] uppercase tracking-widest">{formattedDate}</p>
               </div>
               <h1 className="text-3xl font-black text-slate-900 dark:text-white leading-none tracking-tight">
                  {digest.mainTitle}
               </h1>
            </div>

            <div 
                className="relative overflow-hidden rounded-xl animate-deep-gradient text-white shadow-xl shadow-indigo-900/10"
                style={{
                  backgroundImage: 'linear-gradient(120deg, #312e81 0%, #6466f1 50%, #4338ca 100%)'
                }}
            >
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#6466f1]/20 rounded-full blur-[80px] -mt-16 -mr-16 mix-blend-screen"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-950/40 rounded-full blur-[60px] -mb-16 -ml-16 mix-blend-multiply"></div>
                
                <div className="relative z-10 p-6 sm:p-8">
                    <div className="flex items-center gap-2 mb-4 opacity-80">
                        <SparklesIcon className="w-4 h-4 text-indigo-200" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-100">Myšlienka dňa</span>
                    </div>
                    
                    <p className="text-lg sm:text-xl font-medium leading-relaxed font-serif text-white/95">
                        "{digest.oneSentenceOverview}"
                    </p>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="bg-slate-50 dark:bg-slate-950 px-6 py-4 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-lg">⚡</span>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wide">
                        V skratke
                    </h3>
                </div>
                
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {digest.busyRead.map((item, i) => (
                        <div key={i} className="p-5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                            <div className="flex gap-3">
                                <span className="font-bold text-[#6466f1] text-sm mt-0.5">{i+1}.</span>
                                <div>
                                    <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug mb-1">
                                        {item.title}
                                    </h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                        {item.summary}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="relative py-2">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
                </div>
                <div className="relative flex justify-center">
                    <span className="bg-slate-50 dark:bg-slate-950 px-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                        Hlboký ponor
                    </span>
                </div>
            </div>

            <div className="space-y-6">
                {digest.sections.map((section, index) => (
                    <DigestCard 
                      key={index} 
                      section={section} 
                      index={index} 
                      onAskMore={handleChatOpen}
                      onTagClick={handleTagClick}
                      onToggleSave={handleToggleSave}
                      isSaved={isInsightSaved(section.title, digest.id)}
                    />
                ))}
            </div>

            <div className="pt-4 flex flex-col gap-4">
                
                {digest.sourceArticles && (
                <button 
                    onClick={handleGenerateMore}
                    disabled={loadingMore}
                    className="w-full bg-white dark:bg-slate-900 border-2 border-indigo-100 dark:border-indigo-900/50 text-[#6466f1] hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:border-indigo-200 dark:hover:border-indigo-800 font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50 min-h-[56px]"
                >
                    {loadingMore ? (
                    <>
                        <div className="w-5 h-5 border-2 border-[#6466f1] border-t-transparent rounded-full animate-spin"></div>
                        <span className="animate-pulse">{loadingMoreText}</span>
                    </>
                    ) : (
                    <>
                        <PlusCircleIcon className="w-5 h-5" />
                        <span>Načítať ďalšie správy</span>
                    </>
                    )}
                </button>
                )}

                <button 
                    onClick={handleReset}
                    className="w-full py-4 text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                >
                    <RefreshIcon className="w-3 h-3" />
                    Vymazať a začať odznova
                </button>
            </div>
        </div>
      </div>

      {activeChatSection && (
        <ChatModal 
          section={activeChatSection} 
          onClose={() => setActiveChatSection(null)} 
        />
      )}

      {encyclopediaTerm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
           <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={closeEncyclopedia}></div>
           <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-xl shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-200">
              
              <div className="bg-[#6466f1] p-4 flex justify-between items-start">
                 <div className="flex items-center gap-2 text-white">
                    <BookIcon className="w-5 h-5 text-indigo-200" />
                    <h3 className="font-bold text-lg">AI encyklopédia</h3>
                 </div>
                 <button onClick={closeEncyclopedia} className="text-white/70 hover:text-white">
                    <XIcon className="w-5 h-5" />
                 </button>
              </div>

              <div className="p-6">
                 <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">{encyclopediaTerm}</h2>
                 
                 {encyclopediaLoading ? (
                    <div className="flex flex-col items-center justify-center py-8">
                       <div className="w-8 h-8 border-4 border-indigo-200 border-t-[#6466f1] rounded-full animate-spin mb-3"></div>
                       <p className="text-sm text-slate-500">Hľadám definíciu...</p>
                    </div>
                 ) : (
                    <div className="prose prose-sm text-slate-700 dark:text-slate-300 leading-relaxed max-h-60 overflow-y-auto pr-2">
                       <ReactMarkdown>{encyclopediaContent || ""}</ReactMarkdown>
                    </div>
                 )}
                 
                 <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-center">
                    <button onClick={closeEncyclopedia} className="text-sm font-bold text-[#6466f1] dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 px-4 py-2 rounded-lg transition-colors">
                       Zavrieť
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </>
  );
};

export default DigestPage;
