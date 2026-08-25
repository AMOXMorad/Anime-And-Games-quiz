import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocial } from '../../context/SocialContext';
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
  LogIn
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

  return (
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div 
          onClick={() => { setCurrentView('worlds'); sounds.playClick(); }}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-cyan-500 p-0.5 shadow-[0_0_15px_rgba(147,51,234,0.5)] group-hover:shadow-[0_0_20px_rgba(6,182,212,0.7)] transition-all">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-300 text-lg">
              AG
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-black text-xl tracking-wide">
              <span className="text-white">UTOPIA</span>
              <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
            </div>
            <span className="text-[10px] text-slate-400 font-medium hidden sm:block">
              {t('appTagline')}
            </span>
          </div>
        </div>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800/60">
          <button
            onClick={() => { setCurrentView('worlds'); sounds.playClick(); }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              currentView === 'worlds'
                ? 'bg-purple-600 text-white shadow-[0_0_12px_rgba(147,51,234,0.4)]'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            {t('home')}
          </button>

          <button
            onClick={() => { setCurrentView('store'); sounds.playClick(); }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              currentView === 'store'
                ? 'bg-purple-600 text-white shadow-[0_0_12px_rgba(147,51,234,0.4)]'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            {t('shop')}
          </button>

          <button
            onClick={() => { setCurrentView('profile'); sounds.playClick(); }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              currentView === 'profile'
                ? 'bg-purple-600 text-white shadow-[0_0_12px_rgba(147,51,234,0.4)]'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            {t('profile')}
          </button>

          <button
            onClick={openFriendsModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all"
          >
            <Users className="w-3.5 h-3.5" />
            {t('friends')}
          </button>

          <button
            onClick={openSuggestionsModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all"
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
            {t('suggestions')}
          </button>

          {profile?.role === 'admin' && (
            <button
              onClick={() => { setCurrentView('admin'); sounds.playClick(); }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                currentView === 'admin'
                  ? 'bg-rose-600 text-white shadow-[0_0_15px_rgba(225,29,72,0.5)] animate-pulse'
                  : 'text-rose-400 hover:text-white hover:bg-rose-950/40'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              {t('adminPanel')}
            </button>
          )}
        </nav>

        {/* Right Section: Coins, Notifications, Settings, Profile */}
        <div className="flex items-center gap-3">
          
          {/* Coins Display */}
          {profile && (
            <div className="flex items-center gap-1.5 bg-amber-950/40 border border-amber-500/30 px-3 py-1 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.2)]">
              <Coins className="w-4 h-4 text-amber-400 animate-spin-slow" />
              <span className="font-black text-amber-300 text-xs">{profile.coins}</span>
            </div>
          )}

          {/* Level Badge */}
          {profile && (
            <div className="hidden sm:block">
              <LevelBadge level={profile.level} role={profile.role} size="sm" />
            </div>
          )}

          {/* Notification Inbox Bell */}
          <button
            onClick={openNotifications}
            className="relative p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-all"
            title={t('notifications')}
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -end-1 w-4 h-4 bg-rose-500 text-white font-black text-[10px] rounded-full flex items-center justify-center animate-bounce shadow-md">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Sound Mute Toggle */}
          <button
            onClick={toggleSound}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-all"
            title="Toggle Sound FX"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>

          {/* Language Toggle (Ar/En) */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-bold transition-all"
            title="Switch Language"
          >
            <Languages className="w-3.5 h-3.5 text-purple-400" />
            <span>{lang === 'ar' ? 'EN' : 'عربي'}</span>
          </button>

          {/* Profile / Auth Button */}
          {profile ? (
            <div 
              onClick={() => { setCurrentView('profile'); sounds.playClick(); }}
              className="flex items-center gap-2 cursor-pointer p-1 rounded-full hover:bg-slate-800/60 transition-all"
            >
              <AvatarWithFrame frameId={profile.active_frame_id} size="sm" />
              <div className="hidden lg:block text-start">
                <div className="text-xs font-bold text-white leading-none">{profile.username}</div>
                <div className="text-[10px] text-purple-400 font-medium">#{profile.tag}</div>
              </div>
            </div>
          ) : (
            <button
              onClick={openAuthModal}
              className="flex items-center gap-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-[0_0_15px_rgba(147,51,234,0.4)] transition-all"
            >
              <LogIn className="w-3.5 h-3.5" />
              {t('login')}
            </button>
          )}

        </div>
      </div>
    </header>
  );
};
