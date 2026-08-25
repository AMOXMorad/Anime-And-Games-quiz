import React, { useState } from 'react';
import { Difficulty } from '../../types';
import { useGame } from '../../context/GameContext';
import { useI18n } from '../../lib/i18n';
import { sounds } from '../../lib/sound';
import { X, Swords, Radar, Copy, Check, Users, KeyRound, Play } from 'lucide-react';

interface MatchmakingModalProps {
  isOpen: boolean;
  worldId: string;
  difficulty: Difficulty;
  onClose: () => void;
}

export const MatchmakingModal: React.FC<MatchmakingModalProps> = ({
  isOpen,
  worldId,
  difficulty,
  onClose
}) => {
  const { t } = useI18n();
  const { 
    startSuperMatchmaking, 
    createPrivateRoom, 
    joinPrivateRoom, 
    isSuperMatchmaking, 
    superRoomCode, 
    cancelMatchmaking 
  } = useGame();

  const [tab, setTab] = useState<'random' | 'private'>('random');
  const [inputCode, setInputCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleStartRandom = () => {
    startSuperMatchmaking(worldId, difficulty);
  };

  const handleCreateRoom = () => {
    createPrivateRoom(worldId, difficulty);
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const res = joinPrivateRoom(inputCode);
    if (!res.success) {
      setError(res.message);
    } else {
      onClose();
    }
  };

  const handleCopyCode = () => {
    if (superRoomCode) {
      navigator.clipboard.writeText(superRoomCode);
      setCopied(true);
      sounds.playClick();
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        onClick={() => { onClose(); cancelMatchmaking(); sounds.playClick(); }}
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
      />

      <div className="relative w-full max-w-lg bg-slate-900 border border-purple-500/50 rounded-3xl p-6 sm:p-8 shadow-[0_0_40px_rgba(147,51,234,0.4)] z-10">
        
        {/* Close Button */}
        <button
          onClick={() => { onClose(); cancelMatchmaking(); sounds.playClick(); }}
          className="absolute top-4 end-4 p-2 rounded-full bg-slate-950/70 border border-slate-700 text-slate-300 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-600 to-purple-600 shadow-lg mb-2">
            <Swords className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-2xl font-black text-white">تحدي الـ Super التنافسي (1v1)</h3>
          <p className="text-xs text-slate-400 mt-1">واجه لاعبين حقيقيين أونلاين بنقاط السرعة والدقة</p>
        </div>

        {/* Tab switcher */}
        {!isSuperMatchmaking && !superRoomCode && (
          <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800 mb-6">
            <button
              onClick={() => { setTab('random'); sounds.playClick(); }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                tab === 'random' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              {t('randomMatchmaking')}
            </button>
            <button
              onClick={() => { setTab('private'); sounds.playClick(); }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                tab === 'private' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              {t('privateRoom')}
            </button>
          </div>
        )}

        {/* Tab 1: Random Matchmaking */}
        {tab === 'random' && (
          <div className="text-center py-4">
            {isSuperMatchmaking ? (
              <div className="space-y-4">
                <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-4 border-purple-500/30 border-t-purple-500 animate-spin" />
                  <Radar className="w-10 h-10 text-cyan-400 animate-pulse" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">{t('waitingForOpponent')}</h4>
                  <span className="text-xs text-slate-400">جاري مسح اللوبي للبحث عن خصم في نفس المستوى...</span>
                </div>
                <button
                  onClick={cancelMatchmaking}
                  className="px-5 py-2 rounded-xl bg-slate-800 text-xs font-bold text-slate-300 hover:text-white"
                >
                  إلغاء البحث
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto">
                  سيتم إدخالك في طابور البحث عن لاعبين نشطين في عالم <span className="text-purple-400 font-bold">{worldId}</span> بمستوى الصعوبة <span className="text-amber-400 font-bold">{difficulty}</span>.
                </p>
                <button
                  onClick={handleStartRandom}
                  className="w-full py-3.5 bg-gradient-to-r from-rose-600 via-purple-600 to-indigo-600 text-white font-black text-sm rounded-2xl shadow-[0_0_20px_rgba(225,29,72,0.5)] hover:scale-102 transition-all flex items-center justify-center gap-2"
                >
                  <Swords className="w-4 h-4" />
                  <span>بدء البحث عن منافس عشوائي</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Private Room */}
        {tab === 'private' && (
          <div className="space-y-6">
            {superRoomCode ? (
              <div className="p-6 rounded-2xl bg-slate-950 border border-purple-500/50 text-center space-y-3">
                <span className="text-xs text-slate-400 font-bold">كود الغرفة الخاصة بك:</span>
                <div className="text-3xl font-black text-amber-400 tracking-wider font-mono">
                  {superRoomCode}
                </div>
                <button
                  onClick={handleCopyCode}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? t('codeCopied') : t('copyCode')}</span>
                </button>
                <div className="text-xs text-slate-400 pt-2 animate-pulse">
                  أرسل الكود لصديقك للانضمام، وستبدأ المباراة فور دخوله!
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Create room button */}
                <button
                  onClick={handleCreateRoom}
                  className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>{t('createRoom')}</span>
                </button>

                <div className="relative text-center">
                  <span className="bg-slate-900 px-3 text-xs text-slate-500 font-bold">أو انضم لغرفة صديقك</span>
                  <div className="absolute inset-x-0 top-1/2 border-t border-slate-800 -z-10" />
                </div>

                {/* Join room form */}
                <form onSubmit={handleJoinRoom} className="space-y-2">
                  <input
                    type="text"
                    value={inputCode}
                    onChange={e => setInputCode(e.target.value)}
                    placeholder={t('enterRoomCode')}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-center text-sm font-mono text-white placeholder-slate-600 focus:outline-none focus:border-purple-500"
                  />
                  {error && <div className="text-xs text-rose-400 text-center font-bold">{error}</div>}
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-all"
                  >
                    {t('joinRoom')}
                  </button>
                </form>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
