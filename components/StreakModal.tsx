
import React from 'react';
import { UserProfile } from '../types';
import { XIcon, SparklesIcon } from './Icons';

interface StreakModalProps {
  profile: UserProfile;
  onClose: () => void;
}

const StreakModal: React.FC<StreakModalProps> = ({ profile, onClose }) => {
  const days = ['Po', 'Ut', 'St', 'Št', 'Pi', 'So', 'Ne'];
  const today = new Date();
  const currentMonth = today.getMonth(); // 0-11
  const currentYear = today.getFullYear();

  // Helper to generate calendar grid
  const getDaysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (month: number, year: number) => {
      let day = new Date(year, month, 1).getDay();
      // Convert Sun(0)...Sat(6) to Mon(0)...Sun(6)
      return day === 0 ? 6 : day - 1;
  };

  const numDays = getDaysInMonth(currentMonth, currentYear);
  const startOffset = getFirstDayOfMonth(currentMonth, currentYear);
  
  const historySet = new Set(profile.activityHistory || []);

  // 1. Correct Slovak Grammar for "Days"
  const getDayLabel = (count: number) => {
      if (count === 1) return 'deň';
      if (count >= 2 && count <= 4) return 'dni';
      return 'dní';
  };

  // 2. Dynamic Motivational Messages
  const getStreakMessage = (streak: number) => {
      if (streak === 0) return "Tvoj prvý krok začína dnes.";
      if (streak === 1) return "Skvelý štart! Zajtra pokračuj.";
      if (streak === 2) return "Dva dni v rade. Ide ti to!";
      if (streak === 3) return "Už sa rozbiehaš 🔥";
      if (streak <= 6) return "Buduješ si silný návyk.";
      if (streak === 7) return "Týždeň v kuse! Gratulujem.";
      if (streak <= 13) return "Si na nezastavenie.";
      if (streak <= 20) return "Tvoja disciplína je obdivuhodná.";
      if (streak <= 30) return "Mesiac vzdelávania. Rešpekt.";
      return "Si absolútna legenda.";
  };

  const renderCalendarDays = () => {
      const grid = [];
      
      // Empty slots for start offset
      for (let i = 0; i < startOffset; i++) {
          grid.push(<div key={`empty-${i}`} className="h-8 w-8"></div>);
      }

      // Actual days
      for (let day = 1; day <= numDays; day++) {
          const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const isActive = historySet.has(dateStr);
          const isToday = day === today.getDate();

          grid.push(
              <div key={day} className="flex flex-col items-center justify-center h-9 w-full">
                  <div className={`
                      h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all
                      ${isActive 
                        ? 'bg-[#6466f1] text-white shadow-md shadow-indigo-500/30' 
                        : isToday 
                            ? 'border-2 border-[#6466f1] text-[#6466f1]'
                            : 'text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }
                  `}>
                      {day}
                  </div>
              </div>
          );
      }
      return grid;
  };

  const longestStreakValue = profile.longestStreak || profile.streak;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-6">
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose}></div>
        
        <div className="w-full max-w-sm rounded-[2rem] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-200 bg-white dark:bg-slate-900 border border-white/20 dark:border-slate-800">
            
            {/* Background Blob Effect */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none transform translate-x-1/2 -translate-y-1/4"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none transform -translate-x-1/2 translate-y-1/4"></div>

            {/* Close Button */}
            <div className="absolute top-4 right-4 z-20">
                <button onClick={onClose} className="bg-white/50 dark:bg-black/20 p-2 rounded-full hover:bg-white dark:hover:bg-slate-800 transition-colors backdrop-blur-md">
                    <XIcon className="w-5 h-5 text-slate-500" />
                </button>
            </div>

            <div className="px-6 py-8 relative z-10">
                <div className="text-center mb-8 pt-4">
                    <div className="relative inline-block">
                        <div className="absolute inset-0 bg-amber-400/20 blur-xl rounded-full"></div>
                        <span className="relative text-6xl block transform hover:scale-110 transition-transform cursor-default">🔥</span>
                    </div>
                    
                    <h2 className="text-5xl font-black text-slate-900 dark:text-white mb-2 mt-4 tracking-tight">
                        {profile.streak} <span className="text-lg text-slate-400 font-bold uppercase tracking-widest align-baseline">{getDayLabel(profile.streak)}</span>
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">{getStreakMessage(profile.streak)}</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-slate-50/80 dark:bg-slate-950/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 text-center backdrop-blur-sm">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Rekord</p>
                        <p className="text-xl font-black text-slate-900 dark:text-white">
                            {longestStreakValue} {getDayLabel(longestStreakValue)}
                        </p>
                    </div>
                    <div className="bg-slate-50/80 dark:bg-slate-950/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 text-center backdrop-blur-sm">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Celkovo</p>
                        <p className="text-xl font-black text-slate-900 dark:text-white">{profile.totalDigests}</p>
                    </div>
                </div>

                {/* Calendar */}
                <div className="bg-white/50 dark:bg-slate-800/30 rounded-3xl p-5 border border-slate-100 dark:border-slate-800">
                    <div className="flex justify-between items-center mb-4 px-2">
                        <h3 className="font-bold text-slate-900 dark:text-white capitalize text-sm">
                            {today.toLocaleDateString('sk-SK', { month: 'long', year: 'numeric' })}
                        </h3>
                    </div>
                    
                    {/* Days Header */}
                    <div className="grid grid-cols-7 mb-3 text-center">
                        {days.map(d => (
                            <div key={d} className="text-[10px] font-bold text-slate-400 uppercase">
                                {d}
                            </div>
                        ))}
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-y-1">
                        {renderCalendarDays()}
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default StreakModal;
