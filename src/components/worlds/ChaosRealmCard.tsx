import React from 'react';
import { useI18n } from '../../lib/i18n';
import { useGame } from '../../context/GameContext';
import { useTheme } from '../../context/ThemeContext';
import { sounds } from '../../lib/sound';
import { ChaosFilter, chaosWorld } from '../../data/worlds';
import { Sparkles, Swords, Zap, Globe, Film, Gamepad2 } from 'lucide-react';

interface ChaosRealmCardProps {
  onOpenWorldModal: (worldId: string) => void;
}

export const ChaosRealmCard: React.FC<ChaosRealmCardProps> = ({ onOpenWorldModal }) => {
  const { lang, t } = useI18n();
  const { chaosFilter, setChaosCategoryFilter } = useGame();
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const handleFilterClick = (e: React.MouseEvent, filter: ChaosFilter) => {
    e.stopPropagation();
    setChaosCategoryFilter(filter);
  };

  return (
    <div 
      onClick={() => { onOpenWorldModal('chaos_realm'); sounds.playClick(); }}
      className={`relative overflow-hidden rounded-3xl p-6 md:p-8 border-2 cursor-pointer transition-all duration-500 group ${
        isLight
          ? 'bg-gradient-to-br from-sky-100/90 via-cyan-50 to-blue-100/90 border-cyan-400/80 shadow-[0_10px_35px_rgba(6,182,212,0.18)] hover:shadow-[0_15px_45px_rgba(14,165,233,0.28)]'
          : 'bg-gradient-to-r from-cyan-950/80 via-black to-sky-950/80 border-cyan-500/50 shadow-[0_0_35px_rgba(6,182,212,0.35)] hover:shadow-[0_0_50px_rgba(14,165,233,0.5)]'
      }`}
    >
      {/* Animated Cosmic Background Particles & Glow */}
      <div className={`absolute -top-24 -end-24 w-72 h-72 rounded-full blur-3xl pointer-events-none transition-all duration-700 ${
        isLight ? 'bg-sky-400/20 group-hover:bg-sky-400/30' : 'bg-sky-500/20 group-hover:bg-sky-400/30'
      }`} />
      <div className={`absolute -bottom-24 -start-24 w-72 h-72 rounded-full blur-3xl pointer-events-none transition-all duration-700 ${
        isLight ? 'bg-cyan-400/20 group-hover:bg-cyan-400/30' : 'bg-cyan-600/20 group-hover:bg-cyan-500/30'
      }`} />

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Left info */}
        <div className="text-center md:text-start max-w-2xl">
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border font-black text-xs mb-3 animate-pulse ${
            isLight
              ? 'bg-cyan-100/90 border-cyan-300 text-cyan-800 shadow-sm'
              : 'bg-cyan-950/80 border-cyan-400/40 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
          }`}>
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>{t('chaosRealm')}</span>
            <span className={isLight ? 'text-amber-700' : 'text-amber-300'}>★ SUPREME ARENA</span>
          </div>

          <h2 className={`text-2xl sm:text-3xl lg:text-4xl font-black tracking-wide mb-2 flex items-center justify-center md:justify-start gap-2 ${
            isLight ? 'text-slate-900' : 'text-white'
          }`}>
            <span>{chaosWorld.name[lang]}</span>
            <span className="text-3xl animate-bounce">🔮</span>
          </h2>

          <p className={`text-xs sm:text-sm leading-relaxed mb-4 ${
            isLight ? 'text-slate-600 font-medium' : 'text-slate-300'
          }`}>
            {chaosWorld.description[lang]}
          </p>

          {/* Sub-Filters: All / Anime Only / Games Only */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            <span className={`text-xs font-bold me-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              نطاق الفوضى:
            </span>
            
            <button
              type="button"
              onClick={(e) => handleFilterClick(e, 'all')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                chaosFilter === 'all'
                  ? 'bg-gradient-to-r from-cyan-600 to-sky-500 text-white shadow-md ring-2 ring-cyan-400/50'
                  : isLight
                  ? 'bg-white/95 text-slate-700 border border-slate-300 hover:border-cyan-400 hover:text-cyan-700 shadow-sm'
                  : 'bg-slate-900/90 text-slate-300 border border-slate-700 hover:text-white'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{t('chaosAll')}</span>
            </button>

            <button
              type="button"
              onClick={(e) => handleFilterClick(e, 'anime')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                chaosFilter === 'anime'
                  ? 'bg-gradient-to-r from-cyan-600 to-sky-500 text-white shadow-md ring-2 ring-cyan-400/50'
                  : isLight
                  ? 'bg-white/95 text-slate-700 border border-slate-300 hover:border-cyan-400 hover:text-cyan-700 shadow-sm'
                  : 'bg-slate-900/90 text-slate-300 border border-slate-700 hover:text-white'
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span>{t('chaosAnimeOnly')}</span>
            </button>

            <button
              type="button"
              onClick={(e) => handleFilterClick(e, 'games')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                chaosFilter === 'games'
                  ? 'bg-gradient-to-r from-cyan-600 to-sky-500 text-white shadow-md ring-2 ring-cyan-400/50'
                  : isLight
                  ? 'bg-white/95 text-slate-700 border border-slate-300 hover:border-cyan-400 hover:text-cyan-700 shadow-sm'
                  : 'bg-slate-900/90 text-slate-300 border border-slate-700 hover:text-white'
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
            type="button"
            className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-cyan-600 via-sky-500 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black text-sm rounded-2xl shadow-[0_4px_20px_rgba(6,182,212,0.45)] group-hover:scale-105 transition-all cursor-pointer"
          >
            <Swords className="w-5 h-5 text-white" />
            <span className="text-white">دخول عالم الفوضى</span>
          </button>
          <span className={`text-[11px] font-bold flex items-center gap-1 ${
            isLight ? 'text-amber-700' : 'text-amber-300'
          }`}>
            <Zap className="w-3 h-3 text-amber-500" />
            مكافأة نقاط XP مضاعفة (+30%)
          </span>
        </div>

      </div>
    </div>
  );
};
