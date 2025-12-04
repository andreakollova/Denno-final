
import React from 'react';
import { WeatherData } from '../services/weatherService';
import { UserProfile } from '../types';
import { WeatherSunIcon, WeatherCloudIcon, WeatherRainIcon } from './Icons';

interface HeaderProps {
  weather: WeatherData | null;
  profile: UserProfile;
  onLogoClick?: () => void;
  onWeatherClick?: () => void;
  onStreakClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ weather, profile, onLogoClick, onWeatherClick, onStreakClick }) => {
  
  const getWeatherIcon = (w: WeatherData) => {
      if (w.weatherCode >= 51) return <WeatherRainIcon className="w-4 h-4 text-indigo-400 mb-0.5" />;
      if (w.weatherCode > 2) return <WeatherCloudIcon className="w-4 h-4 text-slate-400 dark:text-slate-500 mb-0.5" />;
      return <WeatherSunIcon className="w-4 h-4 text-amber-500" />;
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm px-4 py-3 flex items-center justify-between relative min-h-[60px] flex-shrink-0 transition-colors duration-300">
        
        {/* Logo Centered Absolutely */}
        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <button 
              onClick={onLogoClick} 
              className="cursor-pointer active:scale-95 transition-transform"
              title="Domov"
            >
              <img src="https://cdn.shopify.com/s/files/1/0804/4226/1839/files/54325342.png?v=1764569599" alt="Logo" className="h-10 w-auto object-contain dark:brightness-0 dark:invert" />
            </button>
        </div>
         
         {/* Left side: Empty for balance */}
         <div className="w-16"></div>

         {/* Right: Status Icons */}
         <div className="flex items-center justify-end gap-2 z-10 w-16">
            {weather && (
                <button 
                  onClick={onWeatherClick}
                  className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 px-2.5 py-1 rounded-full h-7 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors active:scale-95"
                >
                    {getWeatherIcon(weather)}
                    <span className="text-xs font-bold leading-none mt-0.5">{Math.round(weather.temperature)}°</span>
                </button>
            )}
            {profile.streak > 0 && (
               <button 
                 onClick={onStreakClick}
                 className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-500 border border-amber-100 dark:border-amber-900/30 px-2.5 py-1 rounded-full h-7 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors active:scale-95"
               >
                 <span className="leading-none text-sm">🔥</span>
                 <span className="leading-none mt-0.5">{profile.streak}</span>
               </button>
             )}
        </div>
    </header>
  );
};

export default Header;
