import React, { useState, useEffect } from 'react';
import { useI18n } from '../../lib/i18n';
import { useGame } from '../../context/GameContext';
import { useTheme } from '../../context/ThemeContext';
import { sounds } from '../../lib/sound';
import { ChaosFilter, chaosWorld, getChaosCharacters, getChaosTriviaQuestions, getChaosTrueFalseQuestions } from '../../data/worlds';
import { WorldType } from '../../types';
import { Sparkles, Swords, Zap, CheckSquare, Square, Film, Gamepad2, Shield, Globe } from 'lucide-react';

interface ChaosRealmCardProps {
  onOpenWorldModal: (worldId: string) => void;
}

export const ChaosRealmCard: React.FC<ChaosRealmCardProps> = ({ onOpenWorldModal }) => {
  const { lang, t } = useI18n();
  const { chaosFilter, setChaosCategoryFilter } = useGame();
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [, setUpdateTrigger] = useState(0);
  useEffect(() => {
    const handleUpdate = () => setUpdateTrigger(prev => prev + 1);
    window.addEventListener('ag_utopia_worlds_updated', handleUpdate);
    return () => window.removeEventListener('ag_utopia_worlds_updated', handleUpdate);
  }, []);

  // Determine current active categories
  const allCategories: { id: WorldType; label: string; icon: React.ReactNode }[] = [
    { id: 'anime', label: lang === 'ar' ? 'عالم الأنمي' : 'Anime', icon: <Film className="w-3.5 h-3.5" /> },
    { id: 'games', label: lang === 'ar' ? 'عالم الألعاب' : 'Games', icon: <Gamepad2 className="w-3.5 h-3.5" /> },
    { id: 'superheroes', label: lang === 'ar' ? 'الأبطال الخارقين' : 'Superheroes', icon: <Shield className="w-3.5 h-3.5" /> },
  ];

  const isAllSelected = chaosFilter === 'all' || (Array.isArray(chaosFilter) && chaosFilter.length === allCategories.length);

  const isCategoryChecked = (catId: WorldType): boolean => {
    if (chaosFilter === 'all') return true;
    if (Array.isArray(chaosFilter)) return chaosFilter.includes(catId);
    return chaosFilter === catId;
  };

  const handleToggleCategory = (e: React.MouseEvent, catId: WorldType) => {
    e.stopPropagation();
    sounds.playClick();

    if (chaosFilter === 'all') {
      // If currently all selected, unchecking one leaves the others checked
      const remaining = allCategories.map(c => c.id).filter(id => id !== catId);
      setChaosCategoryFilter(remaining.length === 0 ? 'all' : remaining);
      return;
    }

    let currentList: WorldType[] = [];
    if (Array.isArray(chaosFilter)) {
      currentList = [...chaosFilter];
    } else {
      currentList = [chaosFilter as WorldType];
    }

    if (currentList.includes(catId)) {
      // Remove
      const filtered = currentList.filter(id => id !== catId);
      setChaosCategoryFilter(filtered.length === 0 ? 'all' : filtered);
    } else {
      // Add
      const updated = [...currentList, catId];
      if (updated.length === allCategories.length) {
        setChaosCategoryFilter('all');
      } else {
        setChaosCategoryFilter(updated);
      }
    }
  };

  const handleSelectAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    sounds.playClick();
    setChaosCategoryFilter('all');
  };

  // Dynamic question counts
  const totalChars = getChaosCharacters(chaosFilter).length;
  const totalTrivia = getChaosTriviaQuestions(chaosFilter).length;
  const totalTF = getChaosTrueFalseQuestions(chaosFilter).length;

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

      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
        
        {/* Left info */}
        <div className="text-center lg:text-start max-w-3xl">
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border font-black text-xs mb-3 animate-pulse ${
            isLight
              ? 'bg-cyan-100/90 border-cyan-300 text-cyan-800 shadow-sm'
              : 'bg-cyan-950/80 border-cyan-400/40 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
          }`}>
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>{t('chaosRealm')}</span>
            <span className={isLight ? 'text-amber-700' : 'text-amber-300'}>★ SUPREME ARENA</span>
          </div>

          <h2 className={`text-2xl sm:text-3xl lg:text-4xl font-black tracking-wide mb-2 flex items-center justify-center lg:justify-start gap-2 ${
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

          {/* Sub-Filters: Checkboxes Multi-Select */}
          <div className="space-y-2">
            <div className="flex items-center justify-center lg:justify-start gap-2">
              <span className={`text-xs font-bold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                اختر نطاق الفوضى (التصنيفات المشمولة في الأسئلة):
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
              
              {/* Select All Checkbox Button */}
              <button
                type="button"
                onClick={handleSelectAll}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  isAllSelected
                    ? 'bg-gradient-to-r from-cyan-600 to-sky-500 text-white border-cyan-400 shadow-md ring-2 ring-cyan-400/40'
                    : isLight
                    ? 'bg-white text-slate-700 border-slate-300 hover:border-cyan-400'
                    : 'bg-black/60 text-slate-300 border-slate-800 hover:border-slate-600'
                }`}
              >
                {isAllSelected ? <CheckSquare className="w-3.5 h-3.5 text-white" /> : <Globe className="w-3.5 h-3.5" />}
                <span>اختيار الكل (شامل)</span>
              </button>

              {/* Individual Category Checkboxes */}
              {allCategories.map(cat => {
                const checked = isCategoryChecked(cat.id);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={(e) => handleToggleCategory(e, cat.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                      checked
                        ? isLight
                          ? 'bg-cyan-600 text-white border-cyan-500 shadow-sm'
                          : 'bg-cyan-950/90 text-cyan-200 border-cyan-500/80 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                        : isLight
                        ? 'bg-white/80 text-slate-500 border-slate-200 hover:text-slate-800'
                        : 'bg-black/40 text-slate-500 border-slate-800/80 hover:text-slate-300'
                    }`}
                  >
                    {checked ? (
                      <CheckSquare className="w-3.5 h-3.5 text-cyan-300" />
                    ) : (
                      <Square className="w-3.5 h-3.5 text-slate-500" />
                    )}
                    {cat.icon}
                    <span>{cat.label}</span>
                  </button>
                );
              })}

            </div>

            {/* Live Pool Count Stats */}
            <div className={`text-[11px] font-bold flex items-center justify-center lg:justify-start gap-3 pt-1 ${
              isLight ? 'text-slate-500' : 'text-slate-400'
            }`}>
              <span>🎯 إجمالي بنك الأسئلة المدمج:</span>
              <span className="text-cyan-400 font-black">{totalTrivia + totalTF} سؤالاً</span>
              <span>•</span>
              <span className="text-purple-400 font-black">{totalChars} شخصية</span>
            </div>
          </div>
        </div>

        {/* Right CTA Button */}
        <div className="flex flex-col items-center gap-2 flex-shrink-0">
          <button 
            type="button"
            className="flex items-center gap-2 px-7 py-4 bg-gradient-to-r from-cyan-600 via-sky-500 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black text-sm rounded-2xl shadow-[0_4px_25px_rgba(6,182,212,0.45)] group-hover:scale-105 transition-all cursor-pointer ring-1 ring-white/20"
          >
            <Swords className="w-5 h-5 text-white animate-pulse" />
            <span className="text-white">دخول ساحة الفوضى</span>
          </button>
          <span className={`text-xs font-black flex items-center gap-1 px-3 py-1 rounded-full border ${
            isLight ? 'bg-amber-100 text-amber-900 border-amber-300' : 'bg-amber-950/60 text-amber-300 border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
          }`}>
            <Zap className="w-3.5 h-3.5 text-amber-500 animate-bounce" />
            مكافأة نقاط XP مضاعفة (+30%)
          </span>
        </div>

      </div>
    </div>
  );
};
