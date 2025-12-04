
import React, { useEffect, useState } from 'react';
import { WeatherData } from '../services/weatherService';
import { fetchNameDay } from '../services/nameDayService';
import { WeatherSunIcon, WeatherCloudIcon, WeatherRainIcon, XIcon, MapPinIcon } from './Icons';

interface WeatherModalProps {
  weather: WeatherData | null;
  city: string;
  onClose: () => void;
}

const WeatherModal: React.FC<WeatherModalProps> = ({ weather, city, onClose }) => {
  const [nameDay, setNameDay] = useState<string>('');
  const [loadingName, setLoadingName] = useState(true);

  useEffect(() => {
    const loadNameDay = async () => {
        const name = await fetchNameDay();
        setNameDay(name);
        setLoadingName(false);
    };
    loadNameDay();
  }, []);

  const getWeatherIcon = (w: WeatherData) => {
      if (w.weatherCode >= 51) return <WeatherRainIcon className="w-24 h-24 text-indigo-400 drop-shadow-xl" />;
      if (w.weatherCode > 2) return <WeatherCloudIcon className="w-24 h-24 text-slate-300 drop-shadow-xl" />;
      return <WeatherSunIcon className="w-24 h-24 text-amber-400 drop-shadow-xl" />;
  };

  const getWeatherDescription = (code: number) => {
      if (code >= 95) return 'Búrka';
      if (code >= 71) return 'Sneženie';
      if (code >= 51) return 'Dážď';
      if (code >= 45) return 'Hmla';
      if (code > 2) return 'Oblačno';
      if (code >= 1) return 'Polooblačno';
      return 'Slnečno';
  };

  const currentDate = new Date().toLocaleDateString('sk-SK', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-6">
        {/* Animated Backdrop */}
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose}></div>
        
        {/* Modal Content */}
        <div className="w-full max-w-sm rounded-[2rem] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-300 bg-gradient-to-br from-white to-slate-100 dark:from-slate-900 dark:to-slate-950 border border-white/20 dark:border-slate-800">
            
            {/* Background Blob Effect */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

            {/* Header */}
            <div className="flex justify-between items-start p-6 pb-0 relative z-10">
                <div className="flex items-center gap-2 bg-white/50 dark:bg-black/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 dark:border-white/5">
                    <MapPinIcon className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-600 dark:text-slate-300">{city || 'Slovensko'}</span>
                </div>
                <button 
                    onClick={onClose} 
                    className="bg-white/50 dark:bg-black/20 p-2 rounded-full hover:bg-white dark:hover:bg-slate-800 transition-colors backdrop-blur-md"
                >
                    <XIcon className="w-5 h-5 text-slate-500" />
                </button>
            </div>

            <div className="px-6 pb-8 text-center relative z-10">
                
                {/* Weather Info */}
                {weather ? (
                    <div className="py-6 flex flex-col items-center">
                        <div className="mb-2 animate-in fade-in zoom-in duration-700 delay-100">
                            {getWeatherIcon(weather)}
                        </div>
                        <h1 className="text-7xl font-black text-slate-900 dark:text-white tracking-tighter leading-none mb-1 drop-shadow-sm">
                            {Math.round(weather.temperature)}°
                        </h1>
                        <p className="text-lg font-medium text-slate-500 dark:text-slate-400">
                            {getWeatherDescription(weather.weatherCode)}
                        </p>
                    </div>
                ) : (
                    <div className="py-20 flex flex-col items-center">
                        <div className="w-16 h-16 border-4 border-slate-200 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
                         <p className="text-slate-400 text-sm">Načítavam počasie...</p>
                    </div>
                )}

                {/* Date & Name Day Card */}
                <div className="mt-4">
                    <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-md rounded-2xl p-1 shadow-sm border border-white/40 dark:border-slate-700">
                        <div className="bg-gradient-to-r from-indigo-50/50 to-purple-50/50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-5 border border-indigo-100/50 dark:border-indigo-900/30">
                            <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-1">{currentDate}</p>
                            
                            <div className="flex flex-col items-center mt-2">
                                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">Dnes oslavuje</p>
                                {loadingName ? (
                                    <div className="h-8 w-32 bg-indigo-200/50 dark:bg-indigo-800/50 rounded animate-pulse"></div>
                                ) : (
                                    <h3 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-300 dark:to-purple-300 tracking-tight">
                                        {nameDay || "Slovensko"}
                                    </h3>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </div>
  );
};

export default WeatherModal;
