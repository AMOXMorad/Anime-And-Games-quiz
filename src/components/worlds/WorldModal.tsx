import React, { useState } from 'react';
import { World, GameModeType, Difficulty } from '../../types';
import { useI18n } from '../../lib/i18n';
import { useGame } from '../../context/GameContext';
import { useTheme } from '../../context/ThemeContext';
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
  openMatchmakingModal: (worldId: string, diff: Difficulty, mode?: GameModeType) => void;
}

export const WorldModal: React.FC<WorldModalProps> = ({
  world,
  isOpen,
  onClose,
  openMatchmakingModal
}) => {
  const { lang, t } = useI18n();
  const { startSoloGame } = useGame();
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [selectedMode, setSelectedMode] = useState<GameModeType>('trivia');
  // Local selection can be a real Difficulty OR the 'random' sentinel.
  // 'random' is resolved into a real Difficulty at the moment a match starts —
  // the rest of the app (question filtering, matchmaking queue, etc.) never
  // sees 'random', only 'easy' | 'medium' | 'hard'.
  const [difficultySelection, setDifficultySelection] = useState<Difficulty | 'random'>('medium');

  if (!isOpen || !world) return null;

  const ALL_DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard'];

  // Resolves the actual difficulty to use for a match right now.
  const resolveDifficulty = (): Difficulty => {
    if (difficultySelection === 'random') {
      return ALL_DIFFICULTIES[Math.floor(Math.random() * ALL_DIFFICULTIES.length)];
    }
    return difficultySelection;
  };

  // Kept for any code below that still reads `difficulty` directly for display purposes.
  const difficulty = difficultySelection;

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
    const finalDifficulty = resolveDifficulty();
    if (selectedMode === 'super_challenge') {
      onClose();
      openMatchmakingModal(world.id, finalDifficulty);
    } else {
      startSoloGame(world, selectedMode, finalDifficulty);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        onClick={() => { onClose(); sounds.playClick(); }}
        className={`absolute inset-0 backdrop-blur-md transition-opacity ${
          isLight ? 'bg-slate-900/60' : 'bg-black/85'
        }`}
      />

      {/* Modal Content */}
      <div className={`relative w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl z-10 max-h-[92vh] flex flex-col transition-colors duration-300 ${
        isLight ? 'bg-white border border-slate-200 text-slate-900' : 'bg-black border border-slate-800/80 text-white'
      }`}>
        
        {/* Banner Header - Dark Surface Guaranteed */}
        <div data-dark-surface="true" className="relative h-32 sm:h-36 w-full flex-shrink-0 bg-slate-950">
          <img src={world.banner || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1200'} alt={world.name?.[lang] || 'World'} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

          {/* Close button */}
          <button
            type="button"
            onClick={() => { onClose(); sounds.playClick(); }}
            className="absolute top-3 end-3 p-2 rounded-full bg-black/60 hover:bg-black/90 border border-white/20 text-white transition-all cursor-pointer shadow-md"
            title="إغلاق النافذة"
          >
            <X className="w-4 h-4 text-white" />
          </button>

          {/* World Title & Tagline */}
          <div className="absolute bottom-3 start-5 end-5">
            <div className="flex items-center gap-2.5 mb-1">
              <span className="text-2xl filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">{world.icon || '⚔️'}</span>
              <h2 className="text-xl sm:text-2xl font-black text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] tracking-wide" style={{ color: '#ffffff' }}>
                {world.name?.[lang] || world.name?.ar || world.name?.en || 'عالم'}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-200 drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)] line-clamp-1 font-medium" style={{ color: '#e2e8f0' }}>
              {world.tagline?.[lang] || world.tagline?.ar || world.tagline?.en || ''}
            </p>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          
          {/* Character Roster Preview */}
          {(world.characters || []).length > 0 && (
            <div>
              <h4 className={`text-xs font-bold mb-2 flex items-center gap-1.5 ${
                isLight ? 'text-slate-600' : 'text-slate-400'
              }`}>
                <Users className="w-3.5 h-3.5 text-cyan-500" />
                <span>أبرز شخصيات العالم ({(world.characters || []).length})</span>
              </h4>
              <div className="flex gap-2.5 overflow-x-auto pb-1 pe-1">
                {(world.characters || []).map(char => (
                  <div 
                    key={char.id} 
                    className={`flex-shrink-0 flex items-center gap-2 py-1.5 px-3 rounded-2xl border transition-all ${
                      isLight 
                        ? 'bg-slate-100/90 border-slate-200 text-slate-800' 
                : 'bg-black/60 hover:bg-black border-slate-800 text-slate-200'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-full bg-slate-800 overflow-hidden flex items-center justify-center border border-cyan-500/50 flex-shrink-0">
                      <img src={char.avatar} alt={char.name[lang]} className="w-full h-full object-cover rounded-full" />
                    </div>
                    <div className="text-start min-w-0">
                      <div className={`text-xs font-bold leading-tight truncate ${
                        isLight ? 'text-slate-900' : 'text-white'
                      }`}>
                        {char.name[lang]}
                      </div>
                      <div className={`text-[10px] line-clamp-1 ${
                        isLight ? 'text-slate-500' : 'text-slate-400'
                      }`}>
                        {char.role[lang]}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mode Selection */}
          <div>
            <h4 className={`text-xs font-bold mb-2 flex items-center gap-1.5 ${
              isLight ? 'text-slate-600' : 'text-slate-400'
            }`}>
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
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
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? isLight
                          ? 'bg-cyan-50/90 border-2 border-cyan-500 shadow-[0_4px_16px_rgba(6,182,212,0.25)] ring-2 ring-cyan-400/40 text-slate-900'
                          : 'bg-gradient-to-b from-cyan-950/80 to-slate-950 border-2 border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.35)] ring-1 ring-cyan-400 text-white'
                        : isLight
                        ? 'bg-slate-50 hover:bg-white border-slate-200 hover:border-cyan-300 text-slate-700 shadow-sm'
                        : 'bg-black/40 hover:bg-black/70 border-slate-800 hover:border-slate-700 text-slate-400'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className={`p-2 rounded-xl bg-gradient-to-tr ${m.color} text-white shadow-md`}>
                          <IconComponent className="w-4 h-4 text-white" />
                        </div>
                        {m.badge && (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            isLight
                              ? 'bg-slate-200 border-slate-300 text-slate-700'
                              : 'bg-slate-800 border-slate-700 text-slate-300'
                          }`}>
                            {m.badge}
                          </span>
                        )}
                      </div>
                      <h5 className={`font-black text-sm mb-1 ${
                        isSelected
                          ? isLight ? 'text-cyan-950 font-black' : 'text-white'
                          : isLight ? 'text-slate-900' : 'text-white'
                      }`}>
                        {t(m.titleKey)}
                      </h5>
                      <p className={`text-[11px] leading-relaxed line-clamp-2 ${
                        isSelected
                          ? isLight ? 'text-slate-700 font-medium' : 'text-slate-300'
                          : isLight ? 'text-slate-500' : 'text-slate-400'
                      }`}>
                        {t(m.descKey)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Difficulty Picker */}
          <div>
            <h4 className={`text-xs font-bold mb-2 flex items-center gap-1.5 ${
              isLight ? 'text-slate-600' : 'text-slate-400'
            }`}>
              <Flame className="w-4 h-4 text-rose-500" />
              <span>{t('difficulty')}</span>
            </h4>

            <div className="grid grid-cols-4 gap-2.5">
              <button
                type="button"
                onClick={() => { setDifficultySelection('easy'); sounds.playClick(); }}
                className={`py-2.5 px-3 rounded-2xl text-xs font-bold border transition-all cursor-pointer ${
                  difficultySelection === 'easy'
                    ? isLight
                      ? 'bg-emerald-100 border-2 border-emerald-500 text-emerald-900 font-black shadow-sm'
                      : 'bg-emerald-950/90 border-2 border-emerald-500 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.35)] font-black'
                    : isLight
                    ? 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-white'
                    : 'bg-black/60 border-slate-800 text-slate-400 hover:text-white hover:bg-black/90'
                }`}
              >
                {t('easy')}
              </button>

              <button
                type="button"
                onClick={() => { setDifficultySelection('medium'); sounds.playClick(); }}
                className={`py-2.5 px-3 rounded-2xl text-xs font-bold border transition-all cursor-pointer ${
                  difficultySelection === 'medium'
                    ? isLight
                      ? 'bg-cyan-100 border-2 border-cyan-500 text-cyan-900 font-black shadow-sm'
                      : 'bg-cyan-950/90 border-2 border-cyan-500 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.35)] font-black'
                    : isLight
                    ? 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-white'
                    : 'bg-black/60 border-slate-800 text-slate-400 hover:text-white hover:bg-black/90'
                }`}
              >
                {t('medium')}
              </button>

              <button
                type="button"
                onClick={() => { setDifficultySelection('hard'); sounds.playClick(); }}
                className={`py-2.5 px-3 rounded-2xl text-xs font-bold border transition-all cursor-pointer ${
                  difficultySelection === 'hard'
                    ? isLight
                      ? 'bg-rose-100 border-2 border-rose-500 text-rose-900 font-black shadow-sm'
                      : 'bg-rose-950/90 border-2 border-rose-500 text-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.35)] font-black'
                    : isLight
                    ? 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-white'
                    : 'bg-black/60 border-slate-800 text-slate-400 hover:text-white hover:bg-black/90'
                }`}
              >
                {t('hard')}
              </button>

              <button
                type="button"
                onClick={() => { setDifficultySelection('random'); sounds.playClick(); }}
                title="سيتم اختيار مستوى صعوبة عشوائي (سهل/متوسط/صعب) لحظة بدء المباراة"
                className={`py-2.5 px-3 rounded-2xl text-xs font-bold border transition-all cursor-pointer ${
                  difficultySelection === 'random'
                    ? isLight
                      ? 'bg-purple-100 border-2 border-purple-500 text-purple-900 font-black shadow-sm'
                      : 'bg-purple-950/90 border-2 border-purple-500 text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.35)] font-black'
                    : isLight
                    ? 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-white'
                    : 'bg-black/60 border-slate-800 text-slate-400 hover:text-white hover:bg-black/90'
                }`}
              >
                🎲 عشوائي
              </button>
            </div>
          </div>

        </div>

        {/* Modal Footer: 3 Match Options */}
        <div className={`p-4 sm:p-5 border-t flex flex-col sm:flex-row items-center justify-between gap-3 flex-shrink-0 ${
          isLight ? 'bg-slate-100 border-slate-200' : 'bg-black border-slate-800/80'
        }`}>
          <div className={`text-xs ${isLight ? 'text-slate-600 font-bold' : 'text-slate-400'}`}>
            مستوى الصعوبة: <span className={`font-black ${isLight ? 'text-cyan-700' : 'text-cyan-300'}`}>
              {difficultySelection === 'random' ? '🎲 عشوائي (يُحدد عند البدء)' : t(difficultySelection)}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            {/* Solo Challenge / Training */}
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                startSoloGame(world, selectedMode, resolveDifficulty());
                onClose();
              }}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold rounded-2xl transition-all shadow-sm cursor-pointer ${
                isLight 
                  ? 'bg-white hover:bg-slate-50 border border-slate-300 hover:border-slate-400 text-slate-800 shadow-sm' 
                  : 'bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200'
              }`}
              title="تدريب فردي (10 XP و 10 كوينز لكل سؤال)"
            >
              <Play className="w-3.5 h-3.5 fill-current text-cyan-500" />
              <span>تحدي نفسك (سولو)</span>
            </button>

            {/* Random Matchmaking Queue */}
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                onClose();
                openMatchmakingModal(world.id, resolveDifficulty(), selectedMode);
              }}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-sky-500 hover:from-cyan-500 hover:to-sky-400 text-white font-black text-xs rounded-2xl shadow-[0_4px_16px_rgba(6,182,212,0.4)] transition-all cursor-pointer ring-1 ring-white/20"
              title="مطابقة عشوائية مع لاعبين في نفس العالم"
            >
              <Swords className="w-4 h-4 text-white" />
              <span className="text-white">منافسة عشوائية</span>
            </button>

            {/* Private Custom Room */}
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                onClose();
                openMatchmakingModal(world.id, resolveDifficulty(), selectedMode);
              }}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold rounded-2xl transition-all shadow-sm cursor-pointer ${
                isLight
                  ? 'bg-indigo-50 hover:bg-indigo-100 border border-indigo-300 hover:border-indigo-400 text-indigo-800 shadow-sm'
                  : 'bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-500/50 text-indigo-200'
              }`}
              title="إنشاء غرفة خاصة بكود أو الانضمام لصديق"
            >
              <Users className="w-3.5 h-3.5 text-indigo-500" />
              <span>مواجهة خاصة</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
