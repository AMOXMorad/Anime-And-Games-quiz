import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocial } from '../../context/SocialContext';
import { useTheme } from '../../context/ThemeContext';
import { useI18n } from '../../lib/i18n';
import { sounds } from '../../lib/sound';
import { AvatarWithFrame } from '../ui/AvatarWithFrame';
import { LevelBadge } from '../ui/LevelBadge';
import { 
  Sparkles, 
  Coins, 
  Bell, 
  ShoppingBag, 
  User, 
  Users, 
  Lightbulb, 
  ShieldAlert, 
  Volume2, 
  VolumeX, 
  Languages,
  LogOut,
  LogIn,
  Trophy,
  Sun,
  Moon
} from 'lucide-react';

interface NavbarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  openAuthModal: () => void;
  openNotifications: () => void;
  openFriendsModal: () => void;
  openSuggestionsModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setCurrentView,
  openAuthModal,
  openNotifications,
  openFriendsModal,
  openSuggestionsModal
}) => {
  const { profile, logout } = useAuth();
  const { unreadCount } = useSocial();
  const { theme, toggleTheme } = useTheme();
  const { lang, setLang, t } = useI18n();
  const [isMuted, setIsMuted] = useState<boolean>(sounds.getMuted());

  const toggleSound = () => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
  };

  const toggleLanguage = () => {
    sounds.playClick();
    setLang(lang === 'ar' ? 'en' : 'ar');
  };

  const handleLogout = (e: React.MouseEvent) => {
    e.stopPropagation();
    sounds.playClick();
    logout();
  };

  const isLight = theme === 'light';

  return (
    <header className={`sticky top-0 z-40 backdrop-blur-md transition-colors duration-300 ${
      isLight
        ? 'bg-white/95 border-b border-slate-200 shadow-[0_4px_20px_rgba(0,0,0,0.05)]'
        : 'bg-black/95 border-b border-slate-900 shadow-[0_4px_25px_rgba(0,0,0,0.8)]'
    }`}>
      <div className="max-w-[1500px] mx-auto px-2 sm:px-4 lg:px-6 h-16 flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Brand Logo Image (A.png) - PROMINENT & NON-SHRINKABLE */}
        <div 
          onClick={() => { setCurrentView('worlds'); sounds.playClick(); }}
          className="flex-shrink-0 flex items-center gap-2 cursor-pointer group py-1 pe-1 sm:pe-3 z-10"
          title="AG Utopia - الرئيسية"
        >
          <img 
            src="/A.png" 
            alt="AG Utopia" 
            className="h-10 sm:h-12 w-auto object-contain transition-transform duration-200 group-hover:scale-105 filter drop-shadow-[0_0_14px_rgba(6,182,212,0.6)] group-hover:drop-shadow-[0_0_20px_rgba(14,165,233,0.9)]" 
          />
          <div className="hidden lg:flex flex-col text-start">
            <span className="font-black text-sm tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-sky-400 leading-tight">
              UTOPIA
            </span>
            <span className={`text-[9px] font-bold leading-none ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              ANIME & GAMES
            </span>
          </div>
        </div>

        {/* Center Nav Links */}
        <nav className={`hidden md:flex items-center gap-1.5 p-1.5 rounded-2xl border flex-shrink min-w-0 transition-colors ${
          isLight
            ? 'bg-slate-100/90 border-slate-200/90 shadow-sm'
            : 'bg-[#080d1a] border-slate-800/80 shadow-inner'
        }`}>
          <button
            type="button"
            onClick={() => { setCurrentView('worlds'); sounds.playClick(); }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              currentView === 'worlds'
                ? 'bg-gradient-to-r from-cyan-600 to-sky-500 text-white shadow-md ring-1 ring-white/20'
                : isLight
                ? 'text-slate-600 hover:text-slate-900 hover:bg-white font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60 font-bold'
            }`}
          >
            {t('home')}
          </button>

          <button
            type="button"
            onClick={() => { setCurrentView('store'); sounds.playClick(); }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              currentView === 'store'
                ? 'bg-gradient-to-r from-cyan-600 to-sky-500 text-white shadow-md ring-1 ring-white/20'
                : isLight
                ? 'text-slate-600 hover:text-slate-900 hover:bg-white font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60 font-bold'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>{t('store')}</span>
          </button>

          <button
            type="button"
            onClick={() => { setCurrentView('leaderboard'); sounds.playClick(); }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              currentView === 'leaderboard'
                ? 'bg-gradient-to-r from-cyan-600 to-sky-500 text-white shadow-md ring-1 ring-white/20'
                : isLight
                ? 'text-slate-600 hover:text-slate-900 hover:bg-white font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60 font-bold'
            }`}
          >
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            <span>{t('leaderboard')}</span>
          </button>

          {profile && (
            <button
              type="button"
              onClick={() => { setCurrentView('profile'); sounds.playClick(); }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                currentView === 'profile'
                  ? 'bg-gradient-to-r from-cyan-600 to-sky-500 text-white shadow-md ring-1 ring-white/20'
                  : isLight
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-white font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60 font-bold'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>{t('profile')}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => { openFriendsModal(); sounds.playClick(); }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              isLight
                ? 'text-slate-600 hover:text-slate-900 hover:bg-white font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60 font-bold'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>{t('friends')}</span>
          </button>

          <button
            type="button"
            onClick={() => { setCurrentView('suggestions'); sounds.playClick(); }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              currentView === 'suggestions'
                ? 'bg-gradient-to-r from-cyan-600 to-sky-500 text-white shadow-md ring-1 ring-white/20'
                : isLight
                ? 'text-slate-600 hover:text-slate-900 hover:bg-white font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60 font-bold'
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
            <span>{t('community')}</span>
          </button>

          {/* Admin Control Center Link */}
          {profile?.role === 'admin' && (
            <button
              type="button"
              onClick={() => { setCurrentView('admin'); sounds.playClick(); }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 border whitespace-nowrap cursor-pointer ${
                currentView === 'admin'
                  ? 'bg-rose-600 text-white border-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.5)] ring-1 ring-white/20'
                  : isLight
                  ? 'bg-rose-100/90 hover:bg-rose-200/90 text-rose-800 border-rose-300 font-bold'
                  : 'bg-rose-950/60 text-rose-300 border-rose-500/40 hover:bg-rose-900/60 font-bold'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
              <span>لوحة الأدمن</span>
            </button>
          )}
        </nav>

        {/* Right Section: Theme Toggle, Coins, Notifications, Settings, Profile */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
          
          {/* Coins Display */}
          {profile && (
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border shadow-sm flex-shrink-0 ${
              isLight
                ? 'bg-amber-100/90 border-amber-300 text-amber-900'
                : 'bg-black border-amber-500/30 text-amber-300'
            }`}>
              <Coins className="w-3.5 h-3.5 text-amber-500 animate-spin-slow" />
              <span className={`font-black text-xs ${isLight ? 'text-amber-900' : 'text-amber-300'}`}>
                {profile.coins.toLocaleString()}
              </span>
            </div>
          )}

          {/* Level Badge */}
          {profile && (
            <div className="hidden xl:block flex-shrink-0">
              <LevelBadge level={profile.level} role={profile.role} size="sm" />
            </div>
          )}

          {/* Notification Inbox Bell */}
          {profile && (
            <button
              type="button"
              onClick={openNotifications}
              className={`relative p-2 rounded-xl border transition-all flex-shrink-0 cursor-pointer ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200/80 border-slate-200 text-slate-700 hover:text-slate-900 shadow-sm'
                  : 'bg-black border-slate-800/60 text-slate-400 hover:text-white hover:border-slate-600'
              }`}
              title={t('notifications')}
            >
              <Bell className="w-3.5 h-3.5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -end-1 w-4 h-4 bg-rose-500 text-white font-black text-[10px] rounded-full flex items-center justify-center animate-bounce shadow-md">
                  {unreadCount}
                </span>
              )}
            </button>
          )}

          {/* Theme Toggle (Dark / Light) */}
          <button
            type="button"
            onClick={() => {
              toggleTheme();
              sounds.playClick();
            }}
            className={`p-2 rounded-xl border transition-all flex-shrink-0 cursor-pointer ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200/80 border-slate-200 text-slate-700 hover:text-slate-900 shadow-sm'
                : 'bg-black border-slate-800/60 text-slate-400 hover:text-white hover:border-slate-600'
            }`}
            title={theme === 'dark' ? 'التحويل للوضع الفاتح (Light Mode)' : 'التحويل للوضع الليلي (Dark Mode)'}
          >
            {theme === 'dark' ? (
              <Sun className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-cyan-600" />
            )}
          </button>

          {/* Sound Mute Toggle */}
          <button
            type="button"
            onClick={toggleSound}
            className={`p-2 rounded-xl border transition-all flex-shrink-0 cursor-pointer ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200/80 border-slate-200 text-slate-700 hover:text-slate-900 shadow-sm'
                : 'bg-black border-slate-800/60 text-slate-400 hover:text-white hover:border-slate-600'
            }`}
            title="Toggle Sound FX"
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-500" /> : <Volume2 className="w-3.5 h-3.5 text-cyan-500" />}
          </button>

          {/* Language Toggle (Ar/En) */}
          <button
            type="button"
            onClick={toggleLanguage}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all flex-shrink-0 cursor-pointer ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200/80 border-slate-200 text-slate-700 hover:text-slate-900 shadow-sm'
                : 'bg-black border-slate-800/60 text-slate-300 hover:text-white hover:border-slate-600'
            }`}
            title="Switch Language"
          >
            <Languages className="w-3.5 h-3.5 text-cyan-500" />
            <span>{lang === 'ar' ? 'EN' : 'عربي'}</span>
          </button>

          {/* Profile / Auth Section */}
          {!profile ? (
            <button
              type="button"
              onClick={openAuthModal}
              className="flex items-center gap-1.5 bg-gradient-to-r from-cyan-600 to-sky-500 hover:from-cyan-500 hover:to-sky-400 text-white text-xs font-black px-4 py-2 rounded-xl shadow-[0_2px_12px_rgba(6,182,212,0.4)] transition-all animate-pulse flex-shrink-0 cursor-pointer ring-1 ring-white/20"
            >
              <LogIn className="w-3.5 h-3.5 text-white" />
              <span className="text-white">{t('login')}</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
              <div 
                onClick={() => { setCurrentView('profile'); sounds.playClick(); }}
                className={`flex items-center gap-2 cursor-pointer p-0.5 rounded-full transition-all flex-shrink-0 ${
                  isLight ? 'hover:bg-slate-100' : 'hover:bg-slate-800/60'
                }`}
                title="الملف الشخصي"
              >
                <AvatarWithFrame 
                  avatarUrl={profile.avatar_url} 
                  frameId={profile.active_frame_id} 
                  size="sm" 
                />
                <div className="hidden 2xl:block text-start">
                  <div className={`text-xs font-bold leading-none ${isLight ? 'text-slate-900' : 'text-white'}`}>{profile.username}</div>
                  <div className="text-[10px] text-cyan-500 font-medium">#{profile.tag}</div>
                </div>
              </div>

              {/* Logout button */}
              <button
                type="button"
                onClick={handleLogout}
                className={`flex items-center gap-1 border text-xs font-bold px-2.5 py-1.5 rounded-xl transition-all flex-shrink-0 cursor-pointer ${
                  isLight
                    ? 'bg-rose-100/90 hover:bg-rose-200 border-rose-300 text-rose-800 shadow-sm'
                    : 'bg-black border-slate-800/60 hover:bg-rose-950/60 hover:border-rose-500/50 text-slate-400 hover:text-rose-300'
                }`}
                title="تسجيل الخروج"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">خروج</span>
              </button>
            </div>
          )}

        </div>
      </div>
    </header>
  );
};
