import React, { useState, useEffect } from 'react';
import { World, TriviaQuestion, Difficulty } from '../../types';
import { useI18n } from '../../lib/i18n';
import { useGame } from '../../context/GameContext';
import { sounds } from '../../lib/sound';
import { shuffleTriviaOptions } from '../../data/worlds';
import { Timer, Zap, Sparkles, AlertCircle, ArrowRight, Trophy, Flag, AlertTriangle, Flame, Coins } from 'lucide-react';

interface TriviaModeProps {
  world: World;
  difficulty: Difficulty;
  onFinish: (score: number, customRewards?: { xpEarned: number; coinsEarned: number }) => void;
}

export const TriviaMode: React.FC<TriviaModeProps> = ({ world, difficulty, onFinish }) => {
  const { lang, t } = useI18n();
  const { exitGame, matchType } = useGame();

  const [questions, setQuestions] = useState<TriviaQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(18);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  
  // Fast Speed Double XP Tracker (>= 3 fast consecutive answers in <= 9s)
  const [fastStreakCount, setFastStreakCount] = useState<number>(0);
  const [isDoubleActive, setIsDoubleActive] = useState<boolean>(false);
  const [accumulatedXp, setAccumulatedXp] = useState<number>(0);
  const [accumulatedCoins, setAccumulatedCoins] = useState<number>(0);
  const [lastGainedText, setLastGainedText] = useState<string | null>(null);
  
  const [showSurrenderConfirm, setShowSurrenderConfirm] = useState<boolean>(false);

  useEffect(() => {
    // Load and shuffle questions with randomized choices
    let qList = world.triviaQuestions;
    const shuffled = [...qList].sort(() => 0.5 - Math.random()).map(shuffleTriviaOptions);
    setQuestions(shuffled.slice(0, 20));
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
    setFastStreakCount(0);
    setIsDoubleActive(false);
    
    // Reward on wrong/timeout: 10 XP & 10 Coins
    const gainedXp = 10;
    const gainedCoins = 10;
    setAccumulatedXp(prev => prev + gainedXp);
    setAccumulatedCoins(prev => prev + gainedCoins);
    setLastGainedText(`+${gainedCoins}🪙 +${gainedXp}XP`);
  };

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);

    const q = questions[currentIndex];
    const isCorrect = idx === q.correctIndex;
    const isFast = timeLeft >= 9; // Answered in half the time (< 9 seconds used)

    let gainedXp = 10;
    let gainedCoins = 10;

    if (isCorrect) {
      sounds.playCorrect();
      const points = 100 + (streak * 10) + (timeLeft * 5);
      setScore(prev => prev + points);
      setStreak(prev => prev + 1);

      if (matchType === 'solo') {
        // Solo training: 10 XP & 10 Coins
        gainedXp = 10;
        gainedCoins = 10;
        setLastGainedText(`تدريب: +10🪙 +10XP`);
      } else {
        // PvP / Private match
        if (isFast) {
          const newFastCount = fastStreakCount + 1;
          setFastStreakCount(newFastCount);
          if (newFastCount >= 3 || isDoubleActive) {
            setIsDoubleActive(true);
            gainedXp = 40;
            gainedCoins = 40;
            setLastGainedText(`🔥 مضاعف 2X: +40🪙 +40XP!`);
          } else {
            gainedXp = 20;
            gainedCoins = 20;
            setLastGainedText(`+20🪙 +20XP (${newFastCount}/3 للـ 2X)`);
          }
        } else {
          // Correct but slow
          setFastStreakCount(0);
          setIsDoubleActive(false);
          gainedXp = 20;
          gainedCoins = 20;
          setLastGainedText(`+20🪙 +20XP`);
        }
      }
    } else {
      // Wrong answer
      sounds.playWrong();
      setStreak(0);
      setFastStreakCount(0);
      setIsDoubleActive(false);
      gainedXp = 10;
      gainedCoins = 10;
      setLastGainedText(`+10🪙 +10XP`);
    }

    setAccumulatedXp(prev => prev + gainedXp);
    setAccumulatedCoins(prev => prev + gainedCoins);
  };

  const handleNext = () => {
    sounds.playClick();
    setLastGainedText(null);
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      setTimeLeft(18);
    } else {
      onFinish(score, { xpEarned: accumulatedXp, coinsEarned: accumulatedCoins });
    }
  };

  const handleSurrender = () => {
    sounds.playWrong();
    setShowSurrenderConfirm(false);
    onFinish(score, { xpEarned: accumulatedXp, coinsEarned: accumulatedCoins });
  };

  if (questions.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-xl font-bold text-white mb-4">جاري تجهيز بنك الـ 20 سؤالاً...</div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const timerPercentage = (timeLeft / 18) * 100;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fadeIn">
      
      {/* Top HUD: Question count, Streak, Score, Rewards live badge */}
      <div className="flex flex-wrap items-center justify-between bg-slate-900/90 border border-slate-800 p-4 rounded-2xl mb-6 backdrop-blur-md shadow-xl gap-3">
        <div className="flex items-center gap-3">
          <div className="text-xs font-black text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-3 py-1.5 rounded-xl">
            السؤال {currentIndex + 1} / {questions.length}
          </div>
          
          {matchType === 'solo' ? (
            <div className="text-xs font-bold text-slate-300 bg-slate-800 px-2.5 py-1 rounded-xl">
              🏋️ وضع التدريب السولو (10XP)
            </div>
          ) : isDoubleActive ? (
            <div className="flex items-center gap-1.5 text-xs font-black text-amber-300 bg-amber-950/80 border border-amber-400 px-3 py-1 rounded-xl animate-pulse shadow-[0_0_15px_rgba(245,158,11,0.5)]">
              <Flame className="w-4 h-4 text-amber-400 animate-bounce" />
              <span>🔥 ميزة الـ 2X مضاعفة! (40XP / 40🪙)</span>
            </div>
          ) : fastStreakCount > 0 ? (
            <div className="flex items-center gap-1 text-xs font-bold text-cyan-300 bg-cyan-950/60 border border-cyan-500/30 px-2.5 py-1 rounded-xl">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>سرعة متتالية: {fastStreakCount}/3 للـ 2X</span>
            </div>
          ) : null}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-950/80 px-3 py-1 rounded-xl border border-slate-800 text-xs font-black">
            <span className="text-amber-400">🪙 {accumulatedCoins}</span>
            <span className="text-cyan-400">✨ {accumulatedXp} XP</span>
          </div>

          <button
            onClick={() => { setShowSurrenderConfirm(true); sounds.playClick(); }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-600/40 text-rose-300 text-xs font-bold transition-all"
            title="انسحاب وإنهاء الجولة"
          >
            <Flag className="w-3.5 h-3.5" />
            <span>انسحاب</span>
          </button>
        </div>
      </div>

      {/* Surrender Confirmation Modal */}
      {showSurrenderConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-rose-500/50 rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl">
            <AlertTriangle className="w-12 h-12 text-rose-400 mx-auto mb-3 animate-bounce" />
            <h4 className="text-lg font-black text-white mb-1">هل تود الانسحاب من التحدي؟</h4>
            <p className="text-xs text-slate-300 mb-6">
              سيتم إنهاء الجولة واحتساب النقاط التي جمعتها حتى الآن ({score} نقطة).
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowSurrenderConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
              >
                متابعة اللعب
              </button>
              <button
                onClick={handleSurrender}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
              >
                نعم، انسحب
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Timer Bar */}
      <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden mb-6 border border-slate-800">
        <div 
          className={`h-full transition-all duration-1000 ${
            timeLeft <= 5 ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.8)] animate-pulse' : 'bg-gradient-to-r from-purple-500 to-cyan-400'
          }`}
          style={{ width: `${timerPercentage}%` }}
        />
      </div>

      {/* Main Question Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl mb-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            {world.name[lang]}
          </span>
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
            <Timer className="w-4 h-4 text-cyan-400" />
            <span className={timeLeft <= 5 ? 'text-rose-400 font-black' : ''}>{timeLeft} ثانية</span>
          </div>
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-white mb-6 leading-relaxed">
          {currentQ.question[lang]}
        </h2>

        {/* 4 Choices Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-6">
          {currentQ.options.map((opt, idx) => {
            let btnStyle = 'bg-slate-950/80 border-slate-800 text-slate-200 hover:border-purple-500/60 hover:bg-slate-900';

            if (isAnswered) {
              if (idx === currentQ.correctIndex) {
                btnStyle = 'bg-emerald-950 border-emerald-500 text-emerald-300 ring-2 ring-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.4)]';
              } else if (selectedOption === idx) {
                btnStyle = 'bg-rose-950 border-rose-500 text-rose-300 ring-2 ring-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.4)]';
              } else {
                btnStyle = 'bg-slate-950/40 border-slate-900 text-slate-600 opacity-40';
              }
            }

            return (
              <button
                key={idx}
                disabled={isAnswered}
                onClick={() => handleSelectOption(idx)}
                className={`p-4 rounded-2xl border text-sm font-bold text-start transition-all duration-200 flex items-center justify-between ${btnStyle}`}
              >
                <span>{opt[lang]}</span>
                <span className="text-xs opacity-50 px-2 py-0.5 rounded-md bg-slate-900">
                  {idx === 0 ? 'A' : idx === 1 ? 'B' : idx === 2 ? 'C' : 'D'}
                </span>
              </button>
            );
          })}
        </div>

        {/* Explanation / Next Question Button */}
        {isAnswered && (
          <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fadeIn">
            <div className="text-xs text-slate-300 max-w-md">
              {currentQ.explanation ? currentQ.explanation[lang] : 'إجابة صحيحة! تابع للأسئلة التالية.'}
            </div>

            <button
              onClick={handleNext}
              className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs rounded-xl shadow-[0_0_20px_rgba(147,51,234,0.4)] flex items-center justify-center gap-1.5 transition-all"
            >
              <span>{currentIndex + 1 < questions.length ? 'السؤال التالي' : 'عرض النتائج النهائية'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>

    </div>
  );
};
