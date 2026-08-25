import React, { useState } from 'react';
import { World, GameModeType, Difficulty } from '../../types';
import { useI18n } from '../../lib/i18n';
import { useGame } from '../../context/GameContext';
import { sounds } from '../../lib/sound';
import { 
  X, 
  HelpCircle, 
  CheckSquare, 
  UserCheck, 
  Swords, 
  Flame, 
  Sparkles, 
  Users, 
  ShieldCheck, 
  Play
} from 'lucide-react';

interface WorldModalProps {
  world: World | null;
  isOpen: boolean;
  onClose: () => void;
  openMatchmakingModal: (worldId: string, diff: Difficulty) => void;
}

export const WorldModal: React.FC<WorldModalProps> = ({
  world,
  isOpen,
  onClose,
  openMatchmakingModal
}) => {
  const { lang, t } = useI18n();
  const { startSoloGame } = useGame();

  const [selectedMode, setSelectedMode] = useState<GameModeType>('trivia');
  const [difficulty, setDifficultyState] = useState<Difficulty>('medium');

  if (!isOpen || !world) return null;

  const MODES: Array<{ id: GameModeType; titleKey: string; descKey: string; icon: any; color: string; badge?: string }> = [
    {
      id: 'who_am_i',
      titleKey: 'modeWhoAmI',
      descKey: 'modeWhoAmIDesc',
      icon: UserCheck,
      color: 'from-amber-600 to-orange-600',
      badge: 'ذكاء واستنتاج'
    },
    {
      id: 'trivia',
      titleKey: 'modeTrivia',
      descKey: 'modeTriviaDesc',
      icon: HelpCircle,
      color: 'from-purple-600 to-indigo-600',
      badge: '4 خيارات ومؤقت'
    },
    {
      id: 'true_false',
      titleKey: 'modeTrueFalse',
      descKey: 'modeTrueFalseDesc',
      icon: CheckSquare,
      color: 'from-cyan-600 to-teal-600',
      badge: 'بليتز خاطف'
    },
    {
      id: 'super_challenge',
      titleKey: 'modeSuperChallenge',
      descKey: 'modeSuperChallengeDesc',
      icon: Swords,
      color: 'from-rose-600 to-red-600',
      badge: '🏆 1v1 لايف ورومات'
    }
  ];

  const handleStart = () => {
    sounds.playClick();
    if (selectedMode === 'super_challenge') {
      onClose();
      openMatchmakingModal(world.id, difficulty);
    } else {
      startSoloGame(world, selectedMode, difficulty);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        onClick={() => { onClose(); sounds.playClick(); }}
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-3xl overflow-hidden shadow-2xl z-10 max-h-[90vh] flex flex-col">
        
        {/* Banner Header */}
        <div className="relative h-44 sm:h-52 w-full flex-shrink-0">
          <img src={world.banner} alt={world.name[lang]} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />

          {/* Close button */}
          <button
            onClick={() => { onClose(); sounds.playClick(); }}
            className="absolute top-4 end-4 p-2 rounded-full bg-slate-950/70 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          {/* World Title */}
          <div className="absolute bottom-4 start-6 end-6">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">{world.icon}</span>
              <h2 className="text-2xl sm:text-3xl font-black text-white">{world.name[lang]}</h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 line-clamp-1">{world.tagline[lang]}</p>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Character Roster Preview */}
          {world.characters.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-slate-400 mb-2 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-purple-400" />
                <span>أبرز شخصيات العالم ({world.characters.length})</span>
              </h4>
              <div className="flex gap-3 overflow-x-auto pb-2 pe-1">
                {world.characters.map(char => (
                  <div 
                    key={char.id} 
                    className="flex-shrink-0 flex items-center gap-2 bg-slate-950/70 border border-slate-800 p-2 rounded-2xl"
                  >
                    <div className="w-9 h-9 rounded-full bg-slate-800 overflow-hidden flex items-center justify-center border border-purple-500/40">
                      <img src={char.avatar} alt={char.name[lang]} className="w-full h-full object-cover" />
                    </div>
                    <div className="text-start">
                      <div className="text-xs font-bold text-white leading-tight">{char.name[lang]}</div>
                      <div className="text-[10px] text-slate-400 line-clamp-1">{char.role[lang]}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mode Selection */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 mb-3 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>اختر نمط التحدي</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {MODES.map(m => {
                const IconComponent = m.icon;
                const isSelected = selectedMode === m.id;
                return (
                  <div
                    key={m.id}
                    onClick={() => { setSelectedMode(m.id); sounds.playClick(); }}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-gradient-to-b from-purple-950/60 to-slate-950 border-purple-500 shadow-[0_0_20px_rgba(147,51,234,0.3)] ring-1 ring-purple-400'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className={`p-2 rounded-xl bg-gradient-to-tr ${m.color} text-white shadow-md`}>
                          <IconComponent className="w-4 h-4" />
                        </div>
                        {m.badge && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
                            {m.badge}
                          </span>
                        )}
                      </div>
                      <h5 className="font-bold text-sm text-white mb-1">{t(m.titleKey)}</h5>
                      <p className="text-xs text-slate-400 leading-relaxed">{t(m.descKey)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Difficulty Picker */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 mb-2 flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-rose-400" />
              <span>{t('difficulty')}</span>
            </h4>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => { setDifficultyState('easy'); sounds.playClick(); }}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                  difficulty === 'easy'
                    ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {t('easy')}
              </button>

              <button
                type="button"
                onClick={() => { setDifficultyState('medium'); sounds.playClick(); }}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                  difficulty === 'medium'
                    ? 'bg-amber-950/80 border-amber-500 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {t('medium')}
              </button>

              <button
                type="button"
                onClick={() => { setDifficultyState('hard'); sounds.playClick(); }}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                  difficulty === 'hard'
                    ? 'bg-rose-950/80 border-rose-500 text-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.3)]'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {t('hard')}
              </button>
            </div>
          </div>

        </div>

        {/* Modal Footer CTA */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-4 flex-shrink-0">
          <div className="text-xs text-slate-400">
            الصعوبة: <span className="text-white font-bold">{t(difficulty)}</span>
          </div>

          <button
            onClick={handleStart}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-sm rounded-xl shadow-[0_0_20px_rgba(147,51,234,0.5)] transition-all"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>{selectedMode === 'super_challenge' ? 'دخول لوبي السوبر 1v1' : t('startPlaying')}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
