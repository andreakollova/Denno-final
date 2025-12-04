
import React, { useState, useEffect } from 'react';
import { AppTab, SubscriptionStatus } from './types';
import DigestPage from './pages/DigestPage';
import HistoryPage from './pages/HistoryPage';
import SettingsPage from './pages/SettingsPage';
import ToolsPage from './pages/ToolsPage';
import Header from './components/Header';
import SubscriptionModal from './components/SubscriptionModal';
import WeatherModal from './components/WeatherModal';
import StreakModal from './components/StreakModal';
import { NewspaperIcon, CollectionIcon, SettingsIcon, AcademicIcon } from './components/Icons';
import { getUserProfile, checkSubscriptionAccess } from './services/storageService';
import { fetchCoordinates, fetchWeather, WeatherData } from './services/weatherService';
import { checkAndTriggerNotification } from './services/notificationService';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.DIGEST);
  const [autoStartDigest, setAutoStartDigest] = useState(false);
  const [resetDigestTrigger, setResetDigestTrigger] = useState(0);
  
  // Global State for Header
  const [profile, setProfile] = useState(getUserProfile());
  const [weather, setWeather] = useState<WeatherData | null>(null);

  // Modals State
  const [showPaywall, setShowPaywall] = useState(false);
  const [showWeatherModal, setShowWeatherModal] = useState(false);
  const [showStreakModal, setShowStreakModal] = useState(false);
  
  useEffect(() => {
    // Initial profile load
    setProfile(getUserProfile());
  }, [activeTab]);

  useEffect(() => {
    // Initial Weather Load
    const loadWeather = async () => {
      const userCity = profile.city || 'Bratislava';
      try {
        const coords = await fetchCoordinates(userCity);
        if (coords) {
          const wData = await fetchWeather(coords.lat, coords.lon);
          setWeather(wData);
        }
      } catch (e) {
        console.warn("Weather error", e);
      }
    };
    loadWeather();
  }, [profile.city]); 

  // Notification Loop
  useEffect(() => {
    checkAndTriggerNotification();
    const interval = setInterval(() => {
      checkAndTriggerNotification();
    }, 60000);

    return () => clearInterval(interval);
  }, [profile.notificationFrequency]);

  const handleProfileUpdate = () => {
    setProfile(getUserProfile());
  };

  const handleSubscriptionSuccess = () => {
    setShowPaywall(false);
    setProfile(getUserProfile()); // Update profile to reflect Active state
  };

  const handleLogoClick = () => {
    setActiveTab(AppTab.DIGEST);
    setResetDigestTrigger(prev => prev + 1);
  };

  // Helper to gate specific features
  const validateAccess = (action: () => void) => {
    const hasAccess = checkSubscriptionAccess();
    if (hasAccess) {
      action();
    } else {
      setShowPaywall(true);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case AppTab.DIGEST:
        return <DigestPage 
                  changeTab={setActiveTab} 
                  autoStart={autoStartDigest}
                  onAutoStartConsumed={() => setAutoStartDigest(false)}
                  onProfileUpdate={handleProfileUpdate} 
                  validateAccess={validateAccess}
                  resetTrigger={resetDigestTrigger}
               />;
      case AppTab.HISTORY:
        return <HistoryPage onBack={() => setActiveTab(AppTab.DIGEST)} />;
      case AppTab.TOOLS:
        return <ToolsPage validateAccess={validateAccess} />;
      case AppTab.SETTINGS:
        return <SettingsPage onFinish={() => {
            setAutoStartDigest(true);
            setActiveTab(AppTab.DIGEST);
        }} onThemeChange={handleProfileUpdate} />;
      default:
        return <DigestPage changeTab={setActiveTab} validateAccess={validateAccess} />;
    }
  };

  return (
    <div className={`h-full w-full font-sans flex justify-center transition-colors duration-300 ${profile.theme === 'dark' ? 'dark bg-slate-950' : 'bg-slate-50'}`}>
      
      {/* Mobile App Container */}
      <div className="w-full max-w-md h-full bg-white dark:bg-slate-950 shadow-2xl shadow-slate-200/50 dark:shadow-black/50 flex flex-col overflow-hidden relative text-slate-900 dark:text-slate-100 transition-colors duration-300">
        
        {/* Paywall Modal */}
        {showPaywall && (
            <SubscriptionModal 
                status={profile.subscriptionStatus} 
                onSuccess={handleSubscriptionSuccess}
                onClose={() => setShowPaywall(false)}
            />
        )}

        {/* Weather Modal */}
        {showWeatherModal && (
            <WeatherModal 
                weather={weather}
                city={profile.city || 'Slovensko'}
                onClose={() => setShowWeatherModal(false)}
            />
        )}

        {/* Streak Modal */}
        {showStreakModal && (
            <StreakModal 
                profile={profile}
                onClose={() => setShowStreakModal(false)}
            />
        )}

        {/* Global Header */}
        <Header 
            weather={weather} 
            profile={profile} 
            onLogoClick={handleLogoClick}
            onWeatherClick={() => setShowWeatherModal(true)}
            onStreakClick={() => setShowStreakModal(true)}
        />

        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-y-auto no-scrollbar scroll-smooth bg-white dark:bg-slate-950 relative">
          {renderContent()}
        </main>

        {/* Bottom Navigation */}
        <nav className="flex-shrink-0 bg-white/90 dark:bg-slate-950/90 backdrop-blur-lg border-t border-slate-100 dark:border-slate-800 px-6 py-4 flex justify-between items-center z-50 transition-colors duration-300 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          
          <button 
            onClick={() => setActiveTab(AppTab.DIGEST)}
            className={`flex flex-col items-center space-y-1 transition-colors ${activeTab === AppTab.DIGEST ? 'text-[#6466f1]' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
          >
            <NewspaperIcon className="w-6 h-6" />
            <span className="text-[8px] font-medium uppercase tracking-wide">Prehľad</span>
          </button>

          <button 
            onClick={() => setActiveTab(AppTab.HISTORY)}
            className={`flex flex-col items-center space-y-1 transition-colors ${activeTab === AppTab.HISTORY ? 'text-[#6466f1]' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
          >
            <CollectionIcon className="w-6 h-6" />
            <span className="text-[8px] font-medium uppercase tracking-wide">Uložené</span>
          </button>
          
          <button 
            onClick={() => setActiveTab(AppTab.TOOLS)}
            className={`flex flex-col items-center space-y-1 transition-colors ${activeTab === AppTab.TOOLS ? 'text-[#6466f1]' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
          >
            <AcademicIcon className="w-7 h-7" />
            <span className="text-[8px] font-medium uppercase tracking-wide">Nástroje</span>
          </button>

          <button 
            onClick={() => setActiveTab(AppTab.SETTINGS)}
            className={`flex flex-col items-center space-y-1 transition-colors ${activeTab === AppTab.SETTINGS ? 'text-[#6466f1]' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
          >
            <SettingsIcon className="w-6 h-6" />
            <span className="text-[8px] font-medium uppercase tracking-wide">Nastavenia</span>
          </button>

        </nav>
      </div>

    </div>
  );
};

export default App;
