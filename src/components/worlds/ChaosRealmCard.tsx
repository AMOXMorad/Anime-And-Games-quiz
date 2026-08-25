import React from 'react';
import { useI18n } from '../../lib/i18n';
import { useGame } from '../../context/GameContext';
import { sounds } from '../../lib/sound';
import { ChaosFilter, chaosWorld } from '../../data/worlds';
import { Sparkles, Swords, Zap, Globe, Film, Gamepad2 } from 'lucide-react';

interface ChaosRealmCardProps {
  onOpenWorldModal: (worldId: string) => void;
}

export const ChaosRealmCard: React.FC<ChaosRealmCardProps> = ({ onOpenWorldModal }) => {
  const { lang, t } = useI18n();
  const { chaosFilter, setChaosCategoryFilter } = useGame();

  const handleFilterClick = (e: React.MouseEvent, filter: ChaosFilter) => {
    e.stopPropagation();
    setChaosCategoryFilter(filter);
  };

  return (
    <div 
      onClick={() => { onOpenWorldModal('chaos_realm'); sounds.playClick(); }}
      className="relative overflow-hidden rounded-3xl p-6 md:p-8 bg-gradient-to-r from-purple-950/80 via-slate-900/90 to-indigo-950/80 border-2 border-indigo-500/50 shadow-[0_0_35px_rgba(99,102,241,0.35)] hover:shadow-[0_0_50px_rgba(168,85,247,0.5)] cursor-pointer transition-all duration-500 group"
    >
      {/* Animated Cosmic Background Particles & Glow */}
      <div className="absolute -top-24 -end-24 w-72 h-72 bg-purple-600/30 rounded-full blur-3xl pointer-events-none group-hover:bg-purple-500/40 transition-all duration-700" />
      <div className="absolute -bottom-24 -start-24 w-72 h-72 bg-cyan-600/20 rounded-full blur-3xl pointer-events-none group-hover:bg-cyan-500/30 transition-all duration-700" />

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Left info */}
        <div className="text-center md:text-start max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-900/60 border border-indigo-400/40 text-indigo-300 font-black text-xs mb-3 shadow-[0_0_12px_rgba(99,102,241,0.4)] animate-pulse">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{t('chaosRealm')}</span>
            <span className="text-amber-300">★ SUPREME ARENA</span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-wide mb-2 flex items-center justify-center md:justify-start gap-2">
            <span>{chaosWorld.name[lang]}</span>
            <span className="text-3xl animate-bounce">🔮</span>
          </h2>

          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-4">
            {chaosWorld.description[lang]}
          </p>

          {/* Sub-Filters: All / Anime Only / Games Only */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            <span className="text-xs font-bold text-slate-400 me-1">نطاق الفوضى:</span>
            
            <button
              onClick={(e) => handleFilterClick(e, 'all')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                chaosFilter === 'all'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.5)] ring-1 ring-purple-300'
                  : 'bg-slate-900/80 text-slate-400 border border-slate-700 hover:text-white'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{t('chaosAll')}</span>
            </button>

            <button
              onClick={(e) => handleFilterClick(e, 'anime')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                chaosFilter === 'anime'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.5)] ring-1 ring-purple-300'
                  : 'bg-slate-900/80 text-slate-400 border border-slate-700 hover:text-white'
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span>{t('chaosAnimeOnly')}</span>
            </button>

            <button
              onClick={(e) => handleFilterClick(e, 'games')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                chaosFilter === 'games'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.5)] ring-1 ring-purple-300'
                  : 'bg-slate-900/80 text-slate-400 border border-slate-700 hover:text-white'
              }`}
            >
              <Gamepad2 className="w-3.5 h-3.5" />
              <span>{t('chaosGamesOnly')}</span>
            </button>
          </div>
        </div>

        {/* Right CTA Button */}
        <div className="flex flex-col items-center gap-2">
          <button 
            className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-black text-sm rounded-2xl shadow-[0_0_25px_rgba(99,102,241,0.6)] group-hover:scale-105 transition-all"
          >
            <Swords className="w-5 h-5" />
            <span>دخول عالم الفوضى</span>
          </button>
          <span className="text-[11px] text-amber-300 font-bold flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-400" />
            مكافأة نقاط XP مضاعفة (+30%)
          </span>
        </div>

      </div>
    </div>
  );
};
