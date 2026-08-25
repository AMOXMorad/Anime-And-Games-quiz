import React, { useState, useEffect } from 'react';
import { World, TrueFalseQuestion, Difficulty } from '../../types';
import { useI18n } from '../../lib/i18n';
import { useGame } from '../../context/GameContext';
import { sounds } from '../../lib/sound';
import { Timer, Zap, Check, X, ArrowRight, Trophy, AlertCircle } from 'lucide-react';

interface TrueFalseModeProps {
  world: World;
  difficulty: Difficulty;
  onFinish: (score: number) => void;
}

export const TrueFalseMode: React.FC<TrueFalseModeProps> = ({ world, difficulty, onFinish }) => {
  const { lang, t } = useI18n();
  const { exitGame } = useGame();

  const [questions, setQuestions] = useState<TrueFalseQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [userChoice, setUserChoice] = useState<boolean | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(8); // Fast blitz timer
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);

  useEffect(() => {
    let qList = world.trueFalseQuestions;
    const filtered = qList.filter(q => q.difficulty === difficulty);
    const pool = filtered.length > 0 ? filtered : qList;
    setQuestions([...pool].sort(() => 0.5 - Math.random()).slice(0, 5));
  }, [world, difficulty]);

  useEffect(() => {
    if (isAnswered || questions.length === 0) return;
    if (timeLeft <= 0) {
      handleTimeUp();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 3) sounds.playTimerTick();
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isAnswered, questions]);

  const handleTimeUp = () => {
    setIsAnswered(true);
    sounds.playWrong();
    setStreak(0);
  };

  const handleAnswer = (choice: boolean) => {
    if (isAnswered) return;
    setUserChoice(choice);
    setIsAnswered(true);

    const q = questions[currentIndex];
    if (choice === q.isCorrect) {
      sounds.playCorrect();
      const speedBonus = timeLeft * 10;
      const points = 100 + streak * 15 + speedBonus;
      setScore(prev => prev + points);
      setStreak(prev => prev + 1);
    } else {
      sounds.playWrong();
      setStreak(0);
    }
  };

  const handleNext = () => {
    sounds.playClick();
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(prev => prev + 1);
      setUserChoice(null);
      setIsAnswered(false);
      setTimeLeft(8);
    } else {
      onFinish(score);
    }
  };

  if (questions.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-xl font-bold text-white mb-4">جاري تجهيز الأسئلة السريعة...</div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* HUD Header */}
      <div className="flex items-center justify-between bg-slate-900/80 border border-slate-800 p-4 rounded-2xl mb-6 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            onClick={exitGame}
            className="text-xs font-bold text-slate-400 hover:text-white px-3 py-1.5 rounded-lg bg-slate-800"
          >
            خروج
          </button>
          <div className="text-xs font-bold text-slate-300">
            السؤال <span className="text-cyan-400 font-black text-sm">{currentIndex + 1}</span> / {questions.length}
          </div>
        </div>

        {/* Rapid Blitz Timer */}
        <div className="flex items-center gap-2">
          <Timer className={`w-4 h-4 ${timeLeft <= 3 ? 'text-rose-500 animate-bounce' : 'text-cyan-400'}`} />
          <span className={`font-black text-sm ${timeLeft <= 3 ? 'text-rose-400' : 'text-white'}`}>
            {timeLeft}s
          </span>
        </div>

        {/* Score & Streak */}
        <div className="flex items-center gap-4">
          {streak > 1 && (
            <div className="flex items-center gap-1 text-xs font-black text-amber-400 bg-amber-950/60 border border-amber-500/40 px-2.5 py-1 rounded-full animate-pulse">
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>{streak}x Streak</span>
            </div>
          )}
          <div className="flex items-center gap-1 font-black text-sm text-cyan-300">
            <Trophy className="w-4 h-4 text-cyan-400" />
            <span>{score} pts</span>
          </div>
        </div>
      </div>

      {/* Statement Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl mb-6 text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-bold text-xs mb-6">
          ⚡ بليتز صح أم خطأ
        </div>

        <h3 className="text-xl sm:text-2xl font-black text-white leading-relaxed mb-8">
          "{currentQ.statement[lang]}"
        </h3>

        {/* True / False Buttons */}
        <div className="grid grid-cols-2 gap-4">
          {/* True Button */}
          <button
            disabled={isAnswered}
            onClick={() => handleAnswer(true)}
            className={`py-5 px-6 rounded-2xl font-black text-base transition-all flex flex-col items-center justify-center gap-2 ${
              isAnswered
                ? currentQ.isCorrect
                  ? 'bg-emerald-950 border-2 border-emerald-400 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.5)]'
                  : userChoice === true
                  ? 'bg-rose-950 border-2 border-rose-500 text-rose-300'
                  : 'bg-slate-950 opacity-40 border border-slate-800 text-slate-500'
                : 'bg-emerald-600/20 hover:bg-emerald-600 border border-emerald-500/40 hover:border-emerald-400 text-emerald-300 hover:text-white shadow-lg hover:scale-105'
            }`}
          >
            <Check className="w-7 h-7" />
            <span>صح (TRUE)</span>
          </button>

          {/* False Button */}
          <button
            disabled={isAnswered}
            onClick={() => handleAnswer(false)}
            className={`py-5 px-6 rounded-2xl font-black text-base transition-all flex flex-col items-center justify-center gap-2 ${
              isAnswered
                ? !currentQ.isCorrect
                  ? 'bg-emerald-950 border-2 border-emerald-400 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.5)]'
                  : userChoice === false
                  ? 'bg-rose-950 border-2 border-rose-500 text-rose-300'
                  : 'bg-slate-950 opacity-40 border border-slate-800 text-slate-500'
                : 'bg-rose-600/20 hover:bg-rose-600 border border-rose-500/40 hover:border-rose-400 text-rose-300 hover:text-white shadow-lg hover:scale-105'
            }`}
          >
            <X className="w-7 h-7" />
            <span>خطأ (FALSE)</span>
          </button>
        </div>

        {/* Explanation */}
        {isAnswered && currentQ.explanation && (
          <div className="mt-6 p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 text-start flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
            <span>{currentQ.explanation[lang]}</span>
          </div>
        )}
      </div>

      {/* Next Button */}
      {isAnswered && (
        <div className="flex justify-end">
          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-black text-sm rounded-2xl shadow-[0_0_20px_rgba(6,182,212,0.5)] transition-all animate-bounce"
          >
            <span>{currentIndex + 1 < questions.length ? t('nextQuestion') : 'إنهاء وعرض النتائج'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

    </div>
  );
};
