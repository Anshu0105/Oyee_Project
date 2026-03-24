import React, { useEffect } from 'react';
import { X, ShieldAlert, Zap as ZapIcon } from 'lucide-react';

const ProfileModal = ({ user, onClose }) => {
  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!user) return null;

  return (
    <div className="fixed inset-0 z-50 bg-gray-50 dark:bg-discord-gray animate-in fade-in duration-200 overflow-y-auto">
      {/* Top right escape button */}
      <div className="absolute top-6 right-8 md:top-10 md:right-12 z-20 hidden md:flex flex-col items-center">
        <button 
          onClick={onClose} 
          className="w-9 h-9 rounded-full border-2 border-gray-400 dark:border-gray-500 flex items-center justify-center text-gray-500 hover:text-gray-800 hover:border-gray-800 dark:hover:text-gray-200 dark:hover:border-gray-200 hover:bg-gray-200 dark:hover:bg-discord-dark transition-all"
        >
          <X className="w-4 h-4" />
        </button>
        <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 mt-2 uppercase tracking-widest">ESC</span>
      </div>
      
      {/* Mobile close button */}
      <button onClick={onClose} className="md:hidden absolute top-4 right-4 text-gray-500 p-2 z-20">
        <X className="w-6 h-6" />
      </button>

      <div className="max-w-5xl mx-auto px-6 py-16 md:py-24 min-h-screen flex flex-col md:flex-row gap-12 md:gap-16">
        {/* Left Side: Avatar & Name */}
        <div className="w-full md:w-1/3 flex flex-col items-center md:items-end text-center md:text-right border-b md:border-b-0 md:border-r border-gray-200 dark:border-discord-darker pb-12 md:pb-0 md:pr-12">
          <div className="w-32 h-32 md:w-48 md:h-48 rounded-full bg-discord-brand text-white flex items-center justify-center text-5xl md:text-7xl font-black shadow-2xl mb-6 relative border-4 border-gray-50 dark:border-discord-gray">
            {user.foodName.charAt(0)}
            <div className="absolute bottom-2 right-2 w-8 h-8 md:w-10 md:h-10 bg-green-500 rounded-full border-4 border-gray-50 dark:border-discord-gray shadow-sm"></div>
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-2">{user.foodName}</h2>
          <p className="text-xs text-gray-500 font-mono tracking-widest uppercase mb-8">// anonymous entity</p>
        </div>

        {/* Right Side: Details & Stats */}
        <div className="w-full md:w-2/3 space-y-10 pb-12">
          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 border-b border-gray-200 dark:border-discord-darker pb-2">My Account</h3>
            <div className="bg-white dark:bg-discord-darker rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-800/80 flex justify-between items-center group transition-colors hover:border-discord-brand/50">
               <div>
                 <div className="text-gray-400 dark:text-gray-500 text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-1.5">Registered Email</div>
                 <div className="text-gray-900 dark:text-gray-100 font-medium">{user.email}</div>
               </div>
               <div className="hidden sm:block text-xs font-bold text-discord-brand bg-discord-brand/10 px-3 py-1.5 rounded-md">VERIFIED</div>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 border-b border-gray-200 dark:border-discord-darker pb-2">Aura & Reputation</h3>
            <div className="bg-gradient-to-br from-discord-brand/10 to-transparent dark:from-discord-brand/5 dark:to-transparent border border-discord-brand/20 rounded-xl p-8 relative overflow-hidden shadow-sm">
               <ShieldAlert className="absolute -right-6 -bottom-6 w-40 h-40 text-discord-brand/10 rotate-12 pointer-events-none" />
               <div className="relative z-10">
                 <div className="text-discord-brand text-xs font-black uppercase tracking-widest mb-3 flex items-center gap-2">
                    <ZapIcon className="w-4 h-4" /> Total Aura Score
                 </div>
                 <div className="text-6xl md:text-7xl font-black text-gray-900 dark:text-white mb-6 tracking-tight">{user.aura}</div>
                 
                 <div className="w-full bg-gray-200 dark:bg-discord-darker rounded-full h-3 mb-3 shadow-inner">
                    <div className="bg-discord-brand h-3 rounded-full transition-all duration-1000 ease-out" style={{ width: `${Math.min(Math.max((user.aura / 500) * 100, 5), 100)}%` }}></div>
                 </div>
                 <div className="flex justify-between text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-widest">
                    <span>0</span>
                    <span className="text-yellow-600 dark:text-yellow-500">⚡ 500 (Thunder)</span>
                    <span className="text-purple-600 dark:text-purple-400">⭐ 1000 (Starborn)</span>
                 </div>
                 
                 <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mt-8 max-w-md font-medium">
                  Aura is earned by contributing positively to the void. Downvotes reduce your Aura. Reach higher tiers for more visibility and respect in public rooms.
                 </p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
