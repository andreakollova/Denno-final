
import React, { useState, useEffect, useRef } from 'react';
import { AVAILABLE_TOPICS, PERSONA_UI_DATA } from '../constants';
import { getSelectedTopicIds, saveSelectedTopicIds, getUserProfile, setPersona, saveUserProfile, toggleTheme, redeemSecretCode, exportUserData, importUserData, hardResetApp } from '../services/storageService';
import { CheckIcon, UserIcon, SparklesIcon, MapPinIcon, ChevronDownIcon, ChevronUpIcon, SettingsIcon, XIcon, MoonIcon, SunIcon, BellIcon, CloudIcon, TrashIcon, MoreHorizontalIcon } from '../components/Icons';
import { PersonaType, NotificationFrequency, SubscriptionStatus } from '../types';
import { requestNotificationPermission } from '../services/notificationService';
import LegalModal, { LegalMode } from '../components/LegalModal';

interface SettingsPageProps {
  onFinish?: () => void;
  onThemeChange?: () => void;
}

const CATEGORY_EMOJIS: Record<string, string> = {
  'Slovensko': '🇸🇰',
  'Veda a budúcnosť': '🧬',
  'Šport a zábava': '⚽',
  'AI a tech core': '🤖',
  'Biznis a práca': '💼',
  'Spoločnosť': '🌍',
  'Lifestyle': '🧘'
};

const SettingsPage: React.FC<SettingsPageProps> = ({ onFinish, onThemeChange }) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentPersona, setCurrentPersona] = useState<PersonaType>(PersonaType.DEFAULT);
  const [city, setCity] = useState<string>('');
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isTopExpanded, setIsTopExpanded] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [notificationFreq, setNotificationFreq] = useState<NotificationFrequency>(NotificationFrequency.DAILY);
  const [notificationPerm, setNotificationPerm] = useState(Notification.permission);
  
  // Secret Code State
  const [showSecretInput, setShowSecretInput] = useState(false);
  const [secretCode, setSecretCode] = useState('');
  const [secretMessage, setSecretMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [subStatus, setSubStatus] = useState<SubscriptionStatus>(SubscriptionStatus.TRIAL);
  
  // Menu State
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [legalMode, setLegalMode] = useState<LegalMode | null>(null);

  // File Upload Ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const profile = getUserProfile();
    setSelectedIds(getSelectedTopicIds());
    setCurrentPersona(profile.selectedPersona);
    setCity(profile.city || '');
    setTheme(profile.theme);
    setNotificationFreq(profile.notificationFrequency || NotificationFrequency.DAILY);
    setSubStatus(profile.subscriptionStatus);
    
    // No categories expanded by default
    setExpandedCategories([]); 
  }, []);

  const handleToggleTheme = () => {
    const newTheme = toggleTheme();
    setTheme(newTheme);
    if (onThemeChange) onThemeChange();
  };

  const toggleTopic = (id: string) => {
    let newIds;
    if (selectedIds.includes(id)) {
      newIds = selectedIds.filter(tid => tid !== id);
    } else {
      newIds = [...selectedIds, id];
    }
    setSelectedIds(newIds);
    saveSelectedTopicIds(newIds);
  };

  const handlePersonaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPersona = e.target.value as PersonaType;
    setCurrentPersona(newPersona);
    setPersona(newPersona);
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newCity = e.target.value;
    setCity(newCity);
    const profile = getUserProfile();
    saveUserProfile({ ...profile, city: newCity });
  };
  
  const handleNotificationChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const freq = e.target.value as NotificationFrequency;
    
    if (freq !== NotificationFrequency.OFF && Notification.permission !== 'granted') {
       const granted = await requestNotificationPermission();
       setNotificationPerm(Notification.permission);
       if (!granted) {
          alert('Pre zapnutie notifikácií musíte povoliť oprávnenie v prehliadači.');
          return;
       }
    }
    
    setNotificationFreq(freq);
    const profile = getUserProfile();
    saveUserProfile({ ...profile, notificationFrequency: freq });
  };

  const handleSecretCodeSubmit = () => {
      const success = redeemSecretCode(secretCode);
      if (success) {
          setSecretMessage({ type: 'success', text: 'Kód prijatý! Máte doživotný prístup.' });
          setSubStatus(SubscriptionStatus.LIFETIME);
      } else {
          setSecretMessage({ type: 'error', text: 'Neplatný kód.' });
      }
  };

  const handleHardReset = () => {
      if (confirm('POZOR: Toto vymaže všetky vaše nastavenia, históriu, uložené články a poznámky. Aplikácia sa resetuje do pôvodného stavu. Pokračovať?')) {
          hardResetApp();
      }
  };

  // --- DATABASE FUNCTIONS ---
  const handleExportData = () => {
     const dataStr = exportUserData();
     const blob = new Blob([dataStr], { type: "application/json" });
     const url = URL.createObjectURL(blob);
     const link = document.createElement("a");
     link.href = url;
     link.download = `ai_digest_backup_${new Date().toISOString().split('T')[0]}.json`;
     document.body.appendChild(link);
     link.click();
     document.body.removeChild(link);
  };

  const handleImportClick = () => {
      fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
          const content = event.target?.result as string;
          if (content) {
              const success = importUserData(content);
              if (success) {
                  alert('Dáta boli úspešne obnovené. Aplikácia sa reštartuje.');
                  window.location.reload();
              } else {
                  alert('Chyba pri obnove dát. Súbor môže byť poškodený.');
              }
          }
      };
      reader.readAsText(file);
  };

  const toggleCategory = (category: string) => {
    if (expandedCategories.includes(category)) {
      setExpandedCategories(expandedCategories.filter(c => c !== category));
    } else {
      setExpandedCategories([...expandedCategories, category]);
    }
  };

  // Group topics by category
  const groupedTopics = AVAILABLE_TOPICS.reduce((acc, topic) => {
    if (!acc[topic.category]) {
      acc[topic.category] = [];
    }
    acc[topic.category].push(topic);
    return acc;
  }, {} as Record<string, typeof AVAILABLE_TOPICS>);

  // Updated Top Selection List
  const topTopicIds = ['slovakia_domestic', 'new_ai_models', 'science', 'sports_marketing', 'politics', 'renewable_energy', 'f1_motorsport'];
  const topTopics = AVAILABLE_TOPICS.filter(t => topTopicIds.includes(t.id));

  return (
    <div className="px-6 py-8 pb-32 animate-in fade-in">
      
      <header className="mb-6 flex justify-between items-center">
        <div>
           <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">Nastavenia</h1>
           <p className="text-slate-500 dark:text-slate-400 text-sm">Prispôsob si svoj denný prehľad.</p>
        </div>
        <div className="flex gap-2">
            <button 
                onClick={handleToggleTheme}
                className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full text-slate-500 dark:text-slate-400 hover:text-[#6466f1] dark:hover:text-[#6466f1] hover:border-[#6466f1] dark:hover:border-[#6466f1] transition-colors shadow-sm"
                title="Prepnúť tmavý režim"
            >
                {theme === 'dark' ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
            </button>
            <button 
            onClick={() => setShowProfileModal(true)}
            className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full text-slate-500 dark:text-slate-400 hover:text-[#6466f1] dark:hover:text-[#6466f1] hover:border-[#6466f1] dark:hover:border-[#6466f1] transition-colors shadow-sm"
            title="Profil a preferencie"
            >
            <SettingsIcon className="w-5 h-5" />
            </button>
        </div>
      </header>

      {/* Topics Section */}
      <div>
        <div className="flex justify-between items-end mb-6">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Sledované témy
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-bold bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
            {selectedIds.length} vybraných
          </span>
        </div>

        <div className="space-y-4">
          
          {/* TOP Selection Card */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-indigo-100 dark:border-indigo-900/50 shadow-sm overflow-hidden mb-6 transition-all duration-300">
            <button 
              onClick={() => setIsTopExpanded(!isTopExpanded)}
              className="w-full px-5 py-4 bg-gradient-to-r from-indigo-50 to-white dark:from-slate-800 dark:to-slate-900 border-b border-indigo-50 dark:border-slate-800 flex items-center justify-between"
            >
               <div className="flex items-center gap-2">
                 <span className="text-lg">🔥</span>
                 <h3 className="text-sm font-bold text-indigo-900 dark:text-indigo-300">TOP Výber</h3>
               </div>
               <div className="text-indigo-300 dark:text-slate-500">
                  {isTopExpanded ? <ChevronUpIcon className="w-5 h-5" /> : <ChevronDownIcon className="w-5 h-5" />}
               </div>
            </button>
            
            {isTopExpanded && (
              <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in slide-in-from-top-2">
                 {topTopics.map((topic) => {
                    const isSelected = selectedIds.includes(topic.id);
                    return (
                      <button
                        key={topic.id}
                        onClick={() => toggleTopic(topic.id)}
                        className={`
                          flex items-center justify-between p-3 rounded-lg border text-left transition-all
                          ${isSelected 
                            ? 'bg-[#6466f1] border-[#6466f1] text-white shadow-md' 
                            : 'bg-white dark:bg-slate-950 border-slate-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-900 text-slate-700 dark:text-slate-300'}
                        `}
                      >
                        <span className="text-xs font-bold">
                          {topic.name}
                        </span>
                        {isSelected && <CheckIcon className="w-3 h-3 text-white" />}
                      </button>
                    );
                 })}
              </div>
            )}
          </div>

          {/* Categories Accordions */}
          {Object.entries(groupedTopics).map(([category, topics]) => {
            const isExpanded = expandedCategories.includes(category);
            const selectedCount = topics.filter(t => selectedIds.includes(t.id)).length;
            const emoji = CATEGORY_EMOJIS[category] || '📂';
            
            return (
              <div key={category} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm transition-all duration-300">
                <button 
                  onClick={() => toggleCategory(category)}
                  className="w-full flex items-center justify-between p-5 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-3">
                     <span className="text-lg">{emoji}</span>
                     <span className={`text-sm font-bold ${selectedCount > 0 ? 'text-indigo-900 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-200'}`}>
                       {category}
                     </span>
                     {selectedCount > 0 && (
                        <span className="bg-indigo-100 dark:bg-indigo-900/50 text-[#6466f1] dark:text-indigo-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {selectedCount}
                        </span>
                     )}
                  </div>
                  <div className="text-slate-400 dark:text-slate-600">
                    {isExpanded ? <ChevronUpIcon className="w-5 h-5" /> : <ChevronDownIcon className="w-5 h-5" />}
                  </div>
                </button>
                
                {isExpanded && (
                  <div className="px-5 pb-5 pt-0 animate-in slide-in-from-top-2 duration-200">
                    <div className="h-px bg-slate-50 dark:bg-slate-800 mb-4"></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {topics.map((topic) => {
                        const isSelected = selectedIds.includes(topic.id);
                        return (
                          <button
                            key={topic.id}
                            onClick={() => toggleTopic(topic.id)}
                            className={`
                              flex items-center justify-between p-3 rounded-lg border text-left transition-all
                              ${isSelected 
                                ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-800 shadow-sm' 
                                : 'bg-white dark:bg-slate-950 border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'}
                            `}
                          >
                            <span className={`text-xs font-bold ${isSelected ? 'text-[#6466f1] dark:text-indigo-300' : 'text-slate-600 dark:text-slate-400'}`}>
                              {topic.name}
                            </span>
                            
                            <div className={`
                              w-5 h-5 rounded-full flex items-center justify-center transition-colors flex-shrink-0 ml-2
                              ${isSelected ? 'bg-[#6466f1]' : 'bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600'}
                            `}>
                              {isSelected && <CheckIcon className="w-3 h-3 text-white" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Disclaimer */}
      <div className="mt-6 mb-2 p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
          <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center leading-relaxed">
              Aplikácia využíva umelú inteligenciu na spracovanie verejne dostupných správ. 
              Neručíme za 100% presnosť údajov, hoci sa snažíme čerpať len z kvalitných zdrojov.
          </p>
      </div>
      
      {/* Sticky Bottom Action Button */}
      {selectedIds.length > 0 && onFinish && (
        <div className="fixed bottom-24 left-0 right-0 px-6 z-40 animate-in slide-in-from-bottom-4 duration-500 pointer-events-none flex justify-center">
            <div className="w-full max-w-md pointer-events-auto">
              <button 
                onClick={onFinish}
                className="w-full bg-[#6466f1] text-white font-bold py-4 px-6 rounded-xl shadow-xl shadow-indigo-500/30 flex items-center justify-center gap-3 transform active:scale-95 transition-all hover:bg-indigo-600 dark:hover:bg-[#6466f1]"
              >
                <SparklesIcon className="w-5 h-5 text-indigo-100" />
                <span>Generovať prehľad</span>
              </button>
            </div>
        </div>
      )}

      {/* Profile Settings Modal */}
      {showProfileModal && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowProfileModal(false)}></div>
            <div className="bg-white dark:bg-slate-900 w-full max-w-sm max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl relative z-10 animate-in zoom-in-95 duration-200 no-scrollbar">
               
               <div className="bg-slate-50 dark:bg-slate-950 p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center sticky top-0 z-20">
                  <h3 className="font-bold text-slate-900 dark:text-white">Profil a preferencie</h3>
                  <div className="flex gap-2">
                    <div className="relative">
                        <button 
                            onClick={() => setShowMoreMenu(!showMoreMenu)}
                            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-800"
                        >
                            <MoreHorizontalIcon className="w-5 h-5" />
                        </button>
                        {showMoreMenu && (
                            <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 shadow-xl rounded-xl overflow-hidden z-30 animate-in fade-in zoom-in-95">
                                <button 
                                    onClick={() => { setLegalMode('terms'); setShowMoreMenu(false); }} 
                                    className="block w-full text-left px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                                >
                                    Podmienky (EULA)
                                </button>
                                <button 
                                    onClick={() => { setLegalMode('privacy'); setShowMoreMenu(false); }} 
                                    className="block w-full text-left px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                                >
                                    Ochrana súkromia
                                </button>
                                <button 
                                    onClick={() => { setLegalMode('support'); setShowMoreMenu(false); }} 
                                    className="block w-full text-left px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                                >
                                    Kontaktovať podporu
                                </button>
                                <div className="h-px bg-slate-100 dark:bg-slate-800 my-1"></div>
                                <button 
                                    onClick={() => {
                                        setShowMoreMenu(false);
                                        handleHardReset();
                                    }}
                                    className="w-full text-left px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                                >
                                    Vymazať všetky dáta
                                </button>
                            </div>
                        )}
                    </div>
                    <button onClick={() => setShowProfileModal(false)} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-800">
                        <XIcon className="w-5 h-5" />
                    </button>
                  </div>
               </div>

               <div className="p-4 sm:p-5 space-y-4" onClick={() => setShowMoreMenu(false)}>
                  {/* Subscription Status Badge */}
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 flex justify-between items-center">
                      <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Členstvo</p>
                          <p className="font-bold text-sm text-slate-900 dark:text-white">
                              {subStatus === SubscriptionStatus.LIFETIME ? 'Lifetime (Navždy)' : 
                               subStatus === SubscriptionStatus.ACTIVE ? 'Premium' : 
                               'Skúšobná verzia'}
                          </p>
                      </div>
                      {subStatus === SubscriptionStatus.LIFETIME && <SparklesIcon className="w-5 h-5 text-[#6466f1]" />}
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
                      <MapPinIcon className="w-3.5 h-3.5 text-[#6466f1]" />
                      MOJA LOKALITA
                    </label>
                    <input 
                      type="text" 
                      value={city}
                      onChange={handleCityChange}
                      placeholder="napr. Bratislava"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-[#6466f1] outline-none transition-all"
                    />
                  </div>
                  
                  {/* Notifications */}
                  <div>
                     <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
                        <BellIcon className="w-3.5 h-3.5 text-[#6466f1]" />
                        NOTIFIKÁCIE
                     </label>
                     <div className="relative">
                        <select
                           value={notificationFreq}
                           onChange={handleNotificationChange}
                           className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2.5 text-sm text-slate-900 dark:text-white font-medium appearance-none outline-none focus:ring-2 focus:ring-[#6466f1] relative z-10 pr-8"
                        >
                           <option value={NotificationFrequency.DAILY}>Každý deň (09:00)</option>
                           <option value={NotificationFrequency.EVERY_OTHER}>Každý druhý deň</option>
                           <option value={NotificationFrequency.THREE_TIMES_DAY}>3x denne (9, 13, 18)</option>
                           <option value={NotificationFrequency.WEEKLY}>Raz za týždeň (Pondelok)</option>
                           <option value={NotificationFrequency.OFF}>Vypnuté</option>
                        </select>
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none z-10">
                           <ChevronDownIcon className="w-3.5 h-3.5" />
                        </div>
                     </div>
                  </div>

                  {/* Persona */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
                      <UserIcon className="w-3.5 h-3.5 text-[#6466f1]" />
                      OSOBNOSŤ AI (MOOD)
                    </label>
                    <div className="relative">
                      <select 
                        value={currentPersona} 
                        onChange={handlePersonaChange}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2.5 text-sm text-slate-900 dark:text-white font-medium appearance-none outline-none focus:ring-2 focus:ring-[#6466f1] relative z-10 pr-8"
                      >
                        {Object.entries(PERSONA_UI_DATA).map(([key, data]) => (
                          <option key={key} value={key}>
                            {data.label}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none z-10">
                        <ChevronDownIcon className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>

                  {/* DATA BACKUP & RESTORE */}
                  <div className="border-t border-slate-100 dark:border-slate-800 pt-4 mt-2">
                     <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
                        <CloudIcon className="w-3.5 h-3.5 text-[#6466f1]" />
                        SPRÁVA DÁT
                     </label>
                     <div className="flex gap-2">
                        <button 
                           onClick={handleExportData}
                           className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold py-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        >
                           Zálohovať
                        </button>
                        <button 
                           onClick={handleImportClick}
                           className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold py-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        >
                           Obnoviť
                        </button>
                        <input 
                           type="file" 
                           ref={fileInputRef} 
                           onChange={handleFileChange} 
                           accept=".json" 
                           className="hidden" 
                        />
                     </div>
                  </div>

                  <div className="pt-2">
                     <button 
                       onClick={() => setShowProfileModal(false)}
                       className="w-full bg-slate-900 dark:bg-slate-800 text-white font-bold py-2.5 rounded-xl hover:bg-slate-800 dark:hover:bg-slate-700 transition-colors text-sm"
                     >
                       Hotovo
                     </button>
                  </div>

                  {/* SECRET CODE UNLOCK (Subtle & Below Done) */}
                  {subStatus !== SubscriptionStatus.LIFETIME && (
                    <div className="pt-1 text-center border-t border-slate-50 dark:border-slate-800 mt-2">
                        {!showSecretInput ? (
                            <div className="flex justify-center items-center px-2">
                                <button 
                                    onClick={() => setShowSecretInput(true)}
                                    className="text-[9px] font-bold text-slate-300 dark:text-slate-700 uppercase tracking-widest hover:text-indigo-400 transition-colors py-2"
                                >
                                    Mám kód
                                </button>
                            </div>
                        ) : (
                            <div className="animate-in fade-in slide-in-from-bottom-2 pt-2">
                                <div className="flex gap-2 mb-2">
                                    <input 
                                        type="text"
                                        value={secretCode}
                                        onChange={(e) => {
                                            setSecretCode(e.target.value);
                                            setSecretMessage(null);
                                        }}
                                        placeholder="Kód..."
                                        className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-[#6466f1]"
                                        autoFocus
                                    />
                                    <button 
                                        onClick={handleSecretCodeSubmit}
                                        className="bg-[#6466f1] text-white text-xs font-bold px-3 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                                    >
                                        OK
                                    </button>
                                </div>
                                {secretMessage && (
                                    <p className={`text-[10px] font-bold ${secretMessage.type === 'success' ? 'text-emerald-500' : 'text-red-500'}`}>
                                        {secretMessage.text}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                  )}
                  
               </div>
            </div>
         </div>
      )}

      {/* Legal Modal */}
      {legalMode && (
          <LegalModal 
            mode={legalMode} 
            onClose={() => setLegalMode(null)} 
          />
      )}

    </div>
    );
};

export default SettingsPage;
