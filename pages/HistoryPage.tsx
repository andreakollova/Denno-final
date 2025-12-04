
import React, { useEffect, useState } from 'react';
import { DailyDigest, DigestSection, SavedInsight, UserNote } from '../types';
import { getDigests, getSavedInsights, removeInsight, getNotes, saveNote, deleteNote } from '../services/storageService';
import DigestCard from '../components/DigestCard';
import ChatModal from '../components/ChatModal';
import { CollectionIcon, BookmarkSolidIcon, NewspaperIcon, ChevronDownIcon, ChevronUpIcon, PencilIcon, TrashIcon, PlusCircleIcon } from '../components/Icons';

interface HistoryPageProps {
  onBack: () => void;
}

type ViewMode = 'saved' | 'digests' | 'notes';

const HistoryPage: React.FC<HistoryPageProps> = ({ onBack }) => {
  // Changed default view mode to 'saved' (Library)
  const [viewMode, setViewMode] = useState<ViewMode>('saved');
  
  // Digests State
  const [digests, setDigests] = useState<DailyDigest[]>([]);
  const [selectedDigest, setSelectedDigest] = useState<DailyDigest | null>(null);
  
  // Saved Insights State
  const [savedInsights, setSavedInsights] = useState<SavedInsight[]>([]);
  const [expandedInsightId, setExpandedInsightId] = useState<string | null>(null);

  // Notes State
  const [notes, setNotes] = useState<UserNote[]>([]);
  const [newNoteText, setNewNoteText] = useState('');

  // Common State
  const [activeChatSection, setActiveChatSection] = useState<DigestSection | null>(null);

  useEffect(() => {
    setDigests(getDigests());
    setSavedInsights(getSavedInsights());
    setNotes(getNotes());
  }, [viewMode]); 

  const handleRemoveSaved = (id: string) => {
    removeInsight(id);
    setSavedInsights(prev => prev.filter(i => i.id !== id));
  };

  const handleAddNote = () => {
    if (!newNoteText.trim()) return;
    saveNote(newNoteText);
    setNotes(getNotes());
    setNewNoteText('');
  };

  const handleDeleteNote = (id: string) => {
    deleteNote(id);
    setNotes(prev => prev.filter(n => n.id !== id));
  };

  // --- DETAIL VIEW FOR DIGEST ---
  if (selectedDigest) {
    const formattedDate = new Date(selectedDigest.date).toLocaleDateString('sk-SK', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long' 
    });

    return (
      <>
        <div className="animate-in slide-in-from-right duration-300 bg-white dark:bg-slate-950 min-h-screen pb-24">
          <div className="sticky top-0 z-20 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 px-4 py-4 flex items-center shadow-sm">
            <button 
              onClick={() => setSelectedDigest(null)}
              className="p-2 -ml-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <div className="ml-2 overflow-hidden">
                {/* Increased spacing to mb-2 (8px) as requested */}
                <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">
                  {formattedDate}
                </h2>
                <p className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">{selectedDigest.mainTitle}</p>
            </div>
          </div>
          
          <div className="px-6 py-6">
            <div className="flex items-center gap-2 mb-4">
                 <span className="w-2 h-2 rounded-full bg-[#6466f1]"></span>
                 <p className="text-xs font-bold text-[#6466f1] uppercase tracking-widest">{formattedDate}</p>
            </div>
            
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white leading-tight mb-6">
              {selectedDigest.mainTitle}
            </h1>
            
            {/* Busy Read Summary for History */}
             <div className="mb-8 bg-slate-50 dark:bg-slate-900 p-5 rounded-xl border border-slate-100 dark:border-slate-800">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                  Rýchly súhrn
                </h3>
                <ul className="space-y-2">
                    {selectedDigest.busyRead.map((item, i) => (
                        <li key={i} className="text-sm text-slate-700 dark:text-slate-300 flex gap-2">
                             <span className="text-[#6466f1]">•</span>
                             {item.title}
                        </li>
                    ))}
                </ul>
            </div>

            <div className="">
                {selectedDigest.sections.map((section, index) => (
                <DigestCard 
                    key={index} 
                    section={section} 
                    index={index} 
                    onAskMore={setActiveChatSection}
                />
                ))}
            </div>
          </div>
        </div>

        {activeChatSection && (
          <ChatModal 
            section={activeChatSection} 
            onClose={() => setActiveChatSection(null)} 
          />
        )}
      </>
    );
  }

  // --- MAIN LIST VIEW (TABS) ---
  return (
    <div className="px-6 py-8 animate-in fade-in pb-32">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Uložené</h1>
      </div>

      {/* Modern Tabs - Swapped Order */}
      <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl mb-8">
        <button 
           onClick={() => setViewMode('saved')}
           className={`flex-1 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${viewMode === 'saved' ? 'bg-white dark:bg-slate-800 text-[#6466f1] dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
        >
           <BookmarkSolidIcon className="w-4 h-4" />
           Knižnica
        </button>
        <button 
           onClick={() => setViewMode('digests')}
           className={`flex-1 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${viewMode === 'digests' ? 'bg-white dark:bg-slate-800 text-[#6466f1] dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
        >
           <NewspaperIcon className="w-4 h-4" />
           Prehľady
        </button>
        <button 
           onClick={() => setViewMode('notes')}
           className={`flex-1 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${viewMode === 'notes' ? 'bg-white dark:bg-slate-800 text-[#6466f1] dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
        >
           <PencilIcon className="w-4 h-4" />
           Myšlienky
        </button>
      </div>

      {/* View: Saved Insights Library (Now First) */}
      {viewMode === 'saved' && (
         <>
           {savedInsights.length === 0 ? (
             <div className="text-center py-16 bg-slate-50 dark:bg-slate-900 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
               <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-200 dark:border-slate-700">
                  <BookmarkSolidIcon className="w-5 h-5 text-slate-300 dark:text-slate-500" />
               </div>
               <p className="text-slate-500 dark:text-slate-400 font-bold text-sm">Knižnica je prázdna</p>
               <p className="text-xs text-slate-400 mt-1">Ukladaj si karty z denného prehľadu.</p>
             </div>
           ) : (
             <div className="space-y-4">
                {savedInsights.map((item, index) => {
                  const isExpanded = expandedInsightId === item.id;
                  return (
                    <div key={item.id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-all hover:shadow-md">
                       <button
                         onClick={() => setExpandedInsightId(isExpanded ? null : item.id)}
                         className="w-full flex items-center justify-between p-4 text-left bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                       >
                          <div className="flex-1 pr-4">
                             <div className="flex items-center gap-2 mb-1.5">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                  {new Date(item.sourceDigestDate).toLocaleDateString('sk-SK')}
                                </span>
                             </div>
                             <h3 className={`font-bold text-slate-900 dark:text-white text-sm leading-snug ${isExpanded ? 'text-[#6466f1] dark:text-indigo-400' : ''}`}>
                               {item.section.title}
                             </h3>
                          </div>
                          <div className="text-slate-400 flex-shrink-0 ml-2 bg-slate-50 dark:bg-slate-800 p-1.5 rounded-lg border border-slate-100 dark:border-slate-700">
                             {isExpanded ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />}
                          </div>
                       </button>

                       {isExpanded && (
                          <div className="p-3 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 animate-in slide-in-from-top-2">
                              {/* Embed the DigestCard without default margins */}
                              <DigestCard 
                                 section={item.section} 
                                 index={index} 
                                 onAskMore={setActiveChatSection}
                                 onToggleSave={() => handleRemoveSaved(item.id)}
                                 isSaved={true}
                                 className="mb-0 border-none shadow-none"
                              />
                          </div>
                       )}
                    </div>
                  );
                })}
             </div>
           )}
         </>
      )}

      {/* View: Digests List */}
      {viewMode === 'digests' && (
        <>
          {digests.length === 0 ? (
            <div className="text-center py-16 bg-slate-50 dark:bg-slate-900 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
              <p className="text-slate-400 font-medium text-sm">Zatiaľ žiadne denné prehľady.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {digests.map((digest) => (
                <button
                  key={digest.id}
                  onClick={() => setSelectedDigest(digest)}
                  className="w-full text-left bg-white dark:bg-slate-900 p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-800 transition-all group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-bl-xl -mr-6 -mt-6 transition-transform group-hover:scale-150 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/40"></div>
                  
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-bold text-[#6466f1] dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded-md uppercase tracking-wider">
                        {new Date(digest.date).toLocaleDateString('sk-SK')}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-2 leading-tight mb-2 group-hover:text-indigo-900 dark:group-hover:text-indigo-300 transition-colors">
                      {digest.mainTitle}
                    </h3>
                    <p className="text-slate-400 text-xs line-clamp-1 flex items-center">
                      <span className="w-1.5 h-1.5 bg-slate-300 dark:bg-slate-600 rounded-full mr-2"></span>
                      {digest.sections.length} tém
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {/* View: User Notes (Myšlienky) */}
      {viewMode === 'notes' && (
        <>
           {/* Add Note Input */}
           <div className="mb-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm focus-within:ring-2 focus-within:ring-indigo-100 dark:focus-within:ring-indigo-900 transition-all">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2 block">Nová myšlienka</label>
              <textarea
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                placeholder="Zapíš si postreh, nápad alebo dôležitú informáciu..."
                className="w-full text-sm text-slate-700 dark:text-slate-300 placeholder-slate-400 dark:placeholder-slate-600 bg-transparent outline-none resize-none min-h-[80px]"
              />
              <div className="flex justify-end mt-2">
                 <button 
                   onClick={handleAddNote}
                   disabled={!newNoteText.trim()}
                   className="bg-[#6466f1] text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                 >
                   <PlusCircleIcon className="w-4 h-4" />
                   Uložiť
                 </button>
              </div>
           </div>

           {/* Notes List */}
           {notes.length === 0 ? (
             <div className="text-center py-12">
               <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3">
                  <PencilIcon className="w-5 h-5 text-slate-300 dark:text-slate-500" />
               </div>
               <p className="text-slate-400 text-sm">Zatiaľ žiadne poznámky.</p>
             </div>
           ) : (
             <div className="space-y-4">
               {notes.map((note) => (
                 <div key={note.id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-all group relative">
                    <div className="flex justify-between items-start mb-3">
                       <span className="text-[10px] font-bold text-[#6466f1] dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded-md">
                         {new Date(note.createdAt).toLocaleDateString('sk-SK')}
                       </span>
                       <button 
                         onClick={() => handleDeleteNote(note.id)}
                         className="text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 p-1.5 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                         title="Vymazať"
                       >
                         <TrashIcon className="w-4 h-4" />
                       </button>
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap font-medium">
                      {note.text}
                    </p>
                 </div>
               ))}
             </div>
           )}
        </>
      )}

      {activeChatSection && (
          <ChatModal 
            section={activeChatSection} 
            onClose={() => setActiveChatSection(null)} 
          />
      )}

    </div>
  );
};

export default HistoryPage;
