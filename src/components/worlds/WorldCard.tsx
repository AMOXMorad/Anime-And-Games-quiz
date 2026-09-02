import React from 'react';
import { World } from '../../types';
import { useI18n } from '../../lib/i18n';
import { useTheme } from '../../context/ThemeContext';
import { sounds } from '../../lib/sound';
import { Users, HelpCircle, Swords } from 'lucide-react';

interface WorldCardProps {
  world: World;
  onOpen: (worldId: string) => void;
}

export const WorldCard: React.FC<WorldCardProps> = ({ world, onOpen }) => {
  const { lang } = useI18n();
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const charactersCount = (world.characters || []).length;
  const triviaCount = (world.triviaQuestions || (world as any).trivia_questions || []).length;
  const tfCount = (world.trueFalseQuestions || (world as any).true_false_questions || []).length;
  const questionsCount = triviaCount + tfCount;

  const nameText = typeof world.name === 'string' ? world.name : (world.name?.[lang] || world.name?.ar || world.name?.en || 'عالم');
  const taglineText = typeof world.tagline === 'string' ? world.tagline : (world.tagline?.[lang] || world.tagline?.ar || world.tagline?.en || '');
  const displayBanner = world.banner || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1200';

  return (
    <div
      onClick={() => { onOpen(world.id); sounds.playClick(); }}
      className={`group relative overflow-hidden rounded-3xl border transition-all duration-500 hover:-translate-y-1.5 cursor-pointer flex flex-col justify-between ${
        isLight
          ? 'bg-white border-slate-200/90 shadow-[0_10px_25px_rgba(0,0,0,0.06)] hover:shadow-[0_20px_35px_rgba(6,182,212,0.18)] hover:border-cyan-400'
          : 'bg-slate-900/95 border-slate-800 hover:border-cyan-500/60 shadow-xl hover:shadow-[0_0_30px_rgba(6,182,212,0.25)]'
      }`}
      style={{
        boxShadow: isLight ? undefined : `0 0 25px ${world.accentGlow || 'rgba(6,182,212,0.3)'}`
      }}
    >
      {/* Banner Image with gradient */}
      <div className="relative h-48 sm:h-56 w-full overflow-hidden bg-slate-950">
        <img
          src={displayBanner}
          alt={nameText}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <div className={`absolute inset-0 bg-gradient-to-t ${
          isLight ? 'from-black/70 via-black/20 to-transparent' : 'from-slate-900 via-slate-900/50 to-transparent'
        }`} />

        {/* Category Pill */}
        <div className="absolute top-4 start-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-xs font-bold text-white shadow-sm">
          <span>{world.icon || '⚔️'}</span>
          <span className="capitalize">{world.category === 'anime' ? (lang === 'ar' ? 'أنمي' : 'Anime') : (lang === 'ar' ? 'ألعاب' : 'Games')}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          <h3 className={`text-xl sm:text-2xl font-black mb-1.5 transition-colors flex items-center gap-2 ${
            isLight ? 'text-slate-900 group-hover:text-cyan-600' : 'text-white group-hover:text-cyan-400'
          }`}>
            <span>{nameText}</span>
          </h3>

          <p className={`text-xs sm:text-sm line-clamp-2 leading-relaxed mb-4 ${
            isLight ? 'text-slate-600 font-medium' : 'text-slate-300'
          }`}>
            {taglineText}
          </p>
        </div>

        <div>
          {/* Stats Bar */}
          <div className={`grid grid-cols-2 gap-2 py-3 border-y text-xs mb-4 ${
            isLight ? 'border-slate-200 text-slate-600' : 'border-slate-800 text-slate-400'
          }`}>
            <div className="flex items-center gap-1.5 font-semibold">
              <Users className="w-4 h-4 text-cyan-500" />
              <span>{charactersCount} شخصيات (من أنا)</span>
            </div>
            <div className="flex items-center gap-1.5 font-semibold">
              <HelpCircle className="w-4 h-4 text-sky-500" />
              <span>{questionsCount} أسئلة وتحديات</span>
            </div>
          </div>

          {/* Action Button */}
          <button 
            type="button"
            className="w-full py-3 rounded-2xl font-black text-xs text-white bg-gradient-to-r from-cyan-600 to-sky-500 hover:from-cyan-500 hover:to-sky-400 shadow-md group-hover:shadow-[0_4px_16px_rgba(6,182,212,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer ring-1 ring-white/10"
          >
            <Swords className="w-4 h-4 text-white" />
            <span className="text-white">خوض التحديات والمودات</span>
          </button>
        </div>
      </div>
    </div>
  );
};
