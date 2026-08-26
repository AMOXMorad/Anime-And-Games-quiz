import React from 'react';
import { useI18n } from '../../lib/i18n';
import { useGame } from '../../context/GameContext';
import { sounds } from '../../lib/sound';
import { Trophy, Coins, Sparkles, ArrowRight, RotateCcw, Home } from 'lucide-react';

interface VictoryModalProps {
  isOpen: boolean;
  won: boolean;
  score: number;
  opponentScore?: number;
  xpEarned: number;
  coinsEarned: number;
  onClose: () => void;
  onPlayAgain: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  isOpen,
  won,
  score,
  opponentScore,
  xpEarned,
  coinsEarned,
  onClose,
  onPlayAgain
}) => {
  const { t } = useI18n();
  const { exitGame } = useGame();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/85 backdrop-blur-md" />

      <div className="relative w-full max-w-md bg-slate-900 border border-cyan-500/50 rounded-3xl p-6 sm:p-8 text-center shadow-[0_0_50px_rgba(6,182,212,0.35)] z-10 animate-fadeIn">
        
        {/* Crest Icon */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 p-1 shadow-[0_0_30px_rgba(245,158,11,0.6)] mb-4 animate-bounce">
          <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center">
            <Trophy className="w-10 h-10 text-amber-400" />
          </div>
        </div>

        {/* Title */}
        <h3 className="text-2xl sm:text-3xl font-black text-white mb-1">
          {won ? t('victory') : t('defeat')}
        </h3>
        <p className="text-xs text-slate-400 mb-6">
          {won ? 'أداء مبهر واستثنائي في عالم يوتوبيا!' : 'حاول مرة أخرى لتصعد في سلم الملوك!'}
        </p>

        {/* Score Summary Box */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 mb-6 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold border-b border-slate-800 pb-2">
            <span className="text-slate-400">نقاطك الإجمالية:</span>
            <span className="text-white text-base font-black text-cyan-400">{score} pts</span>
          </div>

          {opponentScore !== undefined && (
            <div className="flex items-center justify-between text-xs font-bold border-b border-slate-800 pb-2">
              <span className="text-slate-400">نقاط المنافس:</span>
              <span className="text-slate-300 text-sm font-black">{opponentScore} pts</span>
            </div>
          )}

          {/* Rewards Grid */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="p-2.5 rounded-xl bg-cyan-950/50 border border-cyan-500/30 flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span className="font-black text-cyan-300 text-xs">+{xpEarned} XP</span>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/30 flex items-center justify-center gap-2">
              <Coins className="w-4 h-4 text-amber-400" />
              <span className="font-black text-amber-300 text-xs">+{coinsEarned} Coins</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => { exitGame(); onClose(); sounds.playClick(); }}
            className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center justify-center gap-2 transition-all"
          >
            <Home className="w-4 h-4" />
            <span>الرئيسية</span>
          </button>

          <button
            onClick={() => { onPlayAgain(); onClose(); sounds.playClick(); }}
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-sky-500 hover:from-cyan-500 hover:to-sky-400 text-white font-black text-xs shadow-[0_0_15px_rgba(6,182,212,0.4)] flex items-center justify-center gap-2 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>تحدي جديد</span>
          </button>
        </div>

      </div>
    </div>
  );
};
