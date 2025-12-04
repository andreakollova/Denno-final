
import React from 'react';
import { XIcon, UserIcon } from './Icons';

export type LegalMode = 'terms' | 'privacy' | 'support';

interface LegalModalProps {
  mode: LegalMode;
  onClose: () => void;
}

const LegalModal: React.FC<LegalModalProps> = ({ mode, onClose }) => {
  
  const getTitle = () => {
    switch (mode) {
      case 'terms': return 'Podmienky používania (EULA)';
      case 'privacy': return 'Ochrana súkromia';
      case 'support': return 'Podpora';
      default: return '';
    }
  };

  const renderContent = () => {
    switch (mode) {
      case 'support':
        return (
          <div className="flex flex-col items-center justify-center py-8 text-center">
             <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-4">
                <UserIcon className="w-8 h-8 text-[#6466f1]" />
             </div>
             <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Potrebujete pomôcť?</h3>
             <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mx-auto mb-6">
               Ak máte akékoľvek otázky, problémy s aplikáciou alebo nápady na zlepšenie, napíšte nám.
             </p>
             
             <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 w-full mb-6">
                <p className="text-xs text-slate-400 uppercase font-bold tracking-widest mb-1">Email podpory</p>
                <a href="mailto:app@denno.sk" className="text-lg font-bold text-[#6466f1] hover:underline">
                  app@denno.sk
                </a>
             </div>

             <div className="text-xs text-slate-400">
               <p>Vývojár: <strong>Andrea Kollova</strong></p>
               <p className="mt-1">Prevádzkovateľ: <strong>DRIXTON s.r.o.</strong></p>
             </div>
          </div>
        );

      case 'terms':
        return (
          <div className="prose prose-sm dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 text-xs leading-relaxed space-y-4">
            <p><strong>Dátum účinnosti:</strong> 1. január 2025</p>
            
            <h4 className="font-bold text-slate-900 dark:text-white">1. Úvod</h4>
            <p>Tieto Podmienky používania ("Podmienky") upravujú váš prístup a používanie aplikácie "AI Denný Prehľad" ("Aplikácia"), ktorú prevádzkuje spoločnosť <strong>DRIXTON s.r.o.</strong> ("My", "Nás"). Inštaláciou alebo používaním Aplikácie súhlasíte s týmito Podmienkami.</p>

            <h4 className="font-bold text-slate-900 dark:text-white">2. Služby AI a Obsah</h4>
            <p>Aplikácia využíva umelú inteligenciu (Google Gemini API) na sumarizáciu verejne dostupných RSS kanálov. Aplikácia negeneruje vlastný žurnalistický obsah, ale len spracováva informácie tretích strán. <strong>Neručíme za 100% presnosť, úplnosť alebo aktuálnosť vygenerovaných zhrnutí.</strong> Používateľ by si mal vždy overiť dôležité informácie v pôvodnom zdroji.</p>

            <h4 className="font-bold text-slate-900 dark:text-white">3. Predplatné a Platby</h4>
            <p>Niektoré funkcie aplikácie môžu byť spoplatnené formou predplatného cez Apple App Store alebo Google Play Store. Platba bude naúčtovaná na váš účet pri potvrdení nákupu. Predplatné sa automaticky obnovuje, pokiaľ nie je zrušené aspoň 24 hodín pred koncom aktuálneho obdobia. Spravovať predplatné môžete v nastaveniach vášho účtu v obchode.</p>

            <h4 className="font-bold text-slate-900 dark:text-white">4. Obmedzenie zodpovednosti</h4>
            <p>Aplikácia je poskytovaná "tak ako je". DRIXTON s.r.o. nenesie zodpovednosť za žiadne priame, nepriame alebo následné škody vzniknuté používaním aplikácie, vrátane chýb v obsahu generovanom AI.</p>

            <h4 className="font-bold text-slate-900 dark:text-white">5. Zmeny podmienok</h4>
            <p>Vyhradzujeme si právo kedykoľvek zmeniť tieto Podmienky. Pokračovaním v používaní aplikácie po zmenách vyjadrujete súhlas s novými podmienkami.</p>
            
            <p className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <strong>Kontakt:</strong> app@denno.sk
            </p>
          </div>
        );

      case 'privacy':
        return (
          <div className="prose prose-sm dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 text-xs leading-relaxed space-y-4">
            <p><strong>Dátum účinnosti:</strong> 1. január 2025</p>
            
            <h4 className="font-bold text-slate-900 dark:text-white">1. Prehľad</h4>
            <p>Vaše súkromie je pre nás prioritou. Táto aplikácia je navrhnutá ako "Local-First", čo znamená, že väčšina vašich údajov (nastavenia, história prehľadov, poznámky) je uložená iba vo vašom zariadení a neodosiela sa na naše servery.</p>

            <h4 className="font-bold text-slate-900 dark:text-white">2. Údaje, ktoré spracovávame</h4>
            <ul className="list-disc pl-4 space-y-1">
              <li><strong>RSS Obsah:</strong> Obsah článkov je sťahovaný z verejných zdrojov a odosielaný do služby Google Gemini API na spracovanie (sumarizáciu). Tento proces je anonymný a Google tieto dáta nepoužíva na trénovanie modelov (v rámci Enterprise podmienok).</li>
              <li><strong>Analytika:</strong> Môžeme zbierať anonymné technické údaje o používaní aplikácie (pády aplikácie, frekvencia používania) na účely zlepšovania stability.</li>
            </ul>

            <h4 className="font-bold text-slate-900 dark:text-white">3. Tretie strany</h4>
            <p>Aplikácia využíva služby tretích strán:</p>
            <ul className="list-disc pl-4 space-y-1">
              <li><strong>Google Gemini API:</strong> Na spracovanie textu.</li>
              <li><strong>Open-Meteo:</strong> Na zobrazenie počasia (odosielajú sa len približné súradnice mesta, nie identita).</li>
            </ul>

            <h4 className="font-bold text-slate-900 dark:text-white">4. Vaše práva</h4>
            <p>Keďže dáta ukladáme lokálne, máte nad nimi plnú kontrolu. V nastaveniach aplikácie môžete kedykoľvek:</p>
            <ul className="list-disc pl-4 space-y-1">
              <li>Exportovať svoje dáta (Záloha).</li>
              <li>Vymazať všetky dáta (Hard Reset).</li>
            </ul>

            <h4 className="font-bold text-slate-900 dark:text-white">5. Kontakt</h4>
            <p>Prevádzkovateľom je <strong>DRIXTON s.r.o.</strong>. V prípade otázok ohľadom ochrany súkromia nás kontaktujte na <strong>app@denno.sk</strong>.</p>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="bg-white dark:bg-slate-900 w-full max-w-md max-h-[85vh] rounded-2xl shadow-2xl relative z-10 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-800">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
           <h2 className="font-bold text-slate-900 dark:text-white">{getTitle()}</h2>
           <button 
             onClick={onClose}
             className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
           >
             <XIcon className="w-5 h-5" />
           </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-6 scrollbar-thin">
           {renderContent()}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-950/30">
           <button 
             onClick={onClose}
             className="w-full py-3 bg-slate-900 dark:bg-slate-800 text-white font-bold rounded-xl text-sm hover:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
           >
             Zavrieť
           </button>
        </div>

      </div>
    </div>
  );
};

export default LegalModal;
