import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useI18n } from '../../lib/i18n';
import { sounds } from '../../lib/sound';
import { X, Sparkles, User, Mail, Lock, LogIn, UserPlus, UserCheck } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { loginAsGuest, loginWithEmail, registerWithEmail } = useAuth();
  const { t } = useI18n();

  const [mode, setMode] = useState<'login' | 'register' | 'guest'>('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (mode === 'guest') {
        await loginAsGuest(username.trim() || undefined);
        onClose();
      } else if (mode === 'login') {
        if (!email.trim() || !password.trim()) {
          setError('يرجى ملء جميع الحقول');
          return;
        }
        await loginWithEmail(email.trim(), password.trim());
        onClose();
      } else if (mode === 'register') {
        if (!username.trim() || !email.trim() || !password.trim()) {
          setError('يرجى ملء جميع الحقول');
          return;
        }
        await registerWithEmail(username.trim(), email.trim(), password.trim());
        onClose();
      }
    } catch (err: any) {
      setError(err?.message || 'حدث خطأ في المصادقة');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
      {/* Backdrop */}
      <div 
        onClick={() => { onClose(); sounds.playClick(); }}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      />

      {/* Card */}
      <div className="relative w-full max-w-md bg-slate-900 border border-purple-500/40 rounded-3xl p-6 md:p-8 shadow-[0_0_40px_rgba(147,51,234,0.35)] z-10">
        
        {/* Close Button */}
        <button
          onClick={() => { onClose(); sounds.playClick(); }}
          className="absolute top-4 end-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-cyan-500 shadow-[0_0_15px_rgba(147,51,234,0.5)] mb-3">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-2xl font-black text-white tracking-wide">AG UTOPIA</h3>
          <p className="text-xs text-slate-400 mt-1">{t('appTagline')}</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800 mb-6">
          <button
            onClick={() => { setMode('login'); setError(''); sounds.playClick(); }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              mode === 'login' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            {t('login')}
          </button>
          <button
            onClick={() => { setMode('register'); setError(''); sounds.playClick(); }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              mode === 'register' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            {t('register')}
          </button>
          <button
            onClick={() => { setMode('guest'); setError(''); sounds.playClick(); }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              mode === 'guest' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            {t('guestMode')}
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">{t('username')}</label>
              <div className="relative">
                <User className="absolute start-3 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="مثال: ShadowNinja"
                  className="w-full ps-10 pe-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
            </div>
          )}

          {mode !== 'guest' && (
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">{t('email')} / اسم المستخدم</label>
              <div className="relative">
                <Mail className="absolute start-3 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@example.com أو اسم المستخدم"
                  className="w-full ps-10 pe-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
            </div>
          )}

          {mode !== 'guest' && (
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">{t('password')}</label>
              <div className="relative">
                <Lock className="absolute start-3 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full ps-10 pe-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
            </div>
          )}

          {mode === 'guest' && (
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">اسم العرض (اختياري)</label>
              <div className="relative">
                <User className="absolute start-3 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="Challenger"
                  className="w-full ps-10 pe-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-2">
                سيمكنك خوض جميع التحديات وتجربة كافة المودات فوراً كضيف.
              </p>
            </div>
          )}

          {error && (
            <div className="text-xs text-rose-400 text-center font-bold bg-rose-950/40 border border-rose-500/40 p-2.5 rounded-xl">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs rounded-xl shadow-[0_0_20px_rgba(147,51,234,0.4)] transition-all flex items-center justify-center gap-2"
          >
            {mode === 'login' && <LogIn className="w-4 h-4" />}
            {mode === 'register' && <UserPlus className="w-4 h-4" />}
            {mode === 'guest' && <UserCheck className="w-4 h-4" />}
            <span>
              {mode === 'login' ? t('login') : mode === 'register' ? t('register') : 'بدء اللعب كضيف'}
            </span>
          </button>

        </form>

      </div>
    </div>
  );
};
