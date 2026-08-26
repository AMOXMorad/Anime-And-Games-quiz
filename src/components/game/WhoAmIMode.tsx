import React, { useState, useEffect, useRef } from 'react';
import { World, Character, Difficulty } from '../../types';
import { useI18n } from '../../lib/i18n';
import { useGame } from '../../context/GameContext';
import { useAuth } from '../../context/AuthContext';
import { sounds } from '../../lib/sound';
import { checkCharacterGuess } from '../../lib/fuzzyMatch';
import { AvatarWithFrame } from '../ui/AvatarWithFrame';
import { 
  Sparkles, 
  HelpCircle, 
  Send, 
  Heart, 
  Flag, 
  Coins, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  MessageSquare, 
  RotateCcw, 
  Trophy, 
  User, 
  Bot,
  AlertTriangle
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface WhoAmIModeProps {
  world: World;
  difficulty: Difficulty;
  onFinish: (score: number, customRewards?: { xpEarned: number; coinsEarned: number }) => void;
}

interface ChatLogEntry {
  id: string;
  sender: 'player' | 'opponent' | 'system';
  text: string;
  answer?: 'yes' | 'no' | 'maybe';
  isGuess?: boolean;
  isCorrect?: boolean;
}

export const WhoAmIMode: React.FC<WhoAmIModeProps> = ({ world, difficulty, onFinish }) => {
  const { lang, t } = useI18n();
  const { exitGame } = useGame();
  const { profile } = useAuth();

  // Game State
  const [playerChar, setPlayerChar] = useState<Character | null>(null);
  const [opponentChar, setOpponentChar] = useState<Character | null>(null);
  
  // Coin Toss State
  const [isFlippingCoin, setIsFlippingCoin] = useState<boolean>(true);
  const [coinResult, setCoinResult] = useState<'player' | 'opponent' | null>(null);
  
  // Turn State
  const [currentTurn, setCurrentTurn] = useState<'player' | 'opponent'>('player');
  const [playerAttempts, setPlayerAttempts] = useState<number>(3);
  const [opponentAttempts, setOpponentAttempts] = useState<number>(3);
  
  // Q&A & Guess Input
  const [questionInput, setQuestionInput] = useState<string>('');
  const [guessInput, setGuessInput] = useState<string>('');
  const [isGuessModalOpen, setIsGuessModalOpen] = useState<boolean>(false);
  const [chatLog, setChatLog] = useState<ChatLogEntry[]>([]);
  const [waitingForOpponentAnswer, setWaitingForOpponentAnswer] = useState<boolean>(false);
  const [opponentPendingQuestion, setOpponentPendingQuestion] = useState<string | null>(null);

  const ROUND_TIME = 600; // 10 minutes round
  const [roundTimeLeft, setRoundTimeLeft] = useState<number>(ROUND_TIME);

  // Match Resolution State
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [winner, setWinner] = useState<'player' | 'opponent' | null>(null);
  const [gameResultReason, setGameResultReason] = useState<string>('');
  const [score, setScore] = useState<number>(0);
  const [showSurrenderConfirm, setShowSurrenderConfirm] = useState<boolean>(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // 10-Minute Round Timer
  useEffect(() => {
    if (isFlippingCoin || isGameOver) return;
    if (roundTimeLeft <= 0) {
      handleRoundTimeout();
      return;
    }

    const timer = setInterval(() => {
      setRoundTimeLeft(prev => {
        if (prev <= 10 && prev > 0) sounds.playTimerTick();
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [roundTimeLeft, isFlippingCoin, isGameOver]);

  const handleRoundTimeout = () => {
    sounds.playWrong();
    setIsGameOver(true);
    setWinner('opponent');
    setGameResultReason('انتهى الوقت الإجمالي للجولة (10 دقائق)!');
    setScore(200);
  };

  // Initialize Match & Secret Characters
  useEffect(() => {
    if (world.characters.length >= 2) {
      const shuffled = [...world.characters].sort(() => 0.5 - Math.random());
      const pChar = shuffled[0];
      const oChar = shuffled[1];
      setPlayerChar(pChar);
      setOpponentChar(oChar);

      // Perform Coin Toss
      const timer = setTimeout(() => {
        const starter = Math.random() > 0.5 ? 'player' : 'opponent';
        setCoinResult(starter);
        setCurrentTurn(starter);
        setIsFlippingCoin(false);
        sounds.playVictory();

        setChatLog([
          {
            id: 'sys_start',
            sender: 'system',
            text: starter === 'player' 
              ? '🪙 القرعة اختارتك للبدء! اطرح سؤالك الاستكشافي أو خمن شخصيتك.' 
              : '🪙 القرعة اختارت الخصم للبدء! الخصم يفكر في سؤاله الأول...'
          }
        ]);

        if (starter === 'opponent') {
          triggerOpponentTurn(pChar, oChar);
        }
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [world]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatLog, waitingForOpponentAnswer, opponentPendingQuestion]);

  // Opponent AI Turn Simulator
  const triggerOpponentTurn = (pChar: Character, oChar: Character) => {
    setWaitingForOpponentAnswer(true);

    setTimeout(() => {
      // Possible smart questions opponent asks about playerChar
      const sampleQuestions = [
        `هل شخصيتي تنتمي إلى ${pChar.affiliation[lang]}؟`,
        `هل شخصيتي تمتلك قدرات ${pChar.powerType[lang]}؟`,
        `هل أنا شخصية ذات شعر مميز وشهيرة بالمعارك؟`,
        `هل شخصيتي مصنفة كـ ${pChar.role[lang]}؟`,
        `هل أنا أنتمي إلى شخصيات الأنمي الرئيسية؟`
      ];
      const q = sampleQuestions[Math.floor(Math.random() * sampleQuestions.length)];

      setChatLog(prev => [
        ...prev,
        {
          id: 'msg_' + Date.now(),
          sender: 'opponent',
          text: q
        }
      ]);
      setOpponentPendingQuestion(q);
      setWaitingForOpponentAnswer(false);
    }, 2000);
  };

  // Player asks a question
  const handleSendQuestion = (customQ?: string) => {
    const qText = customQ || questionInput.trim();
    if (!qText || currentTurn !== 'player' || waitingForOpponentAnswer) return;

    sounds.playClick();
    setQuestionInput('');
    setWaitingForOpponentAnswer(true);

    // Add Player question to chat
    setChatLog(prev => [
      ...prev,
      {
        id: 'msg_' + Date.now(),
        sender: 'player',
        text: qText
      }
    ]);

    // Simulate AI / Opponent answering accurately based on playerChar properties
    setTimeout(() => {
      if (!playerChar) return;
      const lowerQ = qText.toLowerCase();
      let ans: 'yes' | 'no' | 'maybe' = 'maybe';

      if (
        lowerQ.includes('بنت') || lowerQ.includes('فتاة') || lowerQ.includes('انثى') || lowerQ.includes('female')
      ) {
        ans = playerChar.gender === 'female' ? 'yes' : 'no';
      } else if (
        lowerQ.includes('ولد') || lowerQ.includes('رجل') || lowerQ.includes('ذكر') || lowerQ.includes('male')
      ) {
        ans = playerChar.gender === 'male' ? 'yes' : 'no';
      } else if (
        lowerQ.includes('كونوها') || lowerQ.includes('leaf')
      ) {
        ans = playerChar.affiliation.ar.includes('كونوها') || playerChar.affiliation.en.includes('Leaf') ? 'yes' : 'no';
      } else if (
        lowerQ.includes('أوتشيها') || lowerQ.includes('اوتشيها') || lowerQ.includes('uchiha') || lowerQ.includes('شارينغان') || lowerQ.includes('sharingan')
      ) {
        ans = playerChar.name.ar.includes('أوتشيها') || playerChar.powerType.ar.includes('شارينغان') || playerChar.powerType.en.includes('Sharingan') ? 'yes' : 'no';
      } else if (
        lowerQ.includes('هوكاجي') || lowerQ.includes('hokage')
      ) {
        ans = playerChar.role.ar.includes('هوكاجي') || playerChar.role.en.includes('Hokage') ? 'yes' : 'no';
      } else if (
        lowerQ.includes('ريزيرو') || lowerQ.includes('لوغنيكا') || lowerQ.includes('ساحرة') || lowerQ.includes('إيميليا') || lowerQ.includes('rezero')
      ) {
        ans = world.id === 'rezero' ? 'yes' : 'no';
      } else {
        ans = Math.random() > 0.4 ? 'yes' : 'no';
      }

      const ansArabic = ans === 'yes' ? 'نعم! ✅' : ans === 'no' ? 'لا! ❌' : 'ربما / غير متأكد 🤔';

      setChatLog(prev => [
        ...prev,
        {
          id: 'ans_' + Date.now(),
          sender: 'opponent',
          text: `إجابة المنافس: ${ansArabic}`,
          answer: ans
        }
      ]);
      setWaitingForOpponentAnswer(false);
      setCurrentTurn('opponent');

      // Now opponent takes turn
      if (opponentChar) {
        triggerOpponentTurn(playerChar, opponentChar);
      }
    }, 1800);
  };

  // Player answers Opponent's question
  const handlePlayerAnswer = (answer: 'yes' | 'no' | 'maybe') => {
    if (!opponentPendingQuestion) return;
    sounds.playClick();

    const ansArabic = answer === 'yes' ? 'نعم! ✅' : answer === 'no' ? 'لا! ❌' : 'ربما 🤔';

    setChatLog(prev => [
      ...prev,
      {
        id: 'ans_p_' + Date.now(),
        sender: 'player',
        text: `إجابتك: ${ansArabic}`,
        answer: answer
      }
    ]);
    setOpponentPendingQuestion(null);

    // Opponent random chance to guess if deep in match
    const shouldOpponentAttemptGuess = chatLog.length >= 8 && Math.random() > 0.75;
    if (shouldOpponentAttemptGuess && opponentChar) {
      setTimeout(() => {
        handleOpponentGuessAttempt();
      }, 1200);
    } else {
      setCurrentTurn('player');
    }
  };

  // Opponent AI Guess Attempt
  const handleOpponentGuessAttempt = () => {
    if (!opponentChar) return;
    const isCorrect = Math.random() > 0.65; // 35% chance to hit

    if (isCorrect) {
      setChatLog(prev => [
        ...prev,
        {
          id: 'guess_o_' + Date.now(),
          sender: 'opponent',
          text: `🚨 المنافس خمن شخصيته: "${opponentChar.name[lang]}" وكانت إجابة صحيحة!`,
          isGuess: true,
          isCorrect: true
        }
      ]);
      sounds.playWrong();
      setWinner('opponent');
      setGameResultReason(`المنافس خمن شخصيته (${opponentChar.name[lang]}) أولاً وفاز بالمباراة!`);
      setIsGameOver(true);
      setScore(50);
    } else {
      const remaining = opponentAttempts - 1;
      setOpponentAttempts(remaining);
      setChatLog(prev => [
        ...prev,
        {
          id: 'guess_o_fail_' + Date.now(),
          sender: 'opponent',
          text: `❌ المنافس خمن تخميناً خاطئاً! تبقى لديه ${remaining} محاولات.`,
          isGuess: true,
          isCorrect: false
        }
      ]);

      if (remaining <= 0) {
        sounds.playVictory();
        confetti({ particleCount: 100, spread: 80 });
        setWinner('player');
        setGameResultReason('المنافس استنفد محاولاته الثلاث وخسر المباراة تلقائياً!');
        setIsGameOver(true);
        setScore(300);
      } else {
        setCurrentTurn('player');
      }
    }
  };

  // Player Guess Attempt with Fuzzy Matcher
  const handlePlayerGuess = () => {
    if (!guessInput.trim() || !playerChar || isGameOver) return;
    const isCorrect = checkCharacterGuess(guessInput.trim(), playerChar.name);
    setIsGuessModalOpen(false);

    if (isCorrect) {
      sounds.playVictory();
      confetti({ particleCount: 120, spread: 90 });
      setChatLog(prev => [
        ...prev,
        {
          id: 'guess_p_success_' + Date.now(),
          sender: 'player',
          text: `🎉 مبروك! خمنت شخصيتك (${playerChar.name[lang]}) بشكل صحيح!`,
          isGuess: true,
          isCorrect: true
        }
      ]);
      setWinner('player');
      setGameResultReason(`عبقري! لقد اكتشفت أنك: ${playerChar.name[lang]}`);
      setIsGameOver(true);
      const calculatedScore = playerAttempts === 3 ? 1500 : playerAttempts === 2 ? 1000 : playerAttempts === 1 ? 500 : 200;
      setScore(calculatedScore);
    } else {
      sounds.playWrong();
      const remaining = playerAttempts - 1;
      setPlayerAttempts(remaining);
      setChatLog(prev => [
        ...prev,
        {
          id: 'guess_p_fail_' + Date.now(),
          sender: 'player',
          text: `❌ تخمين غير صحيح: "${guessInput}". تبقى لديك ${remaining} محاولات.`,
          isGuess: true,
          isCorrect: false
        }
      ]);
      setGuessInput('');

      if (remaining <= 0) {
        sounds.playWrong();
        setWinner('opponent');
        setGameResultReason('لقد استنفدت محاولات التخمين الثلاث! فاز المنافس تلقائياً.');
        setIsGameOver(true);
        setScore(200);
      } else {
        setCurrentTurn('opponent');
        if (opponentChar) {
          triggerOpponentTurn(playerChar, opponentChar);
        }
      }
    }
  };

  // Calculate scaled rewards based on attempts remaining
  const calculateWhoAmIRewards = (attemptsLeft: number, isWon: boolean) => {
    if (!isWon || attemptsLeft <= 0) {
      return { xp: 200, coins: 200 };
    }
    if (attemptsLeft === 3) return { xp: 1500, coins: 1500 };
    if (attemptsLeft === 2) return { xp: 1000, coins: 1000 };
    if (attemptsLeft === 1) return { xp: 500, coins: 500 };
    return { xp: 200, coins: 200 };
  };

  // Surrender / Forfeit Match
  const handleSurrender = () => {
    sounds.playWrong();
    setShowSurrenderConfirm(false);
    setWinner('opponent');
    setGameResultReason('لقد انسحبت من المباراة ومنحت الفوز للمنافس.');
    setIsGameOver(true);
    setScore(200);
  };

  const handleFinishMatch = () => {
    sounds.playClick();
    const isWon = winner === 'player';
    const rewards = calculateWhoAmIRewards(playerAttempts, isWon);
    onFinish(score, { xpEarned: rewards.xp, coinsEarned: rewards.coins });
  };

  // -------------------------------------------------------------
  // RENDER: Coin Toss Animation Screen
  // -------------------------------------------------------------
  if (isFlippingCoin) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center animate-fadeIn">
        <div className="bg-slate-900 border border-purple-500/40 rounded-3xl p-8 shadow-[0_0_40px_rgba(147,51,234,0.3)]">
          <div className="w-28 h-28 mx-auto mb-6 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 p-1 shadow-[0_0_30px_rgba(245,158,11,0.6)] animate-spin-slow flex items-center justify-center">
            <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center font-black text-4xl text-amber-400">
              🪙
            </div>
          </div>
          <h3 className="text-2xl font-black text-white mb-2">رمية الكوين الملكي</h3>
          <p className="text-xs text-slate-300">
            جاري تحديد من سيبدأ بالسؤال الأول في مواجهة الرؤوس (Heads-Up)...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 py-6 animate-fadeIn">
      
      {/* Top HUD: Surrender button & Attempts counters */}
      <div className="flex items-center justify-between bg-slate-900/90 border border-slate-800 p-4 rounded-2xl mb-6 shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="text-xs font-bold text-slate-300">
            <span>محاولاتك:</span>
            <div className="flex items-center gap-1 mt-0.5">
              {[1, 2, 3].map(heart => (
                <Heart
                  key={heart}
                  className={`w-4 h-4 transition-all ${
                    heart <= playerAttempts
                      ? 'text-rose-500 fill-rose-500 drop-shadow-[0_0_6px_rgba(244,63,94,0.7)]'
                      : 'text-slate-700'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="h-6 w-px bg-slate-800" />

          <div className="text-xs font-bold text-slate-300">
            <span>محاولات المنافس:</span>
            <div className="flex items-center gap-1 mt-0.5">
              {[1, 2, 3].map(heart => (
                <Heart
                  key={heart}
                  className={`w-4 h-4 transition-all ${
                    heart <= opponentAttempts
                      ? 'text-purple-500 fill-purple-500 drop-shadow-[0_0_6px_rgba(168,85,247,0.7)]'
                      : 'text-slate-700'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* 10-Minute Round Timer */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-black">
          <span className="text-cyan-400">⏱️</span>
          <span className={`font-mono ${roundTimeLeft <= 60 ? 'text-rose-400 animate-pulse' : 'text-slate-200'}`}>
            {Math.floor(roundTimeLeft / 60)}:{(roundTimeLeft % 60).toString().padStart(2, '0')}
          </span>
          <span className="text-[10px] text-slate-500 hidden sm:inline">جولة 10د</span>
        </div>

        {/* Turn Status Banner */}
        <div className="hidden md:inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-black">
          <span className={`w-2 h-2 rounded-full ${currentTurn === 'player' ? 'bg-emerald-400 animate-ping' : 'bg-purple-400'}`} />
          <span className={currentTurn === 'player' ? 'text-emerald-400' : 'text-purple-400'}>
            {currentTurn === 'player' ? 'دورك الآن (اطرح سؤالك أو خمن)' : 'دور المنافس يفكر...'}
          </span>
        </div>

        {/* Surrender Button */}
        <button
          onClick={() => { setShowSurrenderConfirm(true); sounds.playClick(); }}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-600/40 text-rose-300 text-xs font-bold transition-all"
        >
          <Flag className="w-3.5 h-3.5" />
          <span>انسحاب</span>
        </button>
      </div>

      {/* Surrender Confirmation Modal */}
      {showSurrenderConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-rose-500/50 rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl">
            <AlertTriangle className="w-12 h-12 text-rose-400 mx-auto mb-3 animate-bounce" />
            <h4 className="text-lg font-black text-white mb-1">هل أنت متأكد من الانسحاب؟</h4>
            <p className="text-xs text-slate-300 mb-6">
              الانسحاب سيعتبر هزيمة تلقائية ويمنح الفوز للمنافس فوراً.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowSurrenderConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
              >
                إلغاء والمتابعة
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

      {/* Arena Layout: 2 Secret Cards (Player Card = ? / Opponent Card = Revealed) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        
        {/* YOUR CARD (Mystery: What is my character?) */}
        <div className="relative overflow-hidden bg-gradient-to-b from-purple-950/60 to-slate-950 border-2 border-purple-500/40 rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center">
          <div className="absolute top-3 start-3 px-2.5 py-0.5 rounded-full bg-purple-900/60 border border-purple-500/40 text-[10px] font-black text-purple-300">
            بطاقتك السرية
          </div>

          <div className="w-32 h-32 rounded-full bg-slate-900 border-4 border-dashed border-purple-400/60 flex items-center justify-center my-4 shadow-[0_0_25px_rgba(168,85,247,0.4)] animate-pulse">
            <span className="text-5xl font-black text-purple-300">❓</span>
          </div>

          <h3 className="text-xl font-black text-white mb-1">من أنا؟</h3>
          <p className="text-xs text-slate-400 max-w-xs mb-4">
            أنت لا ترى صورتك أو اسمك! اطرح أسئلة ذكية على المنافس لمعرفة هويتك قبل أن يعرف هو شخصيته.
          </p>

          {/* Guess Button */}
          <button
            disabled={currentTurn !== 'player' || isGameOver}
            onClick={() => { setIsGuessModalOpen(true); sounds.playClick(); }}
            className={`w-full py-2.5 px-4 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 ${
              currentTurn === 'player' && !isGameOver
                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.5)] animate-bounce'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>خمن اسم شخصيتك الآن! ({playerAttempts} محاولات)</span>
          </button>
        </div>

        {/* OPPONENT CARD (You see opponent's full character details!) */}
        {opponentChar && (
          <div className="relative overflow-hidden bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-indigo-500/40 rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center">
            <div className="absolute top-3 start-3 px-2.5 py-0.5 rounded-full bg-indigo-900/60 border border-indigo-500/40 text-[10px] font-black text-indigo-300 flex items-center gap-1">
              <Bot className="w-3 h-3" />
              شخصية المنافس (يراها أنت فقط)
            </div>

            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-indigo-500/70 shadow-[0_0_25px_rgba(99,102,241,0.4)] my-4 bg-slate-950">
              <img 
                src={opponentChar.avatar} 
                alt={opponentChar.name[lang]} 
                className="w-full h-full object-cover" 
              />
            </div>

            <h3 className="text-xl font-black text-white mb-1">
              {opponentChar.name[lang]}
            </h3>
            <div className="text-xs text-indigo-300 font-bold mb-1">
              {opponentChar.role[lang]}
            </div>
            <div className="text-[11px] text-slate-400">
              {opponentChar.affiliation[lang]} • {opponentChar.powerType[lang]}
            </div>
          </div>
        )}

      </div>

      {/* Q&A Interactive Chat Console */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl mb-6">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-800 font-bold text-xs text-slate-300">
          <MessageSquare className="w-4 h-4 text-purple-400" />
          <span>سجل الأسئلة والحوار المباشر (Q&A Live Feed)</span>
        </div>

        {/* Chat Stream */}
        <div className="h-64 overflow-y-auto space-y-3 p-2 bg-slate-950/70 rounded-2xl border border-slate-800/80 mb-4">
          {chatLog.map(msg => (
            <div
              key={msg.id}
              className={`p-3 rounded-2xl text-xs font-semibold leading-relaxed max-w-[85%] ${
                msg.sender === 'system'
                  ? 'mx-auto bg-purple-950/60 border border-purple-500/30 text-purple-200 text-center w-full'
                  : msg.sender === 'player'
                  ? 'ms-auto bg-purple-600/90 text-white rounded-br-none shadow-md'
                  : 'me-auto bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none shadow-md'
              }`}
            >
              {msg.text}
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Opponent Asking -> Player Must Answer */}
        {opponentPendingQuestion && (
          <div className="p-4 rounded-2xl bg-indigo-950/80 border border-indigo-500/50 mb-4 animate-fadeIn">
            <div className="text-xs font-bold text-indigo-300 mb-2">
              ❓ الخصم يسألك: "{opponentPendingQuestion}" — أجب بصدق:
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handlePlayerAnswer('yes')}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md transition-all"
              >
                نعم (Yes) ✅
              </button>
              <button
                onClick={() => handlePlayerAnswer('no')}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs shadow-md transition-all"
              >
                لا (No) ❌
              </button>
              <button
                onClick={() => handlePlayerAnswer('maybe')}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-all"
              >
                ربما / غير متأكد 🤔
              </button>
            </div>
          </div>
        )}

        {/* Player Asking Controls */}
        {currentTurn === 'player' && !opponentPendingQuestion && !isGameOver && (
          <div>
            {/* Quick Suggestion Chips */}
            <div className="flex flex-wrap items-center gap-1.5 mb-3">
              <span className="text-[11px] font-bold text-slate-400 me-1">أسئلة سريعة:</span>
              {[
                'هل أنا شخصية أنثى؟',
                'هل أنا من قرية كونوها؟',
                'هل أمتلك قوى الشارينغان؟',
                'هل أنا من الشخصيات الرئيسية؟',
                'هل شخصيتي ترتدي قناعاً؟'
              ].map((sq, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendQuestion(sq)}
                  className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-purple-600 text-slate-300 hover:text-white text-[11px] font-semibold transition-all border border-slate-700/60"
                >
                  {sq}
                </button>
              ))}
            </div>

            {/* Custom Question Input */}
            <form
              onSubmit={e => {
                e.preventDefault();
                handleSendQuestion();
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={questionInput}
                onChange={e => setQuestionInput(e.target.value)}
                placeholder="اكتب سؤالك الاستكشافي هنا... (مثال: هل أمتلك وحش الكيوبي؟)"
                className="flex-1 py-2.5 px-4 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-all"
              />
              <button
                type="submit"
                disabled={!questionInput.trim() || waitingForOpponentAnswer}
                className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>إرسال السؤال</span>
              </button>
            </form>
          </div>
        )}
      </div>

      {/* GUESS CHARACTER MODAL */}
      {isGuessModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-amber-500/50 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-[0_0_40px_rgba(245,158,11,0.4)] text-center">
            <Trophy className="w-12 h-12 text-amber-400 mx-auto mb-2 animate-bounce" />
            <h3 className="text-xl font-black text-white mb-1">خمن اسم شخصيتك</h3>
            <p className="text-xs text-slate-400 mb-4">
              اكتب اسم الشخصية بالعربي أو الإنجليزي (المطابقة ذكية وتتسامح مع الأخطاء الإملائية والهمزات).
            </p>

            <form
              onSubmit={e => {
                e.preventDefault();
                handlePlayerGuess();
              }}
              className="space-y-4"
            >
              <input
                type="text"
                autoFocus
                value={guessInput}
                onChange={e => setGuessInput(e.target.value)}
                placeholder="مثال: ناروتو, إيتاتشي, سوبارو, ريم..."
                className="w-full py-3 px-4 bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl text-center text-sm font-bold text-white placeholder-slate-600 focus:outline-none transition-all"
              />

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsGuessModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={!guessInput.trim()}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-xs shadow-lg hover:from-amber-400"
                >
                  تأكيد التخمين 🎯
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* GAME OVER RESULTS MODAL */}
      {isGameOver && playerChar && opponentChar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border-2 border-purple-500/50 rounded-3xl p-6 sm:p-8 max-w-lg w-full text-center shadow-2xl">
            <div className="text-4xl mb-2">
              {winner === 'player' ? '🏆' : '💀'}
            </div>
            <h3 className="text-2xl font-black text-white mb-1">
              {winner === 'player' ? 'انتصار مستحق!' : 'هزيمة في المواجهة!'}
            </h3>
            <p className="text-xs text-purple-300 font-semibold mb-6">
              {gameResultReason}
            </p>

            {/* Revealed Cards Showcase */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
                <span className="text-[10px] font-bold text-purple-400 block mb-1">شخصيتك أنت:</span>
                <div className="w-16 h-16 rounded-full overflow-hidden mx-auto mb-2 border-2 border-purple-400">
                  <img src={playerChar.avatar} alt={playerChar.name[lang]} className="w-full h-full object-cover" />
                </div>
                <div className="font-bold text-xs text-white">{playerChar.name[lang]}</div>
              </div>

              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
                <span className="text-[10px] font-bold text-indigo-400 block mb-1">شخصية المنافس:</span>
                <div className="w-16 h-16 rounded-full overflow-hidden mx-auto mb-2 border-2 border-indigo-400">
                  <img src={opponentChar.avatar} alt={opponentChar.name[lang]} className="w-full h-full object-cover" />
                </div>
                <div className="font-bold text-xs text-white">{opponentChar.name[lang]}</div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 mb-4 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <span className="text-xs font-black text-amber-400">+{calculateWhoAmIRewards(playerAttempts, winner === 'player').coins} Coins 🪙</span>
              <span className="text-xs font-black text-cyan-400">+{calculateWhoAmIRewards(playerAttempts, winner === 'player').xp} XP ✨</span>
            </div>

            <button
              onClick={handleFinishMatch}
              className="w-full py-3 bg-gradient-to-r from-cyan-600 to-sky-500 hover:from-cyan-500 hover:to-sky-400 text-white font-black text-sm rounded-xl shadow-lg transition-all"
            >
              متابعة واستلام الجوائز
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
