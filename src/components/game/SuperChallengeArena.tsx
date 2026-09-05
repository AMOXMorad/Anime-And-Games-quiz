import React, { useState, useEffect, useMemo } from 'react';
import { World, Difficulty, Profile } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useGame } from '../../context/GameContext';
import { useI18n } from '../../lib/i18n';
import { sounds } from '../../lib/sound';
import { AvatarWithFrame } from '../ui/AvatarWithFrame';
import { LevelBadge } from '../ui/LevelBadge';
import { Swords, Timer, Zap, Trophy, Shield, Check, X, ArrowRight, AlertTriangle, LogOut } from 'lucide-react';
import confetti from 'canvas-confetti';
import { shuffleTriviaOptions } from '../../data/worlds';
import { normalizeWorld } from '../../lib/indexedDbStorage';
import { generateQuestionsFromCharacters } from '../../lib/excelWorldHelper';
import { checkCharacterGuess } from '../../lib/fuzzyMatch';
import { 
  subscribeToRoomUpdates, 
  sendPlayerHeartbeatAndScore, 
  closeAndArchiveRoom 
} from '../../lib/multiplayerRoom';

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
  const { exitGame, superRoomCode, isHost, synchronizedQuestions } = useGame();

  const normalizedWorld = useMemo(() => normalizeWorld(world), [world]);

  const [currentRound, setCurrentRound] = useState<number>(1); // 1: True/False, 2: Trivia, 3: Who Am I
  const [playerScore, setPlayerScore] = useState<number>(0);
  const [opponentScore, setOpponentScore] = useState<number>(0);
  
  // Round 1 (True/False Blitz) state
  const [tfQuestionIndex, setTfQuestionIndex] = useState<number>(0);
  const [tfQuestions, setTfQuestions] = useState<any[]>([]);
  const [tfAnswered, setTfAnswered] = useState<boolean>(false);
  const [tfUserChoice, setTfUserChoice] = useState<boolean | null>(null);
  const [tfTimeLeft, setTfTimeLeft] = useState<number>(6);

  // Round 2 (Trivia) state
  const [triviaIndex, setTriviaIndex] = useState<number>(0);
  const [triviaQuestions, setTriviaQuestions] = useState<any[]>([]);
  const [triviaAnswered, setTriviaAnswered] = useState<boolean>(false);
  const [triviaSelected, setTriviaSelected] = useState<number | null>(null);
  const [triviaTimeLeft, setTriviaTimeLeft] = useState<number>(12);

  // Round 3 (Who Am I) state — real deduction mode: I see clues about MY OWN
  // secret character (which my opponent can see, but I can't) and must type
  // the correct name. 3 attempts total; a wrong guess reveals the next clue.
  const [whoAmIResolved, setWhoAmIResolved] = useState<boolean>(false);
  const [targetChar, setTargetChar] = useState<any>(null); // the character I must guess
  const [opponentTargetChar, setOpponentTargetChar] = useState<any>(null); // opponent's secret character (shown to me as reference)
  const [whoAmIAttempts, setWhoAmIAttempts] = useState<number>(0); // wrong guesses used, 0..3
  const [whoAmIGuessInput, setWhoAmIGuessInput] = useState<string>('');
  const [whoAmIFeedback, setWhoAmIFeedback] = useState<'correct' | 'wrong' | null>(null);
  const WHO_AM_I_MAX_ATTEMPTS = 3;
  const WHO_AM_I_POINTS_BY_ATTEMPT = [400, 250, 150]; // points if solved on attempt 1 / 2 / 3

  // Multiplayer Live Sync & 20s Disconnect Watchdog
  const [opponentLastActive, setOpponentLastActive] = useState<string | null>(null);
  const [opponentDisconnectWarning, setOpponentDisconnectWarning] = useState<number | null>(null);
  const [isMatchFinished, setIsMatchFinished] = useState<boolean>(false);
  const [showWithdrawConfirm, setShowWithdrawConfirm] = useState<boolean>(false);

  // 1. Initialize Synchronized Question Sequence with Bulletproof Fallbacks
  useEffect(() => {
    let tf: any[] = [];
    let tr: any[] = [];
    let hostChar: any = null;
    let guestChar: any = null;

    if (synchronizedQuestions) {
      if (synchronizedQuestions.round1_tf && synchronizedQuestions.round1_tf.length > 0) {
        tf = synchronizedQuestions.round1_tf;
      }
      if (synchronizedQuestions.round2_trivia && synchronizedQuestions.round2_trivia.length > 0) {
        tr = synchronizedQuestions.round2_trivia;
      }
      if ((synchronizedQuestions as any).round3_char_host) {
        hostChar = (synchronizedQuestions as any).round3_char_host;
      }
      if ((synchronizedQuestions as any).round3_char_guest) {
        guestChar = (synchronizedQuestions as any).round3_char_guest;
      }
      // Backward compatibility with older rooms created before this update,
      // which only stored a single shared round3_char.
      if (!hostChar && !guestChar && (synchronizedQuestions as any).round3_char) {
        hostChar = (synchronizedQuestions as any).round3_char;
        guestChar = (synchronizedQuestions as any).round3_char;
      }
    }

    // Pull from normalized world if still empty
    // Super Challenge spec: Round 1 = 5 True/False questions, Round 2 = 5 general trivia questions.
    const SUPER_TF_COUNT = 5;
    const SUPER_TRIVIA_COUNT = 5;

    if (tf.length === 0) {
      const tfPool = (normalizedWorld?.trueFalseQuestions && normalizedWorld.trueFalseQuestions.length > 0)
        ? normalizedWorld.trueFalseQuestions
        : [];
      tf = [...tfPool].sort(() => 0.5 - Math.random()).slice(0, SUPER_TF_COUNT);
    }

    if (tr.length === 0) {
      const trPool = (normalizedWorld?.triviaQuestions && normalizedWorld.triviaQuestions.length > 0)
        ? normalizedWorld.triviaQuestions
        : [];
      tr = [...trPool].sort(() => 0.5 - Math.random()).slice(0, SUPER_TRIVIA_COUNT).map(shuffleTriviaOptions);
    }

    if (!hostChar || !guestChar) {
      const charPool = normalizedWorld?.characters || [];
      const shuffled = [...charPool].sort(() => 0.5 - Math.random());
      if (!hostChar) hostChar = shuffled[0] || null;
      if (!guestChar) guestChar = (shuffled.length > 1 ? shuffled[1] : shuffled[0]) || null;
    }

    // Auto-generate if still empty but characters exist
    if ((tf.length === 0 || tr.length === 0) && (normalizedWorld?.characters?.length || 0) >= 2) {
      const gen = generateQuestionsFromCharacters(normalizedWorld.characters);
      if (tf.length === 0) tf = gen.trueFalseQuestions.slice(0, SUPER_TF_COUNT);
      if (tr.length === 0) tr = gen.triviaQuestions.slice(0, SUPER_TRIVIA_COUNT).map(shuffleTriviaOptions);
    }

    // Emergency fallbacks so game NEVER renders empty
    if (tf.length === 0) {
      tf = [
        {
          id: 'tf_emerg_1',
          difficulty: 'easy',
          statement: { ar: 'هل شخصيات هذا العالم تمتلك عزيمة وإصراراً لا ينكسر؟', en: 'Do characters in this world possess unbreakable determination?' },
          isCorrect: true,
          explanation: { ar: 'صحيح، جميع أبطال هذا العالم معروفون بإصرارهم.', en: 'Correct, all heroes are known for their grit.' }
        }
      ];
    }

    if (tr.length === 0) {
      tr = [
        {
          id: 'tr_emerg_1',
          difficulty: 'medium',
          question: { ar: 'ما هو الهدف الأسمى للأبطال في هذا العالم؟', en: 'What is the ultimate goal of heroes in this realm?' },
          options: [
            { ar: 'حماية أصدقائهم وعالمهم', en: 'Protect their friends and world' },
            { ar: 'الاستسلام للظلام', en: 'Surrender to darkness' },
            { ar: 'الهروب من التحديات', en: 'Escape challenges' },
            { ar: 'إلغاء القوانين', en: 'Abolish rules' }
          ],
          correctIndex: 0
        }
      ];
    }

    if (!hostChar && (normalizedWorld?.characters?.length || 0) > 0) {
      hostChar = normalizedWorld.characters[0];
    }
    if (!guestChar) {
      guestChar = hostChar;
    }

    const myChar = isHost ? hostChar : guestChar;
    const oppChar = isHost ? guestChar : hostChar;

    setTfQuestions(tf);
    setTriviaQuestions(tr);
    setTargetChar(myChar);
    setOpponentTargetChar(oppChar);
  }, [world, normalizedWorld, synchronizedQuestions, isHost]);

  // 2. Realtime Multiplayer Room Subscription
  useEffect(() => {
    if (!superRoomCode) return;

    const unsubscribe = subscribeToRoomUpdates(superRoomCode, (updatedRoom) => {
      const oppScore = isHost ? updatedRoom.game_state.guest_score : updatedRoom.game_state.host_score;
      const oppLastActive = isHost ? updatedRoom.game_state.guest_last_active : updatedRoom.game_state.host_last_active;
      
      if (oppScore !== undefined && oppScore !== null) {
        setOpponentScore(oppScore);
      }
      if (oppLastActive) {
        setOpponentLastActive(oppLastActive);
      }
    });

    return () => unsubscribe();
  }, [superRoomCode, isHost]);

  // 3. Heartbeat & Live Score Broadcaster (every 2.5s and on score change)
  useEffect(() => {
    if (!superRoomCode || isMatchFinished) return;

    sendPlayerHeartbeatAndScore(superRoomCode, isHost, playerScore, currentRound);

    const interval = setInterval(() => {
      sendPlayerHeartbeatAndScore(superRoomCode, isHost, playerScore, currentRound);
    }, 2500);

    return () => clearInterval(interval);
  }, [superRoomCode, isHost, playerScore, currentRound, isMatchFinished]);

  // 4. 20-Second Disconnect Watchdog (Auto-Forfeit Victory)
  useEffect(() => {
    if (!superRoomCode || !opponentLastActive || isMatchFinished) return;

    const interval = setInterval(() => {
      const lastTime = new Date(opponentLastActive).getTime();
      const diffSeconds = (Date.now() - lastTime) / 1000;

      if (diffSeconds >= 20) {
        // Opponent disconnected for more than 20 seconds -> Automatic Victory!
        setIsMatchFinished(true);
        sounds.playVictory();
        confetti({ particleCount: 150, spread: 100 });
        const finalPts = playerScore + 600;
        setPlayerScore(finalPts);
        closeAndArchiveRoom(
          superRoomCode,
          profile?.id || 'host',
          profile?.username || 'Player',
          'انسحب المنافس أو انقطع اتصاله لأكثر من 20 ثانية (فوز بالانسحاب)',
          isHost ? finalPts : opponentScore,
          isHost ? opponentScore : finalPts
        );
        onComplete(finalPts, opponentScore);
      } else if (diffSeconds >= 8) {
        setOpponentDisconnectWarning(Math.max(1, Math.ceil(20 - diffSeconds)));
      } else {
        setOpponentDisconnectWarning(null);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [superRoomCode, opponentLastActive, isMatchFinished, playerScore, opponentScore, isHost, profile, onComplete]);

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
    if (!superRoomCode && Math.random() > 0.3) {
      setOpponentScore(prev => prev + 120);
    }
  };

  const handleTfAnswer = (choice: boolean) => {
    if (tfAnswered) return;
    setTfUserChoice(choice);
    setTfAnswered(true);
    const q = tfQuestions[tfQuestionIndex];
    if (choice === q.isCorrect) {
      sounds.playCorrect();
      const pts = 120 + tfTimeLeft * 10;
      setPlayerScore(prev => {
        const nextScore = prev + pts;
        if (superRoomCode) {
          sendPlayerHeartbeatAndScore(superRoomCode, isHost, nextScore, 1);
        }
        return nextScore;
      });
    } else {
      sounds.playWrong();
    }
    // Opponent score simulation only if offline/solo
    if (!superRoomCode && Math.random() > 0.35) {
      setOpponentScore(prev => prev + 110 + Math.floor(Math.random() * 40));
    }
  };

  const nextTfQuestion = () => {
    sounds.playClick();
    if (tfQuestionIndex + 1 < tfQuestions.length) {
      setTfQuestionIndex(prev => prev + 1);
      setTfAnswered(false);
      setTfUserChoice(null);
      setTfTimeLeft(6);
    } else {
      // Move to Round 2
      setCurrentRound(2);
      sounds.playVictory();
      if (superRoomCode) {
        sendPlayerHeartbeatAndScore(superRoomCode, isHost, playerScore, 2);
      }
    }
  };

  const handleTriviaTimeout = () => {
    setTriviaAnswered(true);
    sounds.playWrong();
    if (!superRoomCode && Math.random() > 0.4) {
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
      setPlayerScore(prev => {
        const nextScore = prev + pts;
        if (superRoomCode) {
          sendPlayerHeartbeatAndScore(superRoomCode, isHost, nextScore, 2);
        }
        return nextScore;
      });
    } else {
      sounds.playWrong();
    }
    if (!superRoomCode && Math.random() > 0.35) {
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
      if (superRoomCode) {
        sendPlayerHeartbeatAndScore(superRoomCode, isHost, playerScore, 3);
      }
    }
  };

  // Reveals one more clue each time a guess is wrong (1 clue to start, up to 3)
  const whoAmIClueLevel = Math.min(whoAmIAttempts + 1, WHO_AM_I_MAX_ATTEMPTS);

  const getCharClue = (char: any, level: number): string => {
    if (!char) return '';
    const levels = ['easy', 'medium', 'hard'];
    const key = levels[Math.min(level - 1, levels.length - 1)];
    const clue = char.clues?.[key]?.[0];
    if (clue && clue[lang]) return clue[lang];
    // Fallback: any available clue level
    for (const k of levels) {
      const c = char.clues?.[k]?.[0];
      if (c && c[lang]) return c[lang];
    }
    return lang === 'ar' ? 'لا يوجد تلميح متاح لهذه الشخصية.' : 'No clue available for this character.';
  };

  const handleWhoAmISubmitGuess = (e: React.FormEvent) => {
    e.preventDefault();
    if (whoAmIResolved || !targetChar || !whoAmIGuessInput.trim()) return;

    const isCorrect = checkCharacterGuess(whoAmIGuessInput, {
      ar: targetChar.name?.ar || '',
      en: targetChar.name?.en || ''
    });

    if (isCorrect) {
      sounds.playVictory();
      confetti({ particleCount: 80, spread: 70 });
      const pts = WHO_AM_I_POINTS_BY_ATTEMPT[whoAmIAttempts] ?? 100;
      setWhoAmIFeedback('correct');
      setWhoAmIResolved(true);
      setPlayerScore(prev => {
        const nextScore = prev + pts;
        if (superRoomCode) sendPlayerHeartbeatAndScore(superRoomCode, isHost, nextScore, 3);
        return nextScore;
      });
    } else {
      sounds.playWrong();
      setWhoAmIFeedback('wrong');
      const nextAttempts = whoAmIAttempts + 1;
      setWhoAmIAttempts(nextAttempts);
      setWhoAmIGuessInput('');
      if (nextAttempts >= WHO_AM_I_MAX_ATTEMPTS) {
        // Out of attempts — round ends with no points for this round
        setWhoAmIResolved(true);
        if (superRoomCode) sendPlayerHeartbeatAndScore(superRoomCode, isHost, playerScore, 3);
      }
    }

    // Opponent score simulation only if offline/solo (no real room)
    if (!superRoomCode) {
      setOpponentScore(prev => prev + (Math.random() > 0.4 ? 280 : 80));
    }
  };

  // Withdrawal = explicit LOSS for the player who withdraws
  const handleWithdraw = () => {
    setIsMatchFinished(true);
    setShowWithdrawConfirm(false);
    sounds.playWrong();
    
    if (superRoomCode) {
      closeAndArchiveRoom(
        superRoomCode,
        opponent.id,
        opponent.username,
        `انسحب ${profile?.username || 'اللاعب'} من المباراة (خسارة بالانسحاب)`,
        isHost ? 0 : opponentScore,
        isHost ? opponentScore : 0
      );
    }
    // Pass 0 as player score and a high opponent score to guarantee loss
    onComplete(0, opponentScore + 999);
  };

  const handleFinalFinish = () => {
    setIsMatchFinished(true);
    const isPlayerWinner = playerScore >= opponentScore;
    
    // Play correct sound based on actual result
    if (isPlayerWinner) {
      sounds.playVictory();
    } else {
      sounds.playWrong();
    }
    
    if (superRoomCode) {
      closeAndArchiveRoom(
        superRoomCode,
        isPlayerWinner ? (profile?.id || 'player') : opponent.id,
        isPlayerWinner ? (profile?.username || 'Player') : opponent.username,
        `انتهت المواجهة بفوز ${isPlayerWinner ? profile?.username : opponent.username} بنتيجة ${playerScore} مقابل ${opponentScore}`,
        isHost ? playerScore : opponentScore,
        isHost ? opponentScore : playerScore
      );
    }
    onComplete(playerScore, opponentScore);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      
      {/* Disconnect Warning Banner (20s countdown) */}
      {opponentDisconnectWarning !== null && (
        <div className="bg-rose-950/90 border border-rose-500 text-rose-200 px-4 py-3 rounded-2xl mb-4 text-xs font-bold flex items-center justify-between animate-pulse shadow-lg">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span>⚠️ انقطع اتصال الخصم! في حال لم يعد، سيتم إعلان فوزك التلقائي بعد:</span>
          </div>
          <span className="font-mono text-sm px-2.5 py-0.5 rounded-lg bg-rose-900 border border-rose-500 text-rose-300 font-black">
            {opponentDisconnectWarning} ثانية
          </span>
        </div>
      )}

      {/* Room Code Badge */}
      {superRoomCode && (
        <div className="flex justify-center mb-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 border border-purple-500/40 text-purple-300 text-xs font-mono font-bold shadow-md">
            <span>كود الغرفة المتزامنة:</span>
            <span className="text-white font-black">{superRoomCode}</span>
          </div>
        </div>
      )}

      {/* Withdraw Button + Confirmation */}
      {!isMatchFinished && (
        <div className="flex justify-end mb-2">
          <button
            onClick={() => setShowWithdrawConfirm(true)}
            className="px-3 py-1.5 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-300 text-xs font-bold flex items-center gap-1.5 hover:bg-rose-900 transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>انسحاب</span>
          </button>
        </div>
      )}

      {showWithdrawConfirm && (
        <div className="bg-rose-950/95 border border-rose-500 rounded-2xl p-5 mb-4 shadow-2xl animate-fadeIn">
          <h4 className="text-base font-black text-white mb-2">⚠️ هل تريد الانسحاب من المباراة؟</h4>
          <p className="text-xs text-rose-200 mb-4">الانسحاب يعتبر خسارة تلقائية ويمنح الفوز للمنافس فوراً.</p>
          <div className="flex gap-3">
            <button
              onClick={handleWithdraw}
              className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 transition-all"
            >
              نعم، أنسحب (خسارة)
            </button>
            <button
              onClick={() => setShowWithdrawConfirm(false)}
              className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs hover:bg-slate-700 transition-all border border-slate-700"
            >
              لا، استمر في المباراة
            </button>
          </div>
        </div>
      )}

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
              className={`py-4 rounded-2xl font-black text-sm border-2 transition-all flex items-center justify-center gap-2 cursor-pointer ${
                tfAnswered
                  ? tfQuestions[tfQuestionIndex].isCorrect === true
                    ? 'bg-emerald-950 border-emerald-500 text-emerald-300 ring-2 ring-emerald-400'
                    : tfUserChoice === true
                    ? 'bg-rose-950 border-rose-500 text-rose-300 ring-2 ring-rose-400'
                    : 'bg-slate-950/40 border-slate-900 opacity-40'
                  : 'bg-emerald-600/20 hover:bg-emerald-600/40 border-emerald-500/40 text-emerald-300'
              }`}
            >
              <Check className="w-5 h-5" />
              <span>صحيح (TRUE)</span>
            </button>
            <button
              disabled={tfAnswered}
              onClick={() => handleTfAnswer(false)}
              className={`py-4 rounded-2xl font-black text-sm border-2 transition-all flex items-center justify-center gap-2 cursor-pointer ${
                tfAnswered
                  ? tfQuestions[tfQuestionIndex].isCorrect === false
                    ? 'bg-emerald-950 border-emerald-500 text-emerald-300 ring-2 ring-emerald-400'
                    : tfUserChoice === false
                    ? 'bg-rose-950 border-rose-500 text-rose-300 ring-2 ring-rose-400'
                    : 'bg-slate-950/40 border-slate-900 opacity-40'
                  : 'bg-rose-600/20 hover:bg-rose-600/40 border-rose-500/40 text-rose-300'
              }`}
            >
              <X className="w-5 h-5" />
              <span>خطأ (FALSE)</span>
            </button>
          </div>

          {/* Feedback Card */}
          {tfAnswered && (
            <div className={`mt-5 p-4 rounded-2xl border text-center space-y-1.5 animate-fadeIn max-w-md mx-auto ${
              tfUserChoice === tfQuestions[tfQuestionIndex].isCorrect 
                ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-200' 
                : 'bg-rose-950/80 border-rose-500/60 text-rose-200'
            }`}>
              <div className="font-black text-xs flex items-center justify-center gap-1.5">
                {tfUserChoice === tfQuestions[tfQuestionIndex].isCorrect ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-300">إجابتك صحيحة! أحسنت 🎉</span>
                  </>
                ) : (
                  <>
                    <X className="w-4 h-4 text-rose-400" />
                    <span className="text-rose-300">إجابتك خاطئة! ❌</span>
                  </>
                )}
                <span className="text-slate-300 font-bold ms-1">
                  (حقيقة العبارة: {tfQuestions[tfQuestionIndex].isCorrect ? 'صحيحة ✅' : 'خاطئة ❌'})
                </span>
              </div>
              {tfQuestions[tfQuestionIndex].explanation && (
                <div className="text-[11px] text-slate-300 pt-1 border-t border-slate-700/40 leading-tight">
                  💡 {tfQuestions[tfQuestionIndex].explanation[lang]}
                </div>
              )}
            </div>
          )}

          {tfAnswered && (
            <div className="mt-6 flex justify-center">
              <button
                onClick={nextTfQuestion}
                className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg animate-bounce flex items-center gap-1.5 cursor-pointer"
              >
                <span>{tfQuestionIndex + 1 < tfQuestions.length ? 'السؤال التالي' : 'الانتقال للجولة 2 (الترايفيا)'}</span>
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

      {/* ROUND 3: Who Am I Showdown — I must guess MY OWN secret character by name */}
      {currentRound === 3 && targetChar && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
          <div className="text-center mb-6">
            <span className="text-xs font-bold text-amber-400">الجولة الحاسمة: من أنا؟</span>
            <h3 className="text-lg font-black text-white mt-1">
              خمّن هويتك السرية باستخدام التلميحات — لديك {WHO_AM_I_MAX_ATTEMPTS - whoAmIAttempts} محاولات متبقية
            </h3>
          </div>

          {/* Opponent's secret character, shown to me as a reference / classic "who am I" twist */}
          {opponentTargetChar && (
            <div className="mb-5 p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center gap-3 max-w-sm mx-auto">
              <img
                src={opponentTargetChar.avatar}
                alt={opponentTargetChar.name?.[lang]}
                className="w-10 h-10 rounded-full object-cover border border-slate-700"
              />
              <div className="text-[11px] text-slate-400">
                <div className="font-bold text-slate-300">شخصية خصمك السرية:</div>
                <div className="text-amber-300 font-black">{opponentTargetChar.name?.[lang]}</div>
              </div>
            </div>
          )}

          {/* Progressive clues */}
          <div className="space-y-2 mb-6 max-w-lg mx-auto">
            {Array.from({ length: whoAmIClueLevel }).map((_, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/30 text-amber-100 text-xs leading-relaxed">
                💡 تلميح {idx + 1}: {getCharClue(targetChar, idx + 1)}
              </div>
            ))}
          </div>

          {!whoAmIResolved ? (
            <form onSubmit={handleWhoAmISubmitGuess} className="max-w-md mx-auto space-y-3">
              <input
                type="text"
                value={whoAmIGuessInput}
                onChange={(e) => setWhoAmIGuessInput(e.target.value)}
                placeholder="اكتب اسم شخصيتك السرية هنا..."
                autoFocus
                className="w-full py-3 px-4 bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl text-center text-sm font-bold text-white placeholder-slate-600 outline-none transition-colors"
              />
              <button
                type="submit"
                disabled={!whoAmIGuessInput.trim()}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 disabled:opacity-40 text-slate-950 font-black text-sm rounded-xl shadow-md transition-all"
              >
                تأكيد التخمين
              </button>

              {whoAmIFeedback === 'wrong' && (
                <div className="text-center text-xs font-bold text-rose-400 animate-fadeIn">
                  تخمين خاطئ! جرّب مرة أخرى باستخدام التلميح الجديد ❌
                </div>
              )}
            </form>
          ) : (
            <div className="text-center space-y-4">
              <div className={`p-4 rounded-2xl border max-w-md mx-auto ${
                whoAmIFeedback === 'correct'
                  ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-200'
                  : 'bg-rose-950/80 border-rose-500/60 text-rose-200'
              }`}>
                <div className="font-black text-sm mb-1">
                  {whoAmIFeedback === 'correct' ? '🎉 خمّنت هويتك بنجاح!' : '😔 انتهت محاولاتك الثلاث'}
                </div>
                <div className="text-xs">
                  شخصيتك السرية كانت: <span className="font-black">{targetChar.name?.[lang]}</span>
                </div>
              </div>

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
