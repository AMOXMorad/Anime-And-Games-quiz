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
  const { loginAsGuest, loginWithEmail, registerWithEmail, profile } = useAuth();
  const { t } = useI18n();

  const [mode, setMode] = useState<'login' | 'register' | 'guest'>('guest');
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
          setError('Please fill all fields');
          return;
        }
        await loginWithEmail(email, password);
        onClose();
      } else if (mode === 'register') {
        if (!username.trim() || !email.trim() || !password.trim()) {
          setError('Please fill all fields');
          return;
        }
        await registerWithEmail(username, email, password);
        onClose();
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        onClick={() => { onClose(); sounds.playClick(); }}
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
      />

      {/* Card */}
      <div className="relative w-full max-w-md bg-slate-900 border border-purple-500/40 rounded-3xl p-6 md:p-8 shadow-[0_0_30px_rgba(147,51,234,0.3)] z-10">
        
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
          <h3 className="text-2xl font-black text-white">AG UTOPIA</h3>
          <p className="text-xs text-slate-400 mt-1">{t('appTagline')}</p>
        </div>

        {/* Tabs */}
        <div className="flex bg-slate-950/70 p-1 rounded-2xl border border-slate-800 mb-6">
          <button
            type="button"
            onClick={() => { setMode('guest'); sounds.playClick(); }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              mode === 'guest'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {t('guestMode')}
          </button>
          <button
            type="button"
            onClick={() => { setMode('login'); sounds.playClick(); }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              mode === 'login'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {t('login')}
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); sounds.playClick(); }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              mode === 'register'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {t('register')}
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/60 border border-rose-600/50 text-rose-300 text-xs text-center font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Guest Mode Form */}
          {mode === 'guest' && (
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                اسم الشينوبي / الجيمر (اختياري)
              </label>
              <div className="relative">
                <User className="absolute start-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="مثال: Kakashi, Shadow, Legend..."
                  className="w-full ps-10 pe-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-2">
                💡 كضيف، ستلعب فوراً وتحفظ نقاطك في السحابة برقم تاغ فريد <span className="text-purple-400 font-bold">#XXXX</span>.
              </p>
            </div>
          )}

          {/* Login Form */}
          {mode === 'login' && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">البريد الإلكتروني / اسم المستخدم</label>
                <div className="relative">
                  <Mail className="absolute start-3.5 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="name@domain.com أو admin"
                    className="w-full ps-10 pe-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">كلمة المرور</label>
                <div className="relative">
                  <Lock className="absolute start-3.5 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full ps-10 pe-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 transition-colors"
                    required
                  />
                </div>
              </div>
            </>
          )}

          {/* Register Form */}
          {mode === 'register' && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">اسم المستخدم</label>
                <div className="relative">
                  <User className="absolute start-3.5 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="Sasuke_99"
                    className="w-full ps-10 pe-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">البريد الإلكتروني</label>
                <div className="relative">
                  <Mail className="absolute start-3.5 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="sasuke@leaf.com"
                    className="w-full ps-10 pe-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">كلمة المرور</label>
                <div className="relative">
                  <Lock className="absolute start-3.5 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full ps-10 pe-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 transition-colors"
                    required
                  />
                </div>
              </div>
            </>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-sm rounded-xl shadow-[0_0_20px_rgba(147,51,234,0.5)] transition-all flex items-center justify-center gap-2 mt-4"
          >
            {mode === 'guest' ? (
              <>
                <UserCheck className="w-4 h-4" />
                <span>دخول فوري كضيف (Play as Guest)</span>
              </>
            ) : mode === 'login' ? (
              <>
                <LogIn className="w-4 h-4" />
                <span>{t('login')}</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>{t('register')}</span>
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
};
