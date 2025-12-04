
import React from 'react';
import { DigestSection } from '../types';
import { ChatIcon, BookmarkIcon, BookmarkSolidIcon, ExternalLinkIcon } from './Icons';
import { CATEGORY_EMOJIS, getCategoryForTags } from '../constants';

interface DigestCardProps {
  section: DigestSection;
  index: number;
  onAskMore?: (section: DigestSection) => void;
  onTagClick?: (tag: string) => void;
  onToggleSave?: (section: DigestSection) => void;
  isSaved?: boolean;
  className?: string;
}

const DigestCard: React.FC<DigestCardProps> = ({ section, index, onAskMore, onTagClick, onToggleSave, isSaved, className = "mb-6" }) => {
  
  // Helper to extract domain for display
  const getDomain = (url?: string) => {
    if (!url) return '';
    try {
      const hostname = new URL(url).hostname;
      return hostname.replace('www.', '');
    } catch {
      return 'zdroj';
    }
  };

  // Determine Category Badge Emoji
  const categoryName = getCategoryForTags(section.tags);
  const categoryEmoji = CATEGORY_EMOJIS[categoryName] || '🔹';

  return (
    <div className={`bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-all duration-300 hover:shadow-md group ${className}`}>
      
      {/* Header with Badge */}
      <div className="relative h-12 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 flex items-center justify-between px-5">
          
          {/* Tags (Left) with Separate Badge */}
          <div className="flex items-center gap-2 pr-4">
             {/* Independent Category Badge */}
             <div className="flex-shrink-0 w-6 h-6 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-sm shadow-sm">
                {categoryEmoji}
             </div>
             
             {/* Text Tags */}
             <div className="flex flex-wrap gap-2">
                {section.tags.map((tag, i) => (
                  <button 
                    key={i} 
                    onClick={(e) => {
                      e.stopPropagation();
                      onTagClick && onTagClick(tag);
                    }}
                    className="px-2 py-0.5 bg-transparent text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold tracking-wide rounded hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-[#6466f1] dark:hover:text-indigo-400 transition-colors"
                  >
                    {tag}
                  </button>
                ))}
             </div>
          </div>

          {/* Controls (Right) */}
          <div className="flex items-center gap-2">
             {/* Bookmark Button */}
             {onToggleSave && (
               <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleSave(section);
                }}
                className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all ${isSaved ? 'text-[#6466f1] bg-indigo-50 dark:bg-indigo-900/30' : 'text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300'}`}
                title={isSaved ? "Odstrániť z uložených" : "Uložiť"}
               >
                 {isSaved ? <BookmarkSolidIcon className="w-4 h-4" /> : <BookmarkIcon className="w-4 h-4" />}
               </button>
             )}
             
             {/* Index Badge */}
             <div className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-bold w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700">
                #{index + 1}
             </div>
          </div>
      </div>

      {/* Content */}
      <div className="px-5 py-5 space-y-5">
         <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 leading-tight">
            {section.title}
         </h2>

         <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-4">
            <div>
               <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-200 dark:shadow-none"></span>
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Čo je nové</span>
               </div>
               <p className="pl-4 border-l border-emerald-100 dark:border-emerald-900/50">{section.whatIsNew}</p>
            </div>
            {section.whatChanged && (
              <div>
                <div className="flex items-center gap-2 mb-1">
                   <span className="w-2 h-2 rounded-full bg-orange-500 shadow-sm shadow-orange-200 dark:shadow-none"></span>
                   <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Čo sa zmenilo</span>
                </div>
                <p className="pl-4 border-l border-orange-100 dark:border-orange-900/50">{section.whatChanged}</p>
              </div>
            )}
         </div>

         <div className="bg-slate-50 dark:bg-slate-950/50 rounded-lg p-4 border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-3">Kľúčové body</span>
            <ul className="space-y-2">
               {section.keyPoints && section.keyPoints.length > 0 ? (
                 section.keyPoints.map((point, i) => (
                    <li key={i} className="flex gap-2 text-sm text-slate-700 dark:text-slate-300">
                       <span className="text-indigo-400 dark:text-indigo-500 font-bold mt-0.5">•</span>
                       <span className="leading-snug">{point}</span>
                    </li>
                 ))
               ) : (
                 <li className="text-sm text-slate-500 italic">Bez ďalších detailov.</li>
               )}
            </ul>
         </div>
      </div>

      {/* Footer Actions */}
      <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 flex justify-between items-center">
         <div className="flex items-center gap-3">
            {section.sourceLink && (
               <a 
                 href={section.sourceLink}
                 target="_blank"
                 rel="noopener noreferrer"
                 className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-[#6466f1] dark:hover:text-[#6466f1] transition-colors"
               >
                  <ExternalLinkIcon className="w-3 h-3" />
                  {getDomain(section.sourceLink)}
               </a>
            )}
         </div>
         
         {onAskMore && (
           <button 
             onClick={(e) => {
               e.stopPropagation();
               onAskMore(section);
             }}
             className="flex items-center gap-1.5 text-xs font-bold text-[#6466f1] dark:text-indigo-300 bg-white dark:bg-slate-800 border border-indigo-100 dark:border-slate-700 hover:bg-indigo-50 dark:hover:bg-slate-700 px-3 py-1.5 rounded-lg transition-colors shadow-sm"
           >
              <ChatIcon className="w-3.5 h-3.5" />
              Opýtať sa AI
           </button>
         )}
      </div>

    </div>
  );
};

export default DigestCard;
