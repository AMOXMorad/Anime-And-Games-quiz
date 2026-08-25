import React, { useState, useEffect } from 'react';
import { World, TriviaQuestion, Difficulty } from '../../types';
import { useI18n } from '../../lib/i18n';
import { useGame } from '../../context/GameContext';
import { sounds } from '../../lib/sound';
import { Timer, Zap, Sparkles, AlertCircle, ArrowRight, Trophy } from 'lucide-react';

interface TriviaModeProps {
  world: World;
  difficulty: Difficulty;
  onFinish: (score: number) => void;
}

export const TriviaMode: React.FC<TriviaModeProps> = ({ world, difficulty, onFinish }) => {
  const { lang, t } = useI18n();
  const { exitGame } = useGame();

  const [questions, setQuestions] = useState<TriviaQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(15);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);

  useEffect(() => {
    // Load and shuffle questions
    let qList = world.triviaQuestions;
    if (qList.length === 0) {
      qList = world.triviaQuestions;
    }
    const filtered = qList.filter(q => q.difficulty === difficulty);
    const pool = filtered.length > 0 ? filtered : qList;
    setQuestions([...pool].sort(() => 0.5 - Math.random()).slice(0, 5));
  }, [world, difficulty]);

  // Timer countdown
  useEffect(() => {
    if (isAnswered || questions.length === 0) return;
    if (timeLeft <= 0) {
      handleTimeUp();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 4) sounds.playTimerTick();
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

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);

    const q = questions[currentIndex];
    if (idx === q.correctIndex) {
      sounds.playCorrect();
      const streakBonus = streak * 10;
      const speedBonus = Math.floor(timeLeft * 5);
      const points = 100 + streakBonus + speedBonus;
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
      setSelectedOption(null);
      setIsAnswered(false);
      setTimeLeft(15);
    } else {
      onFinish(score);
    }
  };

  if (questions.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-xl font-bold text-white mb-4">جاري تجهيز الأسئلة...</div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Top HUD */}
      <div className="flex items-center justify-between bg-slate-900/80 border border-slate-800 p-4 rounded-2xl mb-6 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            onClick={exitGame}
            className="text-xs font-bold text-slate-400 hover:text-white px-3 py-1.5 rounded-lg bg-slate-800"
          >
            خروج
          </button>
          <div className="text-xs font-bold text-slate-300">
            السؤال <span className="text-purple-400 font-black text-sm">{currentIndex + 1}</span> / {questions.length}
          </div>
        </div>

        {/* Timer Bar */}
        <div className="flex items-center gap-2">
          <Timer className={`w-4 h-4 ${timeLeft <= 4 ? 'text-rose-500 animate-bounce' : 'text-cyan-400'}`} />
          <span className={`font-black text-sm ${timeLeft <= 4 ? 'text-rose-400' : 'text-white'}`}>
            {timeLeft}s
          </span>
        </div>

        {/* Score & Streak */}
        <div className="flex items-center gap-4">
          {streak > 1 && (
            <div className="flex items-center gap-1 text-xs font-black text-amber-400 bg-amber-950/60 border border-amber-500/40 px-2.5 py-1 rounded-full animate-pulse">
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>{streak}x Combo!</span>
            </div>
          )}
          <div className="flex items-center gap-1 font-black text-sm text-purple-300">
            <Trophy className="w-4 h-4 text-purple-400" />
            <span>{score} pts</span>
          </div>
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl mb-6 relative overflow-hidden">
        
        {/* Optional Image */}
        {currentQ.image && (
          <div className="mb-6 rounded-2xl overflow-hidden max-h-56 w-full border border-slate-800">
            <img src={currentQ.image} alt="Question Scene" className="w-full h-full object-cover" />
          </div>
        )}

        <h3 className="text-lg sm:text-2xl font-black text-white leading-snug mb-8 text-center sm:text-start">
          {currentQ.question[lang]}
        </h3>

        {/* 4 Options Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {currentQ.options.map((opt, idx) => {
            let btnStyle = 'bg-slate-950/80 border-slate-800 text-slate-200 hover:border-purple-500 hover:bg-slate-800/80';
            
            if (isAnswered) {
              if (idx === currentQ.correctIndex) {
                btnStyle = 'bg-emerald-950/90 border-emerald-500 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.4)] ring-2 ring-emerald-400';
              } else if (selectedOption === idx) {
                btnStyle = 'bg-rose-950/90 border-rose-500 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.4)]';
              } else {
                btnStyle = 'bg-slate-950/40 border-slate-800/40 text-slate-500 opacity-50';
              }
            }

            return (
              <button
                key={idx}
                disabled={isAnswered}
                onClick={() => handleSelectOption(idx)}
                className={`p-4 rounded-2xl border text-sm font-bold transition-all text-start flex items-center justify-between ${btnStyle}`}
              >
                <span>{opt[lang]}</span>
                <span className="w-6 h-6 rounded-full bg-slate-800/60 border border-slate-700/60 flex items-center justify-center text-xs text-slate-400 font-black">
                  {String.fromCharCode(65 + idx)}
                </span>
              </button>
            );
          })}
        </div>

        {/* Explanation Banner */}
        {isAnswered && currentQ.explanation && (
          <div className="mt-6 p-4 rounded-2xl bg-purple-950/40 border border-purple-500/30 text-xs text-purple-200 flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white me-1">معلومة توضيحية:</span>
              <span>{currentQ.explanation[lang]}</span>
            </div>
          </div>
        )}

      </div>

      {/* Next Button */}
      {isAnswered && (
        <div className="flex justify-end">
          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-sm rounded-2xl shadow-[0_0_20px_rgba(147,51,234,0.5)] transition-all animate-bounce"
          >
            <span>{currentIndex + 1 < questions.length ? t('nextQuestion') : 'إنهاء وعرض النتائج'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

    </div>
  );
};
