import React, { useState, useEffect } from 'react';
import { World, TrueFalseQuestion, Difficulty } from '../../types';
import { useI18n } from '../../lib/i18n';
import { useGame } from '../../context/GameContext';
import { sounds } from '../../lib/sound';
import { Timer, Zap, Check, X, ArrowRight, Trophy, AlertCircle, Flag, AlertTriangle, Flame, Coins } from 'lucide-react';

interface TrueFalseModeProps {
  world: World;
  difficulty: Difficulty;
  onFinish: (score: number, customRewards?: { xpEarned: number; coinsEarned: number }) => void;
}

export const TrueFalseMode: React.FC<TrueFalseModeProps> = ({ world, difficulty, onFinish }) => {
  const { lang, t } = useI18n();
  const { exitGame, matchType } = useGame();

  const QUESTION_DURATION = 10;
  const HALF_TIME = 5;
  const isChaos = world.id === 'chaos_realm';

  const [questions, setQuestions] = useState<TrueFalseQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [userChoice, setUserChoice] = useState<boolean | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(QUESTION_DURATION);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);

  // Speed Double XP Tracker
  const [fastStreakCount, setFastStreakCount] = useState<number>(0);
  const [isDoubleActive, setIsDoubleActive] = useState<boolean>(false);
  const [accumulatedXp, setAccumulatedXp] = useState<number>(0);
  const [accumulatedCoins, setAccumulatedCoins] = useState<number>(0);
  const [lastGainedText, setLastGainedText] = useState<string | null>(null);

  const [showSurrenderConfirm, setShowSurrenderConfirm] = useState<boolean>(false);

  useEffect(() => {
    let qList = world.trueFalseQuestions;
    const shuffled = [...qList].sort(() => 0.5 - Math.random());
    setQuestions(shuffled.slice(0, 20));
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
    setFastStreakCount(0);
    setIsDoubleActive(false);

    const gainedCoins = 10;
    const gainedXp = isChaos ? 13 : 10;
    setAccumulatedXp(prev => prev + gainedXp);
    setAccumulatedCoins(prev => prev + gainedCoins);
    setLastGainedText(isChaos ? `+10🪙 +13XP (+30%)` : `+10🪙 +10XP`);
  };

  const handleAnswer = (choice: boolean) => {
    if (isAnswered) return;
    setUserChoice(choice);
    setIsAnswered(true);

    const q = questions[currentIndex];
    const isCorrect = choice === q.isCorrect;
    const isFast = timeLeft > HALF_TIME; // Answered in less than half time (< 5 seconds used)

    let gainedXp = 10;
    let gainedCoins = 10;

    if (isCorrect) {
      sounds.playCorrect();
      const speedBonus = timeLeft * 12;
      const points = 100 + streak * 20 + speedBonus;
      setScore(prev => prev + points);
      setStreak(prev => prev + 1);

      if (matchType === 'solo') {
        gainedXp = 10;
        gainedCoins = 10;
        setLastGainedText(`تدريب: +10🪙 +10XP`);
      } else {
        if (isFast) {
          const newFastCount = fastStreakCount + 1;
          setFastStreakCount(newFastCount);
          if (newFastCount >= 3 || isDoubleActive) {
            setIsDoubleActive(true);
            gainedCoins = 40;
            gainedXp = isChaos ? 52 : 40;
            setLastGainedText(isChaos ? `🔥 مضاعف 2X + فوضى (+30%): +40🪙 +52XP!` : `🔥 مضاعف 2X: +40🪙 +40XP!`);
          } else {
            gainedCoins = 20;
            gainedXp = isChaos ? 26 : 20;
            setLastGainedText(isChaos ? `+20🪙 +26XP (${newFastCount}/3 للـ 2X)` : `+20🪙 +20XP (${newFastCount}/3 للـ 2X)`);
          }
        } else {
          // Correct but slow (took >= 5 seconds) -> resets streak
          setFastStreakCount(0);
          setIsDoubleActive(false);
          gainedCoins = 20;
          gainedXp = isChaos ? 26 : 20;
          setLastGainedText(isChaos ? `+20🪙 +26XP (أبطأ من 5 ثوانٍ)` : `+20🪙 +20XP (أبطأ من 5 ثوانٍ)`);
        }
      }
    } else {
      // Wrong answer -> resets streak immediately
      sounds.playWrong();
      setStreak(0);
      setFastStreakCount(0);
      setIsDoubleActive(false);
      gainedCoins = 10;
      gainedXp = isChaos ? 13 : 10;
      setLastGainedText(isChaos ? `+10🪙 +13XP (+30%)` : `+10🪙 +10XP`);
    }

    setAccumulatedXp(prev => prev + gainedXp);
    setAccumulatedCoins(prev => prev + gainedCoins);
  };

  const handleNext = () => {
    sounds.playClick();
    setLastGainedText(null);
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(prev => prev + 1);
      setUserChoice(null);
      setIsAnswered(false);
      setTimeLeft(QUESTION_DURATION);
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
        <div className="text-xl font-bold text-white mb-4">جاري تجهيز بنك الـ 20 سؤالاً السريعة...</div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const timerPercentage = (timeLeft / QUESTION_DURATION) * 100;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 animate-fadeIn">
      
      {/* HUD Header */}
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
            <h4 className="text-lg font-black text-white mb-1">هل تود الانسحاب من جولة الصح والخطأ؟</h4>
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

      {/* Blitz Timer Bar */}
      <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden mb-6 border border-slate-800">
        <div 
          className={`h-full transition-all duration-1000 ${
            timeLeft <= 3 ? 'bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.9)] animate-pulse' : 'bg-gradient-to-r from-cyan-500 to-teal-400'
          }`}
          style={{ width: `${timerPercentage}%` }}
        />
      </div>

      {/* Main Statement Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl text-center mb-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            {world.name[lang]} • وميض السرعة
          </span>
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
            <Timer className="w-4 h-4 text-cyan-400" />
            <span className={timeLeft <= 3 ? 'text-rose-400 font-black' : ''}>{timeLeft}s</span>
          </div>
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-white my-8 leading-relaxed">
          "{currentQ.statement[lang]}"
        </h2>

        {/* TRUE / FALSE Dual Giant Buttons */}
        <div className="grid grid-cols-2 gap-4 my-6">
          
          {/* TRUE BUTTON */}
          <button
            disabled={isAnswered}
            onClick={() => handleAnswer(true)}
            className={`p-6 rounded-2xl border-2 font-black text-base flex flex-col items-center justify-center gap-2 transition-all duration-200 ${
              isAnswered
                ? currentQ.isCorrect === true
                  ? 'bg-emerald-950 border-emerald-500 text-emerald-300 ring-4 ring-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.5)]'
                  : userChoice === true
                  ? 'bg-rose-950 border-rose-500 text-rose-300 ring-2 ring-rose-400'
                  : 'bg-slate-950/40 border-slate-900 opacity-40'
                : 'bg-slate-950 border-slate-800 hover:border-emerald-500 hover:bg-emerald-950/30 text-white shadow-lg'
            }`}
          >
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40">
              <Check className="w-6 h-6" />
            </div>
            <span>{t('trueBtn')} (صحيح)</span>
          </button>

          {/* FALSE BUTTON */}
          <button
            disabled={isAnswered}
            onClick={() => handleAnswer(false)}
            className={`p-6 rounded-2xl border-2 font-black text-base flex flex-col items-center justify-center gap-2 transition-all duration-200 ${
              isAnswered
                ? currentQ.isCorrect === false
                  ? 'bg-emerald-950 border-emerald-500 text-emerald-300 ring-4 ring-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.5)]'
                  : userChoice === false
                  ? 'bg-rose-950 border-rose-500 text-rose-300 ring-2 ring-rose-400'
                  : 'bg-slate-950/40 border-slate-900 opacity-40'
                : 'bg-slate-950 border-slate-800 hover:border-rose-500 hover:bg-rose-950/30 text-white shadow-lg'
            }`}
          >
            <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/40">
              <X className="w-6 h-6" />
            </div>
            <span>{t('falseBtn')} (خطأ)</span>
          </button>

        </div>

        {/* Explanation & Next */}
        {isAnswered && (
          <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fadeIn">
            <div className="text-xs text-slate-300 text-start max-w-md">
              {currentQ.explanation ? currentQ.explanation[lang] : 'إجابة صحيحة! استعد للسؤال التالي.'}
            </div>

            <button
              onClick={handleNext}
              className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black text-xs rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center justify-center gap-1.5 transition-all"
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
