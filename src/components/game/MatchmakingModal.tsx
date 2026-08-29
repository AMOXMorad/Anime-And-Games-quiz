import React, { useState, useEffect } from 'react';
import { Difficulty, GameModeType } from '../../types';
import { useGame } from '../../context/GameContext';
import { useI18n } from '../../lib/i18n';
import { sounds } from '../../lib/sound';
import { X, Swords, Radar, Copy, Check, Users, KeyRound, Play, RotateCcw } from 'lucide-react';

interface MatchmakingModalProps {
  isOpen: boolean;
  worldId: string;
  difficulty: Difficulty;
  mode?: GameModeType;
  onClose: () => void;
}

export const MatchmakingModal: React.FC<MatchmakingModalProps> = ({
  isOpen,
  worldId,
  difficulty,
  mode = 'super_challenge',
  onClose
}) => {
  const { lang, t } = useI18n();
  const { 
    startMatchmaking,
    createPrivateRoom, 
    joinPrivateRoom, 
    reconnectToActiveRoom,
    savedActiveRoomCode, 
    isSuperMatchmaking, 
    superRoomCode, 
    cancelMatchmaking,
    selectedWorld,
    isPlaying,
    startSoloGame
  } = useGame();

  const [tab, setTab] = useState<'random' | 'private'>('random');
  const [inputCode, setInputCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  // Auto-close modal when random match is found
  useEffect(() => {
    if (isPlaying && isOpen && !superRoomCode) {
      onClose();
    }
  }, [isPlaying, isOpen, superRoomCode]);

  if (!isOpen) return null;

  const currentWorldTitle = selectedWorld?.name[lang] || (worldId === 'naruto' ? 'ناروتو شيبودن' : worldId === 'rezero' ? 'ريزيرو' : 'عالم الفوضى الكونية');
  const currentWorldIcon = selectedWorld?.icon || (worldId === 'naruto' ? '🍥' : worldId === 'rezero' ? '🍎' : '🔮');

  const handleStartRandom = () => {
    startMatchmaking(worldId, mode, difficulty);
  };

  const handleCreateRoom = () => {
    createPrivateRoom(worldId, difficulty, mode);
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

  const handleReconnect = () => {
    const ok = reconnectToActiveRoom();
    if (ok) {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
      {/* Backdrop */}
      <div 
        onClick={() => { onClose(); cancelMatchmaking(); sounds.playClick(); }}
        className="absolute inset-0 bg-black/85 backdrop-blur-md"
      />

      <div className="relative w-full max-w-lg bg-slate-900 border border-cyan-500/50 rounded-3xl p-6 sm:p-8 shadow-[0_0_40px_rgba(6,182,212,0.35)] z-10">
        
        {/* Close Button */}
        <button
          onClick={() => { onClose(); cancelMatchmaking(); sounds.playClick(); }}
          className="absolute top-4 end-4 p-2 rounded-full bg-slate-950/70 border border-slate-700 text-slate-300 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 to-sky-500 shadow-lg mb-2 text-2xl">
            {currentWorldIcon}
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white">ساحة المواجهات التنافسية (1v1)</h3>
          <div className="mt-1 inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-bold">
            <span>نطاق المطابقة:</span>
            <span className="text-white font-black">{currentWorldTitle} فقط</span>
          </div>
        </div>

        {/* Reconnect Banner if previous active room exists */}
        {savedActiveRoomCode && !superRoomCode && (
          <div className="mb-6 p-3.5 rounded-2xl bg-indigo-950/70 border border-indigo-500/50 flex items-center justify-between shadow-lg animate-pulse">
            <div>
              <div className="text-xs font-black text-indigo-300">يوجد مباراة نشطة سابقة!</div>
              <div className="text-[11px] text-slate-300">كود الغرفة: <code className="font-bold text-amber-300">#{savedActiveRoomCode}</code></div>
            </div>
            <button
              onClick={handleReconnect}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1 shadow-md transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>استعادة الغرفة</span>
            </button>
          </div>
        )}

        {/* Tab switcher */}
        {!isSuperMatchmaking && !superRoomCode && (
          <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800 mb-6">
            <button
              onClick={() => { setTab('random'); sounds.playClick(); }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                tab === 'random' ? 'bg-gradient-to-r from-cyan-600 to-sky-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              بحث عشوائي سريع
            </button>
            <button
              onClick={() => { setTab('private'); sounds.playClick(); }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                tab === 'private' ? 'bg-gradient-to-r from-cyan-600 to-sky-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              غرفة خاصة بكود
            </button>
          </div>
        )}

        {/* Content Area */}
        {isSuperMatchmaking ? (
          <div className="py-8 text-center space-y-4">
            <div className="relative w-20 h-20 mx-auto">
              <div className="absolute inset-0 rounded-full border-4 border-cyan-500 border-t-transparent animate-spin" />
              <div className="absolute inset-2 rounded-full border-4 border-sky-400 border-b-transparent animate-spin-slow" />
              <div className="w-full h-full rounded-full flex items-center justify-center">
                <Radar className="w-8 h-8 text-cyan-400 animate-pulse" />
              </div>
            </div>
            <h4 className="text-lg font-black text-white">جاري البحث عن خصم مناسب...</h4>
            <p className="text-xs text-slate-400">نطابقك مع لاعبين من نفس المستوى داخل {currentWorldTitle} فقط</p>

            <button
              onClick={cancelMatchmaking}
              className="mt-4 px-6 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
            >
              إلغاء البحث
            </button>
          </div>
        ) : superRoomCode ? (
          <div className="py-4 text-center space-y-4">
            <div className="p-4 rounded-2xl bg-cyan-950/60 border border-cyan-500/40">
              <span className="text-xs text-cyan-300 font-semibold block mb-1">كود الغرفة الخاصة:</span>
              <div className="text-2xl font-black text-white tracking-widest flex items-center justify-center gap-2">
                <span>#{superRoomCode}</span>
                <button
                  onClick={handleCopyCode}
                  className="p-1.5 rounded-lg bg-cyan-900 text-cyan-300 hover:text-white transition-colors"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-400">
              شارك هذا الكود مع صديقك للدخول والمنافسة مباشرة! إذا انقطع الاتصال يمكنك استكمال المباراة بنفس الكود.
            </p>

            <div className="flex justify-center items-center gap-2 text-xs text-amber-400 font-bold animate-pulse">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span>في انتظار انضمام الخصم...</span>
            </div>

            <button
              onClick={cancelMatchmaking}
              className="mt-2 px-6 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
            >
              إغلاق الغرفة
            </button>
          </div>
        ) : tab === 'random' ? (
          <div className="py-4 text-center space-y-4">
            <p className="text-xs text-slate-300 leading-relaxed">
              انطلق في مواجهة سريعة ضد لاعبين عشوائيين في <span className="text-cyan-300 font-bold">{currentWorldTitle}</span> لإثبات جدارتك وتسلق الترتيب العالمي.
            </p>

            <button
              onClick={handleStartRandom}
              className="w-full py-3.5 bg-gradient-to-r from-cyan-600 via-sky-500 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black text-sm rounded-2xl shadow-[0_0_25px_rgba(6,182,212,0.5)] transition-all flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>بدء البحث عن خصم في {currentWorldTitle}</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Create Room Option */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center">
              <h5 className="font-bold text-white text-xs mb-1">إنشاء غرفة جديدة وتحدي صديق</h5>
              <button
                onClick={handleCreateRoom}
                className="mt-2 w-full py-2.5 bg-gradient-to-r from-cyan-600 to-sky-500 hover:from-cyan-500 hover:to-sky-400 text-white font-bold text-xs rounded-xl shadow-md transition-all"
              >
                توليد كود غرفة خاصة
              </button>
            </div>

            <div className="relative flex items-center justify-center">
              <div className="border-t border-slate-800 w-full" />
              <span className="bg-slate-900 px-3 text-[11px] text-slate-500 font-bold">أو انضم بكود</span>
              <div className="border-t border-slate-800 w-full" />
            </div>

            {/* Join Room Form */}
            <form onSubmit={handleJoinRoom} className="space-y-3">
              <div>
                <input
                  type="text"
                  value={inputCode}
                  onChange={e => setInputCode(e.target.value)}
                  placeholder={`أدخل كود الغرفة (مثال: #${worldId.toUpperCase()}-9281)`}
                  className="w-full py-2.5 px-4 bg-slate-950 border border-slate-800 rounded-xl text-center text-xs font-bold text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>

              {error && (
                <div className="text-xs text-rose-400 text-center font-bold">{error}</div>
              )}

              <button
                type="submit"
                disabled={!inputCode.trim()}
                className="w-full py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-md transition-all"
              >
                دخول الغرفة وبدء المباراة
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};
