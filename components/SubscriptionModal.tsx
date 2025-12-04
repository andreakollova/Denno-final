
import React, { useState } from 'react';
import { SubscriptionPlan, SubscriptionStatus } from '../types';
import { purchaseProduct, restorePurchases } from '../services/iapService';
import { CheckIcon, SparklesIcon, RefreshIcon, XIcon } from './Icons';

interface SubscriptionModalProps {
  onSuccess: () => void;
  onClose?: () => void;
  status: SubscriptionStatus;
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ onSuccess, onClose, status }) => {
  const [loading, setLoading] = useState<SubscriptionPlan | 'restore' | null>(null);

  const handleSubscribe = async (plan: SubscriptionPlan) => {
    setLoading(plan);
    const success = await purchaseProduct(plan);
    setLoading(null);
    if (success) {
      onSuccess();
    }
  };

  const handleRestore = async () => {
    setLoading('restore');
    const success = await restorePurchases();
    setLoading(null);
    if (success) {
      alert("Nákupy boli úspešne obnovené.");
      onSuccess();
    } else {
      alert("Nenašli sa žiadne predchádzajúce nákupy.");
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-300">
      
      <div className="w-full max-w-md bg-slate-50 dark:bg-slate-950 rounded-3xl relative z-10 shadow-2xl overflow-hidden max-h-[90dvh] overflow-y-auto no-scrollbar border border-white/10">
        
        {/* Close Button */}
        {onClose && (
            <button 
                onClick={onClose}
                className="absolute top-4 right-4 p-2 bg-white/50 dark:bg-black/20 hover:bg-white dark:hover:bg-slate-800 rounded-full transition-colors z-20 text-slate-500"
            >
                <XIcon className="w-5 h-5" />
            </button>
        )}

        {/* Header */}
        <div className="text-center mb-6 mt-8 px-6">
            <div className="inline-block p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl mb-4 shadow-inner">
                <SparklesIcon className="w-8 h-8 text-[#6466f1]" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-2 leading-tight">
                {status === SubscriptionStatus.EXPIRED ? 'Skúšobná doba skončila' : 'Odomknite plný potenciál'}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Pre pokračovanie v používaní pokročilých AI funkcií (Chat, Nástroje, Generovanie navyše) si vyberte plán.
            </p>
        </div>

        <div className="px-6 pb-8">
            {/* Plan: Monthly */}
            <button 
                onClick={() => handleSubscribe(SubscriptionPlan.MONTHLY)}
                disabled={loading !== null}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm mb-3 hover:border-[#6466f1] dark:hover:border-[#6466f1] transition-all group text-left relative overflow-hidden"
            >
                <div className="flex justify-between items-center relative z-10">
                    <div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-base">Mesačne</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Flexibilné</p>
                    </div>
                    <div className="text-right">
                        <span className="block text-lg font-bold text-[#6466f1]">1,99 €</span>
                        <span className="text-[10px] text-slate-400">/ mesiac</span>
                    </div>
                </div>
                {loading === SubscriptionPlan.MONTHLY && (
                    <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/50 flex items-center justify-center z-20">
                        <div className="w-5 h-5 border-2 border-[#6466f1] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                )}
            </button>

            {/* Plan: Yearly */}
            <button 
                onClick={() => handleSubscribe(SubscriptionPlan.YEARLY)}
                disabled={loading !== null}
                className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 p-1 rounded-2xl shadow-xl shadow-indigo-500/20 mb-6 transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
                <div className="bg-gradient-to-r from-[#6466f1] to-purple-600 dark:from-indigo-100 dark:to-white p-4 rounded-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-white/20 dark:bg-slate-900/10 text-white dark:text-slate-900 text-[9px] font-bold px-2 py-1 rounded-bl-lg">
                        NAJVÝHODNEJŠIE
                    </div>
                    
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="font-bold text-base text-white dark:text-slate-900">Ročne</h3>
                            <p className="text-xs text-indigo-100 dark:text-slate-600">Ušetríte 17%</p>
                        </div>
                        <div className="text-right">
                            <span className="block text-lg font-bold text-white dark:text-slate-900">20,99 €</span>
                            <span className="text-[10px] text-indigo-100 dark:text-slate-600">/ rok</span>
                        </div>
                    </div>
                    
                    {loading === SubscriptionPlan.YEARLY && (
                        <div className="absolute inset-0 bg-black/10 flex items-center justify-center z-20">
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    )}
                </div>
            </button>

            {/* Features List */}
            <div className="bg-slate-100 dark:bg-slate-900/50 rounded-xl p-4 mb-6">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Premium Funkcie</h4>
                <ul className="space-y-3">
                    <li className="flex gap-3 text-xs font-medium text-slate-700 dark:text-slate-300">
                        <CheckIcon className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        Neobmedzený chat s AI asistentom
                    </li>
                    <li className="flex gap-3 text-xs font-medium text-slate-700 dark:text-slate-300">
                        <CheckIcon className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        AI nástroje (Vysvetlenie webu, Rýchlokurzy)
                    </li>
                    <li className="flex gap-3 text-xs font-medium text-slate-700 dark:text-slate-300">
                        <CheckIcon className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        Generovanie ďalších správ na počkanie
                    </li>
                </ul>
            </div>
            
            {/* Restore Purchases */}
            <div className="text-center mb-4">
                <button 
                    onClick={handleRestore}
                    disabled={loading !== null}
                    className="text-[10px] font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 uppercase tracking-widest flex items-center justify-center gap-2 mx-auto"
                >
                    {loading === 'restore' ? (
                    <span className="w-3 h-3 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                    <RefreshIcon className="w-3 h-3" />
                    )}
                    Obnoviť nákupy
                </button>
            </div>
            
            {/* Mandatory Compliance Text */}
            <div className="text-[9px] text-slate-400 text-center leading-relaxed px-2 border-t border-slate-100 dark:border-slate-800 pt-3">
                <p className="mb-2">
                    Platba bude naúčtovaná na váš účet iTunes/Google Play po potvrdení nákupu. 
                    Predplatné sa automaticky obnovuje, pokiaľ nie je zrušené aspoň 24 hodín pred koncom aktuálneho obdobia.
                </p>
                <div className="flex justify-center gap-3">
                    <a href="#" className="hover:underline">Podmienky používania</a>
                    <span>•</span>
                    <a href="#" className="hover:underline">Ochrana súkromia</a>
                </div>
            </div>

        </div>

      </div>
    </div>
  );
};

export default SubscriptionModal;
