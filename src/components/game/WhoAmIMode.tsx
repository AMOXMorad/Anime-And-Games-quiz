import React, { useState, useEffect } from 'react';
import { World, Character, Difficulty } from '../../types';
import { useI18n } from '../../lib/i18n';
import { useGame } from '../../context/GameContext';
import { sounds } from '../../lib/sound';
import { Sparkles, HelpCircle, Key, CheckCircle, XCircle, ArrowRight, UserCheck, Shield } from 'lucide-react';
import confetti from 'canvas-confetti';

interface WhoAmIModeProps {
  world: World;
  difficulty: Difficulty;
  onFinish: (score: number) => void;
}

export const WhoAmIMode: React.FC<WhoAmIModeProps> = ({ world, difficulty, onFinish }) => {
  const { lang, t } = useI18n();
  const { exitGame } = useGame();

  const [targetCharacter, setTargetCharacter] = useState<Character | null>(null);
  const [unlockedClues, setUnlockedClues] = useState<string[]>([]);
  const [attemptsLeft, setAttemptsLeft] = useState<number>(3);
  const [selectedGuessId, setSelectedGuessId] = useState<string | null>(null);
  const [isResolved, setIsResolved] = useState<boolean>(false);
  const [isWon, setIsWon] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);

  useEffect(() => {
    if (world.characters.length > 0) {
      const randomChar = world.characters[Math.floor(Math.random() * world.characters.length)];
      setTargetCharacter(randomChar);

      // Start with initial hard/medium clue based on difficulty
      const initialClue =
        difficulty === 'hard'
          ? randomChar.clues.hard[0]
          : difficulty === 'medium'
          ? randomChar.clues.medium[0]
          : randomChar.clues.easy[0];

      setUnlockedClues([initialClue[lang]]);
    }
  }, [world, difficulty, lang]);

  const handleUnlockClue = () => {
    if (!targetCharacter || isResolved) return;
    sounds.playClick();

    // Collect all clues for target
    const allClues = [
      ...targetCharacter.clues.hard.map(c => c[lang]),
      ...targetCharacter.clues.medium.map(c => c[lang]),
      ...targetCharacter.clues.easy.map(c => c[lang])
    ];

    const nextClue = allClues.find(c => !unlockedClues.includes(c));
    if (nextClue) {
      setUnlockedClues(prev => [...prev, nextClue]);
    }
  };

  const handleGuess = (char: Character) => {
    if (isResolved || !targetCharacter) return;
    setSelectedGuessId(char.id);

    if (char.id === targetCharacter.id) {
      // Correct!
      sounds.playVictory();
      confetti({ particleCount: 90, spread: 70 });
      setIsWon(true);
      setIsResolved(true);

      const cluePenalty = (unlockedClues.length - 1) * 40;
      const attemptBonus = attemptsLeft * 80;
      const finalScore = Math.max(100, 300 + attemptBonus - cluePenalty);
      setScore(finalScore);
    } else {
      sounds.playWrong();
      const newAttempts = attemptsLeft - 1;
      setAttemptsLeft(newAttempts);

      if (newAttempts <= 0) {
        setIsWon(false);
        setIsResolved(true);
        setScore(30);
      }
    }
  };

  if (!targetCharacter) {
    return (
      <div className="text-center py-20">
        <div className="text-xl font-bold text-white mb-4">جاري اختيار الشخصية السرية...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Top HUD */}
      <div className="flex items-center justify-between bg-slate-900/80 border border-slate-800 p-4 rounded-2xl mb-6 backdrop-blur-md">
        <button
          onClick={exitGame}
          className="text-xs font-bold text-slate-400 hover:text-white px-3 py-1.5 rounded-lg bg-slate-800"
        >
          خروج
        </button>

        <div className="flex items-center gap-2 font-black text-amber-400 text-sm">
          <UserCheck className="w-5 h-5" />
          <span>مود من أنا؟ (خمن الشخصية السرية)</span>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-bold bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
          <span className="text-slate-400">المحاولات المتبقية:</span>
          <span className={`font-black ${attemptsLeft === 1 ? 'text-rose-500 animate-pulse' : 'text-emerald-400'}`}>
            {attemptsLeft} / 3
          </span>
        </div>
      </div>

      {/* Main Deduction Box */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        
        {/* Left: Mystery Card / Unlocked Clues */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between shadow-2xl">
          <div>
            <div className="text-center pb-6 border-b border-slate-800">
              <div className="relative inline-block mx-auto mb-4">
                <div className="w-28 h-28 rounded-full bg-slate-950 border-4 border-amber-500/50 flex items-center justify-center shadow-[0_0_25px_rgba(245,158,11,0.3)] overflow-hidden">
                  {isResolved ? (
                    <img src={targetCharacter.avatar} alt={targetCharacter.name[lang]} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-5xl font-black text-amber-400 animate-pulse">?</span>
                  )}
                </div>
              </div>

              <h4 className="text-lg font-black text-white">
                {isResolved ? targetCharacter.name[lang] : 'الشخصية الغامضة'}
              </h4>
              <span className="text-xs text-slate-400">
                {isResolved ? targetCharacter.role[lang] : 'اكتشف هويتي من خلال التلميحات'}
              </span>
            </div>

            {/* Clues List */}
            <div className="mt-4 space-y-2.5">
              <div className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-amber-400" />
                <span>التلميحات المكشوفة ({unlockedClues.length}):</span>
              </div>

              {unlockedClues.map((clue, idx) => (
                <div 
                  key={idx} 
                  className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-200 leading-relaxed flex items-start gap-2 animate-fadeIn"
                >
                  <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-400 flex-shrink-0 flex items-center justify-center font-bold text-[10px]">
                    {idx + 1}
                  </span>
                  <span>{clue}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Unlock More Clues Button */}
          {!isResolved && (
            <div className="pt-4 border-t border-slate-800 mt-4">
              <button
                onClick={handleUnlockClue}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs border border-amber-500/30 flex items-center justify-center gap-2 transition-all shadow-md"
              >
                <Key className="w-3.5 h-3.5" />
                <span>{t('unlockClue')}</span>
              </button>
            </div>
          )}
        </div>

        {/* Right: Character Cards Grid for Guessing */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between shadow-2xl">
          <div>
            <h4 className="text-xs font-bold text-slate-400 mb-4 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>اختر تخمينك من شخصيات هذا العالم:</span>
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {world.characters.map(char => {
                const isSelected = selectedGuessId === char.id;
                let cardClass = 'bg-slate-950 border-slate-800 hover:border-purple-500 hover:scale-102';

                if (isResolved) {
                  if (char.id === targetCharacter.id) {
                    cardClass = 'bg-emerald-950 border-2 border-emerald-500 ring-2 ring-emerald-400';
                  } else if (isSelected) {
                    cardClass = 'bg-rose-950 border-2 border-rose-500 opacity-70';
                  } else {
                    cardClass = 'bg-slate-950 opacity-40 border-slate-900';
                  }
                }

                return (
                  <button
                    key={char.id}
                    disabled={isResolved}
                    onClick={() => handleGuess(char)}
                    className={`p-3 rounded-2xl border text-start transition-all flex flex-col items-center text-center cursor-pointer ${cardClass}`}
                  >
                    <div className="w-16 h-16 rounded-full bg-slate-800 overflow-hidden mb-2 border border-slate-700">
                      <img src={char.avatar} alt={char.name[lang]} className="w-full h-full object-cover" />
                    </div>
                    <div className="font-bold text-xs text-white line-clamp-1 mb-0.5">
                      {char.name[lang]}
                    </div>
                    <div className="text-[10px] text-slate-400 line-clamp-1">
                      {char.affiliation[lang]}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Result Banner */}
          {isResolved && (
            <div className={`mt-6 p-4 rounded-2xl border flex items-center justify-between gap-4 ${
              isWon
                ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                : 'bg-rose-950/60 border-rose-500/50 text-rose-300'
            }`}>
              <div className="flex items-center gap-3">
                {isWon ? <CheckCircle className="w-6 h-6 text-emerald-400" /> : <XCircle className="w-6 h-6 text-rose-400" />}
                <div>
                  <div className="font-black text-sm text-white">
                    {isWon ? 'تخمين أسطوري صحيح!' : 'انتهت المحاولات!'}
                  </div>
                  <div className="text-xs">
                    الشخصية هي: <span className="font-bold text-white">{targetCharacter.name[lang]}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onFinish(score)}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs shadow-lg"
              >
                <span>إنهاء والتتويج</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
