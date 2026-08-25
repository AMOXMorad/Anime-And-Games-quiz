import React, { useState, useEffect } from 'react';
import { World, Difficulty, Profile } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useGame } from '../../context/GameContext';
import { useI18n } from '../../lib/i18n';
import { sounds } from '../../lib/sound';
import { AvatarWithFrame } from '../ui/AvatarWithFrame';
import { LevelBadge } from '../ui/LevelBadge';
import { Swords, Timer, Zap, Trophy, Shield, Check, X, ArrowRight, UserCheck } from 'lucide-react';
import confetti from 'canvas-confetti';

interface SuperChallengeArenaProps {
  world: World;
  difficulty: Difficulty;
  opponent: Profile;
  onComplete: (playerScore: number, opponentScore: number) => void;
}

export const SuperChallengeArena: React.FC<SuperChallengeArenaProps> = ({
  world,
  difficulty,
  opponent,
  onComplete
}) => {
  const { profile } = useAuth();
  const { lang, t } = useI18n();
  const { exitGame } = useGame();

  const [currentRound, setCurrentRound] = useState<number>(1); // 1: True/False, 2: Trivia, 3: Who Am I
  const [playerScore, setPlayerScore] = useState<number>(0);
  const [opponentScore, setOpponentScore] = useState<number>(0);
  
  // Round 1 (True/False Blitz) state
  const [tfQuestionIndex, setTfQuestionIndex] = useState<number>(0);
  const [tfQuestions, setTfQuestions] = useState<any[]>([]);
  const [tfAnswered, setTfAnswered] = useState<boolean>(false);
  const [tfTimeLeft, setTfTimeLeft] = useState<number>(6);

  // Round 2 (Trivia) state
  const [triviaIndex, setTriviaIndex] = useState<number>(0);
  const [triviaQuestions, setTriviaQuestions] = useState<any[]>([]);
  const [triviaAnswered, setTriviaAnswered] = useState<boolean>(false);
  const [triviaSelected, setTriviaSelected] = useState<number | null>(null);
  const [triviaTimeLeft, setTriviaTimeLeft] = useState<number>(12);

  // Round 3 (Who Am I) state
  const [whoAmIResolved, setWhoAmIResolved] = useState<boolean>(false);
  const [targetChar, setTargetChar] = useState<any>(null);

  useEffect(() => {
    // Prepare question pools
    const tfPool = world.trueFalseQuestions.length > 0 ? world.trueFalseQuestions : world.trueFalseQuestions;
    setTfQuestions([...tfPool].sort(() => 0.5 - Math.random()).slice(0, 3));

    const trPool = world.triviaQuestions.length > 0 ? world.triviaQuestions : world.triviaQuestions;
    setTriviaQuestions([...trPool].sort(() => 0.5 - Math.random()).slice(0, 3));

    if (world.characters.length > 0) {
      setTargetChar(world.characters[Math.floor(Math.random() * world.characters.length)]);
    }
  }, [world]);

  // Round 1 Timer
  useEffect(() => {
    if (currentRound !== 1 || tfAnswered || tfQuestions.length === 0) return;
    if (tfTimeLeft <= 0) {
      handleTfTimeout();
      return;
    }
    const timer = setInterval(() => {
      setTfTimeLeft(p => {
        if (p <= 2) sounds.playTimerTick();
        return p - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [tfTimeLeft, tfAnswered, currentRound, tfQuestions]);

  // Round 2 Timer
  useEffect(() => {
    if (currentRound !== 2 || triviaAnswered || triviaQuestions.length === 0) return;
    if (triviaTimeLeft <= 0) {
      handleTriviaTimeout();
      return;
    }
    const timer = setInterval(() => {
      setTriviaTimeLeft(p => {
        if (p <= 3) sounds.playTimerTick();
        return p - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [triviaTimeLeft, triviaAnswered, currentRound, triviaQuestions]);

  const handleTfTimeout = () => {
    setTfAnswered(true);
    sounds.playWrong();
    // Opponent might answer
    if (Math.random() > 0.3) {
      setOpponentScore(prev => prev + 120);
    }
  };

  const handleTfAnswer = (choice: boolean) => {
    if (tfAnswered) return;
    setTfAnswered(true);
    const q = tfQuestions[tfQuestionIndex];
    if (choice === q.isCorrect) {
      sounds.playCorrect();
      const pts = 120 + tfTimeLeft * 10;
      setPlayerScore(prev => prev + pts);
    } else {
      sounds.playWrong();
    }
    // Opponent score simulation
    if (Math.random() > 0.35) {
      setOpponentScore(prev => prev + 110 + Math.floor(Math.random() * 40));
    }
  };

  const nextTfQuestion = () => {
    sounds.playClick();
    if (tfQuestionIndex + 1 < tfQuestions.length) {
      setTfQuestionIndex(prev => prev + 1);
      setTfAnswered(false);
      setTfTimeLeft(6);
    } else {
      // Move to Round 2
      setCurrentRound(2);
      sounds.playVictory();
    }
  };

  const handleTriviaTimeout = () => {
    setTriviaAnswered(true);
    sounds.playWrong();
    if (Math.random() > 0.4) {
      setOpponentScore(prev => prev + 140);
    }
  };

  const handleTriviaSelect = (idx: number) => {
    if (triviaAnswered) return;
    setTriviaSelected(idx);
    setTriviaAnswered(true);
    const q = triviaQuestions[triviaIndex];
    if (idx === q.correctIndex) {
      sounds.playCorrect();
      const pts = 150 + triviaTimeLeft * 8;
      setPlayerScore(prev => prev + pts);
    } else {
      sounds.playWrong();
    }
    if (Math.random() > 0.35) {
      setOpponentScore(prev => prev + 130 + Math.floor(Math.random() * 50));
    }
  };

  const nextTriviaQuestion = () => {
    sounds.playClick();
    if (triviaIndex + 1 < triviaQuestions.length) {
      setTriviaIndex(prev => prev + 1);
      setTriviaSelected(null);
      setTriviaAnswered(false);
      setTriviaTimeLeft(12);
    } else {
      // Move to Round 3 (Who Am I)
      setCurrentRound(3);
      sounds.playVictory();
    }
  };

  const handleWhoAmIGuess = (charId: string) => {
    if (whoAmIResolved || !targetChar) return;
    setWhoAmIResolved(true);
    if (charId === targetChar.id) {
      sounds.playVictory();
      setPlayerScore(prev => prev + 300);
    } else {
      sounds.playWrong();
      setPlayerScore(prev => prev + 50);
    }
    // Opponent
    setOpponentScore(prev => prev + (Math.random() > 0.4 ? 280 : 80));
  };

  const handleFinalFinish = () => {
    onComplete(playerScore, opponentScore);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      
      {/* Super Battle Live Header (Player vs Opponent) */}
      <div className="bg-slate-900 border border-purple-500/40 rounded-3xl p-6 shadow-[0_0_30px_rgba(147,51,234,0.3)] mb-6 relative overflow-hidden">
        <div className="flex items-center justify-between gap-4">
          
          {/* Player Side */}
          <div className="flex items-center gap-3">
            <AvatarWithFrame frameId={profile?.active_frame_id} size="lg" />
            <div className="text-start">
              <div className="font-black text-white text-base leading-tight">{profile?.username}</div>
              <div className="text-xs text-purple-400 font-bold">#{profile?.tag}</div>
              <div className="text-xl font-black text-emerald-400 mt-1">{playerScore} pts</div>
            </div>
          </div>

          {/* Center VS Crest & Round Indicator */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-500 shadow-[0_0_15px_rgba(225,29,72,0.6)] mb-1">
              <Swords className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div className="text-xs font-black text-amber-300">
              الجولة {currentRound} من 3
            </div>
            <span className="text-[10px] text-slate-400">
              {currentRound === 1 ? '⚡ بليتز صح/خطأ' : currentRound === 2 ? '❓ تريفيا السرعة' : '🎭 شو داون من أنا'}
            </span>
          </div>

          {/* Opponent Side */}
          <div className="flex items-center gap-3 text-end">
            <div className="text-end">
              <div className="font-black text-white text-base leading-tight">{opponent.username}</div>
              <div className="text-xs text-rose-400 font-bold">#{opponent.tag}</div>
              <div className="text-xl font-black text-rose-400 mt-1">{opponentScore} pts</div>
            </div>
            <AvatarWithFrame frameId={opponent.active_frame_id} size="lg" />
          </div>

        </div>
      </div>

      {/* ROUND 1: Fast True/False Blitz */}
      {currentRound === 1 && tfQuestions.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-center">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-400">سؤال {tfQuestionIndex + 1} / {tfQuestions.length}</span>
            <div className="flex items-center gap-1.5 text-xs font-black text-cyan-400">
              <Timer className="w-4 h-4" />
              <span>{tfTimeLeft}s</span>
            </div>
          </div>

          <h3 className="text-xl font-black text-white leading-relaxed mb-6">
            "{tfQuestions[tfQuestionIndex].statement[lang]}"
          </h3>

          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
            <button
              disabled={tfAnswered}
              onClick={() => handleTfAnswer(true)}
              className="py-4 rounded-2xl font-black text-sm bg-emerald-600/20 hover:bg-emerald-600 border border-emerald-500/40 text-emerald-300 hover:text-white transition-all flex items-center justify-center gap-2"
            >
              <Check className="w-5 h-5" />
              <span>صح (TRUE)</span>
            </button>
            <button
              disabled={tfAnswered}
              onClick={() => handleTfAnswer(false)}
              className="py-4 rounded-2xl font-black text-sm bg-rose-600/20 hover:bg-rose-600 border border-rose-500/40 text-rose-300 hover:text-white transition-all flex items-center justify-center gap-2"
            >
              <X className="w-5 h-5" />
              <span>خطأ (FALSE)</span>
            </button>
          </div>

          {tfAnswered && (
            <div className="mt-6 flex justify-center">
              <button
                onClick={nextTfQuestion}
                className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs rounded-xl shadow-lg animate-bounce flex items-center gap-1.5"
              >
                <span>{tfQuestionIndex + 1 < tfQuestions.length ? 'السؤال التالي' : 'الانتقال للجولة 2'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* ROUND 2: Trivia Arena */}
      {currentRound === 2 && triviaQuestions.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-400">سؤال {triviaIndex + 1} / {triviaQuestions.length}</span>
            <div className="flex items-center gap-1.5 text-xs font-black text-amber-400">
              <Timer className="w-4 h-4" />
              <span>{triviaTimeLeft}s</span>
            </div>
          </div>

          <h3 className="text-lg sm:text-xl font-black text-white mb-6">
            {triviaQuestions[triviaIndex].question[lang]}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            {triviaQuestions[triviaIndex].options.map((opt: any, idx: number) => {
              let style = 'bg-slate-950 border-slate-800 hover:border-purple-500 text-slate-200';
              if (triviaAnswered) {
                if (idx === triviaQuestions[triviaIndex].correctIndex) {
                  style = 'bg-emerald-950 border-emerald-500 text-emerald-300 ring-2 ring-emerald-400';
                } else if (triviaSelected === idx) {
                  style = 'bg-rose-950 border-rose-500 text-rose-300';
                } else {
                  style = 'bg-slate-950/40 opacity-40';
                }
              }

              return (
                <button
                  key={idx}
                  disabled={triviaAnswered}
                  onClick={() => handleTriviaSelect(idx)}
                  className={`p-3.5 rounded-xl border text-xs font-bold text-start transition-all ${style}`}
                >
                  {opt[lang]}
                </button>
              );
            })}
          </div>

          {triviaAnswered && (
            <div className="flex justify-end">
              <button
                onClick={nextTriviaQuestion}
                className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs rounded-xl shadow-lg animate-bounce flex items-center gap-1.5"
              >
                <span>{triviaIndex + 1 < triviaQuestions.length ? 'السؤال التالي' : 'الجولة الحاسمة (من أنا)'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* ROUND 3: Who Am I Showdown */}
      {currentRound === 3 && targetChar && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
          <div className="text-center mb-6">
            <span className="text-xs font-bold text-amber-400">الجولة الحاسمة: خمن الشخصية بأسرع وقت!</span>
            <h3 className="text-xl font-black text-white mt-1">تلميح ذهبي: "{targetChar.clues.easy[0][lang]}"</h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {world.characters.map(c => (
              <button
                key={c.id}
                disabled={whoAmIResolved}
                onClick={() => handleWhoAmIGuess(c.id)}
                className="p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-amber-400 transition-all flex flex-col items-center text-center"
              >
                <div className="w-14 h-14 rounded-full bg-slate-800 overflow-hidden mb-2">
                  <img src={c.avatar} alt={c.name[lang]} className="w-full h-full object-cover" />
                </div>
                <div className="font-bold text-xs text-white">{c.name[lang]}</div>
              </button>
            ))}
          </div>

          {whoAmIResolved && (
            <div className="text-center">
              <button
                onClick={handleFinalFinish}
                className="px-8 py-3.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-sm rounded-2xl shadow-[0_0_25px_rgba(245,158,11,0.6)] animate-bounce"
              >
                🏆 تتويج بطل المباراة وعرض النتائج
              </button>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
