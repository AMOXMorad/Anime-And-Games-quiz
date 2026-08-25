import React from 'react';
import { World } from '../../types';
import { useI18n } from '../../lib/i18n';
import { sounds } from '../../lib/sound';
import { Users, HelpCircle, Swords, Sparkles } from 'lucide-react';

interface WorldCardProps {
  world: World;
  onOpen: (worldId: string) => void;
}

export const WorldCard: React.FC<WorldCardProps> = ({ world, onOpen }) => {
  const { lang } = useI18n();

  return (
    <div
      onClick={() => { onOpen(world.id); sounds.playClick(); }}
      className="group relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 hover:border-slate-700 shadow-xl transition-all duration-500 hover:-translate-y-1.5 cursor-pointer flex flex-col justify-between"
      style={{
        boxShadow: `0 0 25px ${world.accentGlow}`
      }}
    >
      {/* Banner Image with gradient */}
      <div className="relative h-48 sm:h-56 w-full overflow-hidden">
        <img
          src={world.banner}
          alt={world.name[lang]}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />

        {/* Category Pill */}
        <div className="absolute top-4 start-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-slate-700/80 text-xs font-bold text-slate-200">
          <span>{world.icon}</span>
          <span className="capitalize">{world.category}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-xl sm:text-2xl font-black text-white mb-1.5 group-hover:text-purple-400 transition-colors flex items-center gap-2">
            <span>{world.name[lang]}</span>
          </h3>

          <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 leading-relaxed mb-4">
            {world.tagline[lang]}
          </p>
        </div>

        <div>
          {/* Stats Bar */}
          <div className="grid grid-cols-2 gap-2 py-3 border-y border-slate-800 text-xs text-slate-400 mb-4">
            <div className="flex items-center gap-1.5 font-semibold">
              <Users className="w-4 h-4 text-purple-400" />
              <span>{world.characters.length} شخصيات (من أنا)</span>
            </div>
            <div className="flex items-center gap-1.5 font-semibold">
              <HelpCircle className="w-4 h-4 text-cyan-400" />
              <span>{world.triviaQuestions.length + world.trueFalseQuestions.length} أسئلة وتحديات</span>
            </div>
          </div>

          {/* Action Button */}
          <button 
            className="w-full py-2.5 rounded-xl font-black text-xs text-white bg-slate-800 group-hover:bg-purple-600 shadow-md group-hover:shadow-[0_0_15px_rgba(147,51,234,0.5)] transition-all flex items-center justify-center gap-2"
          >
            <Swords className="w-4 h-4" />
            <span>خوض التحديات والمودات</span>
          </button>
        </div>
      </div>
    </div>
  );
};
