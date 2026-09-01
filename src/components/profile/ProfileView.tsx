import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useI18n } from '../../lib/i18n';
import { sounds } from '../../lib/sound';
import { AvatarWithFrame } from '../ui/AvatarWithFrame';
import { LevelBadge } from '../ui/LevelBadge';
import { calculateLevel, getRankTier } from '../../lib/ranks';
import { getActiveStoreItems } from '../store/StoreView';
import { AvatarModal } from './modals/AvatarModal';
import { FrameModal } from './modals/FrameModal';
import { TagModal } from './modals/TagModal';
import { TitleModal } from './modals/TitleModal';
import { 
  User, 
  Crown, 
  Sparkles, 
  Shield, 
  Trophy, 
  Zap, 
  Flame, 
  Swords, 
  CheckCircle, 
  Copy, 
  Check, 
  Wand2, 
  Image,
  Gift,
  Coins,
  Medal,
  BarChart3,
  HelpCircle,
  Brain,
  Sparkle,
  Settings,
  Edit3,
  Quote,
  Clock,
  Save,
  AlertCircle,
  ExternalLink,
  Layers
} from 'lucide-react';
import confetti from 'canvas-confetti';

type ProfileTab = 'overview' | 'avatars' | 'frames' | 'tags' | 'titles' | 'edit_profile' | 'redeem';

export const ProfileView: React.FC = () => {
  const { profile, inventory, updateShowcases, equipItem, updateProfileDetails, redeemPromoCode } = useAuth();
  const { lang, t } = useI18n();

  const [activeTab, setActiveTab] = useState<ProfileTab>('overview');
  const [avatarFilter, setAvatarFilter] = useState<'all' | 'naruto' | 'rezero'>('all');
  const [copiedTag, setCopiedTag] = useState(false);
  const [promoInput, setPromoInput] = useState('');
  const [promoFeedback, setPromoFeedback] = useState<{ success?: boolean; message?: string } | null>(null);

  // Modal Popups for Quick Equipment
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isFrameModalOpen, setIsFrameModalOpen] = useState(false);
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [isTitleModalOpen, setIsTitleModalOpen] = useState(false);

  // Edit Profile Form State
  const [editUsername, setEditUsername] = useState(profile?.username || '');
  const [editBio, setEditBio] = useState(profile?.bio || '');
  const [editFeedback, setEditFeedback] = useState<{ success?: boolean; message?: string } | null>(null);

  if (!profile) return null;

  const activeStoreItems = getActiveStoreItems();

  const { currentLevelXp, nextLevelXp, progress } = calculateLevel(profile.xp);
  const tier = getRankTier(profile.level, profile.role);
  const winRate = profile.stats.totalMatches > 0
    ? Math.round((profile.stats.wins / profile.stats.totalMatches) * 100)
    : 0;

  // Check 14-day username change eligibility
  const lastChangeTime = profile.last_username_change_at ? new Date(profile.last_username_change_at).getTime() : 0;
  const daysSinceLastChange = (Date.now() - lastChangeTime) / (1000 * 60 * 60 * 24);
  const canChangeName = profile.role === 'admin' || !profile.last_username_change_at || daysSinceLastChange >= 14;
  const remainingNameChangeDays = Math.ceil(14 - daysSinceLastChange);

  const handleCopyTag = () => {
    navigator.clipboard.writeText(`${profile.username}#${profile.tag}`);
    setCopiedTag(true);
    sounds.playClick();
    setTimeout(() => setCopiedTag(false), 2000);
  };

  // Starter items owned by default by all users
  const starterItemIds = new Set(['avatar_default', 'frame_default', 'tag_rookie', 'title_novice']);
  const isItemOwned = (item: StoreItem) => {
    if (profile.role === 'admin') return true;
    if (inventory.includes(item.id)) return true;
    if (starterItemIds.has(item.id)) return true;
    return false;
  };

  // Get owned items
  const ownedAvatars = activeStoreItems.filter(i => i.type === 'avatar' && isItemOwned(i));
  const ownedTitles = activeStoreItems.filter(i => i.type === 'title' && isItemOwned(i));
  const ownedTags = activeStoreItems.filter(i => i.type === 'tag' && isItemOwned(i));
  const ownedFrames = activeStoreItems.filter(i => i.type === 'frame' && isItemOwned(i));

  // Active equipped items metadata
  const activeTitleObj = activeStoreItems.find(i => i.id === profile.active_title_id);
  const activeTitleName = activeTitleObj ? (lang === 'ar' ? activeTitleObj.name_ar : activeTitleObj.name_en) : (lang === 'ar' ? 'متحدي يوتوبيا' : 'Utopia Challenger');
  
  const activeTagObj = activeStoreItems.find(i => i.id === profile.active_tag_id);
  const activeTagEmoji = activeTagObj?.asset_url || '🔰';

  const activeFrameObj = activeStoreItems.find(i => i.id === profile.active_frame_id);
  const activeFrameName = activeFrameObj ? (lang === 'ar' ? activeFrameObj.name_ar : activeFrameObj.name_en) : (lang === 'ar' ? 'إطار البداية' : 'Default Frame');

  const toggleShowcase = (type: 'titles' | 'tags' | 'frames' | 'avatars', itemId: string) => {
    sounds.playClick();
    let current =
      type === 'titles'
        ? [...profile.showcase_titles]
        : type === 'tags'
        ? [...profile.showcase_tags]
        : type === 'frames'
        ? [...profile.showcase_frames]
        : [...(profile.showcase_avatars || [])];

    if (current.includes(itemId)) {
      current = current.filter(id => id !== itemId);
    } else {
      if (current.length < 5) {
        current.push(itemId);
      }
    }
    updateShowcases(type, current);
  };

  const handleSaveProfileChanges = (e: React.FormEvent) => {
    e.preventDefault();
    const res = updateProfileDetails(editUsername, editBio);
    setEditFeedback(res);
    if (res.success) {
      confetti({ particleCount: 70, spread: 60 });
      setTimeout(() => setEditFeedback(null), 4000);
    }
  };

  const handleRedeemCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;

    const res = redeemPromoCode(promoInput, activeStoreItems);
    setPromoFeedback({ success: res.success, message: res.message });
    if (res.success) {
      setPromoInput('');
    }
  };

  // Filtered avatars for Avatars tab
  const filteredAvatars = ownedAvatars.filter(av => {
    if (avatarFilter === 'all') return true;
    return av.avatar_category === avatarFilter;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      
      {/* ========================================================= */}
      {/* 1. Profile Header Hero Card (بطاقة الهوية والبروفايل الملكية) */}
      {/* ========================================================= */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-purple-950/40 border border-slate-800 p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Avatar & Identity Info */}
          <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-start">
            {/* 2xl Circular Avatar with Frame */}
            <div 
              onClick={() => { setIsAvatarModalOpen(true); sounds.playClick(); }}
              className="w-32 h-32 min-w-[128px] min-h-[128px] max-w-[128px] max-h-[128px] aspect-square flex-shrink-0 relative flex items-center justify-center cursor-pointer group"
              title="انقر لتغيير وتجهيز الأفاتار"
            >
              <AvatarWithFrame 
                avatarUrl={profile.avatar_url} 
                frameId={profile.active_frame_id} 
                size="2xl" 
              />
              <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-opacity backdrop-blur-[2px]">
                <Wand2 className="w-5 h-5 text-pink-300 animate-pulse" />
              </div>
            </div>

            <div className="flex-1">
              {/* Username + Active Tag + Tag Copy */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 mb-2">
                <button
                  type="button"
                  onClick={() => { setIsTagModalOpen(true); sounds.playClick(); }}
                  className="text-2xl filter drop-shadow-[0_0_6px_rgba(255,255,255,0.4)] hover:scale-110 transition-transform cursor-pointer"
                  title="انقر لتغيير الشارة / التاج"
                >
                  {activeTagEmoji}
                </button>
                <h1 className="text-2xl sm:text-3xl font-black text-white">{profile.username}</h1>
                <button
                  onClick={handleCopyTag}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-purple-950/60 border border-purple-500/40 text-purple-300 text-xs font-bold hover:bg-purple-900/60 transition-all cursor-pointer shadow-sm"
                  title="نسخ التاغ الكامل"
                >
                  <span>#{profile.tag}</span>
                  {copiedTag ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>

                <button
                  onClick={() => { setActiveTab('edit_profile'); sounds.playClick(); }}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>تعديل</span>
                </button>
              </div>

              {/* Title & Level & Coins Badges */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-3">
                <LevelBadge level={profile.level} role={profile.role} showName size="md" />
                
                {/* Active Title */}
                <button
                  type="button"
                  onClick={() => { setIsTitleModalOpen(true); sounds.playClick(); }}
                  className="text-xs font-bold text-amber-400 px-3 py-1 rounded-full bg-amber-950/60 border border-amber-500/30 flex items-center gap-1 shadow-sm hover:border-amber-400 hover:bg-amber-900/50 transition-all cursor-pointer"
                  title="انقر لتغيير اللقب"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>{activeTitleName}</span>
                </button>

                {/* Active Frame Badge */}
                <button
                  type="button"
                  onClick={() => { setIsFrameModalOpen(true); sounds.playClick(); }}
                  className="text-xs font-bold text-cyan-300 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 flex items-center gap-1 shadow-sm hover:border-cyan-400 hover:bg-cyan-900/50 transition-all cursor-pointer"
                  title="انقر لتغيير الإطار"
                >
                  <Shield className="w-3 h-3" />
                  <span>{activeFrameName}</span>
                </button>

                {/* Coins Badge */}
                <span className="text-xs font-bold text-yellow-300 px-3 py-1 rounded-full bg-yellow-950/50 border border-yellow-500/30 flex items-center gap-1 shadow-sm">
                  <span>🪙</span>
                  <span>{profile.coins.toLocaleString()} كوينز</span>
                </span>
              </div>

              {/* Bio / Description display */}
              {profile.bio && (
                <div className="mb-3 p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 italic flex items-start gap-2 max-w-lg">
                  <Quote className="w-3.5 h-3.5 text-purple-400 flex-shrink-0 mt-0.5" />
                  <p className="line-clamp-2">{profile.bio}</p>
                </div>
              )}

              {/* XP Progress Bar (Fixed bidi direction) */}
              <div className="w-full max-w-md">
                <div className="flex justify-between items-center text-xs text-slate-400 font-bold mb-1.5">
                  <span>مستوى {profile.level} ({tier.name[lang]})</span>
                  <div className="flex items-center gap-1">
                    <span dir="ltr" className="inline-block text-purple-300 font-black">{currentLevelXp} / {nextLevelXp} XP</span>
                    <span>({progress}%)</span>
                  </div>
                </div>
                <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5 shadow-inner">
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-purple-600 via-indigo-500 to-cyan-400 transition-all duration-500 shadow-[0_0_10px_rgba(147,51,234,0.6)]"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Win Rate Card */}
          <div className="bg-slate-950/80 border border-slate-800 p-5 rounded-2xl text-center min-w-[170px] shadow-lg">
            <div className="text-3xl font-black text-emerald-400 mb-1">{winRate}%</div>
            <span className="text-xs font-bold text-slate-400">{t('winRate')}</span>
            <div className="text-[11px] text-purple-300 mt-2 font-semibold">
              {profile.stats.wins} فوز من {profile.stats.totalMatches} معركة
            </div>
            {profile.stats.streak > 0 && (
              <div className="mt-2 text-xs font-bold text-amber-400 flex items-center justify-center gap-1 bg-amber-950/50 py-0.5 px-2 rounded-lg border border-amber-500/20">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>سلسلة {profile.stats.streak} انتصارات</span>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. Navigation Tabs Bar (أقسام وتخصيص البروفايل) */}
      {/* ========================================================= */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800 scrollbar-none">
        <button
          onClick={() => { setActiveTab('overview'); sounds.playClick(); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.5)]'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>نظرة عامة والإحصائيات</span>
        </button>

        <button
          onClick={() => { setActiveTab('edit_profile'); sounds.playClick(); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'edit_profile'
              ? 'bg-gradient-to-r from-amber-600 to-rose-600 text-white shadow-[0_0_15px_rgba(244,63,94,0.5)]'
              : 'bg-slate-900 border border-slate-800 text-amber-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>تعديل الملف الشخصي</span>
        </button>

        <button
          onClick={() => { setActiveTab('avatars'); sounds.playClick(); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'avatars'
              ? 'bg-pink-600 text-white shadow-[0_0_15px_rgba(219,39,119,0.5)]'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Wand2 className="w-4 h-4" />
          <span>صور الأفاتار ({ownedAvatars.length})</span>
        </button>

        <button
          onClick={() => { setActiveTab('frames'); sounds.playClick(); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'frames'
              ? 'bg-cyan-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.5)]'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>الإطارات ({ownedFrames.length})</span>
        </button>

        <button
          onClick={() => { setActiveTab('tags'); sounds.playClick(); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'tags'
              ? 'bg-amber-600 text-white shadow-[0_0_15px_rgba(217,119,6,0.5)]'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Crown className="w-4 h-4" />
          <span>التيجان والشارات ({ownedTags.length})</span>
        </button>

        <button
          onClick={() => { setActiveTab('titles'); sounds.playClick(); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'titles'
              ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.5)]'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>الألقاب ({ownedTitles.length})</span>
        </button>

        <button
          onClick={() => { setActiveTab('redeem'); sounds.playClick(); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'redeem'
              ? 'bg-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.5)]'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Gift className="w-4 h-4" />
          <span>كود الهدية</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* TAB 0: EDIT PROFILE (تعديل الملف الشخصي والنبذة والاسم) */}
      {/* ========================================================= */}
      {activeTab === 'edit_profile' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-8 animate-fadeIn">
          <div>
            <h3 className="font-black text-xl text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-amber-400" />
              <span>تعديل بيانات الملف الشخصي والهوية</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              تحكم بالاسم، النبذة الشخصية، وتجهيز العناصر المعروضة في بروفايلك العام
            </p>
          </div>

          <form onSubmit={handleSaveProfileChanges} className="space-y-6 max-w-3xl">
            {/* Username Field */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-indigo-400" />
                  <span>اسم المستخدم (Username)</span>
                </label>

                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                  canChangeName 
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40' 
                    : 'bg-amber-950 text-amber-400 border border-amber-500/40'
                }`}>
                  {canChangeName ? 'متاح للتغيير الآن' : `متبقي ${remainingNameChangeDays} يوم`}
                </span>
              </div>

              <input
                type="text"
                disabled={!canChangeName}
                value={editUsername}
                onChange={e => setEditUsername(e.target.value)}
                placeholder="اسم المستخدم الجديد"
                className={`w-full py-2.5 px-4 bg-slate-900 border rounded-xl text-sm font-bold text-white focus:outline-none transition-all ${
                  canChangeName 
                    ? 'border-slate-700 focus:border-indigo-500' 
                    : 'border-slate-800 opacity-60 cursor-not-allowed'
                }`}
              />

              <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                <span>يُسمح بتغيير اسم المستخدم مرة واحدة كل 14 يوماً (أسبوعين) لمنع انتحال الهويات.</span>
              </p>
            </div>

            {/* Bio / Description Field */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Quote className="w-4 h-4 text-purple-400" />
                  <span>النبذة الشخصية والوصف (Bio)</span>
                </label>
                <span className="text-[11px] text-slate-500">{editBio.length} / 250</span>
              </div>

              <textarea
                rows={3}
                maxLength={250}
                value={editBio}
                onChange={e => setEditBio(e.target.value)}
                placeholder="اكتب نبذة مميزة عنك أو اقتباسك المفضل ليظهر في بروفايلك العام..."
                className="w-full py-2.5 px-4 bg-slate-900 border border-slate-700 focus:border-purple-500 rounded-xl text-xs sm:text-sm text-white focus:outline-none transition-all"
              />
            </div>

            {/* Feedback Message */}
            {editFeedback && (
              <div className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2 animate-fadeIn ${
                editFeedback.success 
                  ? 'bg-emerald-950/80 border border-emerald-500/50 text-emerald-300' 
                  : 'bg-rose-950/80 border border-rose-500/50 text-rose-300'
              }`}>
                {editFeedback.success ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                <span>{editFeedback.message}</span>
              </div>
            )}

            {/* Save Button */}
            <button
              type="submit"
              className="px-8 py-3.5 bg-gradient-to-r from-amber-600 via-purple-600 to-indigo-600 hover:from-amber-500 hover:to-indigo-500 text-white font-black text-xs sm:text-sm rounded-2xl transition-all shadow-[0_0_20px_rgba(168,85,247,0.4)] flex items-center justify-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>حفظ تعديلات الملف الشخصي</span>
            </button>
          </form>

          {/* Quick Identity Selection Hub */}
          <div className="pt-6 border-t border-slate-800 space-y-4">
            <h4 className="font-bold text-sm text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>التجهيز السريع لعناصر الهوية المملوكة</span>
            </h4>
            <p className="text-xs text-slate-400">
              انقر على أي بطاقة لفتح نافذة التجهيز المنبثقة، اختيار العنصر، ومعاينته مباشرة ثم الضغط على حفظ.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Active Avatar Selector Card */}
              <div 
                onClick={() => { setIsAvatarModalOpen(true); sounds.playClick(); }}
                className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-pink-500/60 hover:bg-slate-900/80 transition-all cursor-pointer space-y-2 group shadow-md"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-pink-400">الأفاتار النشط:</span>
                  <span className="text-[10px] text-pink-400/80 group-hover:text-pink-300 font-bold flex items-center gap-0.5">
                    <span>نافذة التجهيز</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-slate-700 group-hover:scale-105 transition-transform flex-shrink-0">
                    <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                  </div>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setIsAvatarModalOpen(true); sounds.playClick(); }}
                    className="text-xs text-pink-400 hover:text-pink-300 font-bold text-start cursor-pointer group-hover:underline"
                  >
                    تغيير الأفاتار ➔
                  </button>
                </div>
              </div>

              {/* Active Frame Selector Card */}
              <div 
                onClick={() => { setIsFrameModalOpen(true); sounds.playClick(); }}
                className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-cyan-500/60 hover:bg-slate-900/80 transition-all cursor-pointer space-y-2 group shadow-md"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-cyan-400">الإطار النشط:</span>
                  <span className="text-[10px] text-cyan-400/80 group-hover:text-cyan-300 font-bold flex items-center gap-0.5">
                    <span>نافذة التجهيز</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 flex items-center justify-center group-hover:scale-105 transition-transform flex-shrink-0">
                    <AvatarWithFrame avatarUrl={profile.avatar_url} frameId={profile.active_frame_id} size="sm" />
                  </div>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setIsFrameModalOpen(true); sounds.playClick(); }}
                    className="text-xs text-cyan-400 hover:text-cyan-300 font-bold text-start cursor-pointer truncate group-hover:underline"
                  >
                    تغيير الإطار ➔
                  </button>
                </div>
              </div>

              {/* Active Tag Selector Card */}
              <div 
                onClick={() => { setIsTagModalOpen(true); sounds.playClick(); }}
                className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-amber-500/60 hover:bg-slate-900/80 transition-all cursor-pointer space-y-2 group shadow-md"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400">التاج / الشارة النشطة:</span>
                  <span className="text-[10px] text-amber-400/80 group-hover:text-amber-300 font-bold flex items-center gap-0.5">
                    <span>نافذة التجهيز</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-3xl filter drop-shadow-[0_0_6px_rgba(245,158,11,0.4)] group-hover:scale-110 transition-transform">{activeTagEmoji}</span>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setIsTagModalOpen(true); sounds.playClick(); }}
                    className="text-xs text-amber-400 hover:text-amber-300 font-bold text-start cursor-pointer group-hover:underline"
                  >
                    تغيير الشارة ➔
                  </button>
                </div>
              </div>

              {/* Active Title Selector Card */}
              <div 
                onClick={() => { setIsTitleModalOpen(true); sounds.playClick(); }}
                className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-indigo-500/60 hover:bg-slate-900/80 transition-all cursor-pointer space-y-2 group shadow-md"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-400">اللقب النشط:</span>
                  <span className="text-[10px] text-indigo-400/80 group-hover:text-indigo-300 font-bold flex items-center gap-0.5">
                    <span>نافذة التجهيز</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xl group-hover:scale-110 transition-transform">📜</span>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setIsTitleModalOpen(true); sounds.playClick(); }}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-bold text-start cursor-pointer truncate group-hover:underline"
                  >
                    {activeTitleName} ➔
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 1: OVERVIEW & COMPREHENSIVE STATS */}
      {/* ========================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Battle Stats 4-Grid */}
          <div>
            <h3 className="text-sm font-bold text-slate-400 mb-3 flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>إحصائيات المعارك الشاملة</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center shadow-lg">
                <div className="text-2xl sm:text-3xl font-black text-white mb-1">{profile.stats.totalMatches}</div>
                <span className="text-xs text-slate-400 font-bold">{t('totalMatches')}</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center shadow-lg">
                <div className="text-2xl sm:text-3xl font-black text-emerald-400 mb-1">{profile.stats.wins}</div>
                <span className="text-xs text-slate-400 font-bold">{t('wins')}</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center shadow-lg">
                <div className="text-2xl sm:text-3xl font-black text-cyan-400 mb-1">{profile.stats.correctAnswers}</div>
                <span className="text-xs text-slate-400 font-bold">{t('correctAnswers')}</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center shadow-lg">
                <div className="text-2xl sm:text-3xl font-black text-amber-400 mb-1">{profile.stats.streak} 🔥</div>
                <span className="text-xs text-slate-400 font-bold">أطول سلسلة فوز</span>
              </div>
            </div>
          </div>

          {/* Detailed Mode Breakdown Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-3xl bg-slate-900/90 border border-purple-500/30 shadow-xl flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-950/80 border border-purple-500/40 flex items-center justify-center text-2xl flex-shrink-0">
                🕵️‍♂️
              </div>
              <div>
                <div className="text-xs text-purple-300 font-bold">تحدي من أنا؟</div>
                <div className="text-xl font-black text-white mt-0.5">{profile.stats.whoAmIWins || 0} انتصار</div>
                <div className="text-[11px] text-slate-400">حزر الشخصيات الغامضة</div>
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-slate-900/90 border border-cyan-500/30 shadow-xl flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-2xl flex-shrink-0">
                🧠
              </div>
              <div>
                <div className="text-xs text-cyan-300 font-bold">الأسئلة العامة (اختيارات)</div>
                <div className="text-xl font-black text-white mt-0.5">{profile.stats.triviaWins || 0} انتصار</div>
                <div className="text-[11px] text-slate-400">أسئلة الاختيارات المتنوعة</div>
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-slate-900/90 border border-rose-500/30 shadow-xl flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-950/80 border border-rose-500/40 flex items-center justify-center text-2xl flex-shrink-0">
                🔮
              </div>
              <div>
                <div className="text-xs text-rose-300 font-bold">عالم الفوضى الكبرى (Chaos)</div>
                <div className="text-xl font-black text-white mt-0.5">{profile.stats.superChallengeWins || 0} انتصار</div>
                <div className="text-[11px] text-slate-400">التحدي الشامل الفائق</div>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* 3. SHOWCASE & INVENTORY CATEGORIZED SECTIONS              */}
          {/* ========================================================= */}
          <div className="space-y-6 pt-2">
            <div>
              <h3 className="font-black text-lg text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-cyan-400" />
                <span>المقتنيات والهوية المعروضة في الملف الشخصي</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                مقتنياتك مقسمة ومفصولة بدقة حسب الفئة — انقر على أي عنصر أو زر التجهيز لفتح نافذة التغيير والمعاينة الفورية.
              </p>
            </div>

            {/* SECTION 1: صور البروفايل (الأفاتارات) */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-pink-950 border border-pink-500/40 text-pink-400 flex-shrink-0">
                    <Wand2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm sm:text-base text-white flex items-center gap-2">
                      <span>صور البروفايل (الأفاتارات)</span>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-pink-950 text-pink-400 border border-pink-500/30 font-bold">
                        {ownedAvatars.length} صورة مملوكة
                      </span>
                    </h4>
                    <span className="text-[11px] text-slate-400">الأفاتارات المعروضة والمتاحة لتخصيص صورتك الشخصية</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => { setIsAvatarModalOpen(true); sounds.playClick(); }}
                  className="px-4 py-2 rounded-xl bg-pink-950/80 hover:bg-pink-900 border border-pink-500/40 text-pink-300 hover:text-white text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm whitespace-nowrap self-start sm:self-auto"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>تغيير وتجهيز الأفاتار</span>
                  <span>➔</span>
                </button>
              </div>

              {/* Grid of Avatars */}
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                {ownedAvatars.map(av => {
                  const isEquipped = profile.active_avatar_id === av.id || profile.avatar_url === av.asset_url;
                  const isShowcased = (profile.showcase_avatars || []).includes(av.id);

                  return (
                    <div
                      key={av.id}
                      onClick={() => {
                        setIsAvatarModalOpen(true);
                        sounds.playClick();
                      }}
                      className={`p-2.5 rounded-2xl border transition-all flex flex-col items-center gap-2 cursor-pointer group relative ${
                        isEquipped
                          ? 'bg-pink-950/80 border-pink-500 text-pink-200 shadow-[0_0_15px_rgba(219,39,119,0.4)] ring-2 ring-pink-400'
                          : isShowcased
                          ? 'bg-slate-950 border-purple-500/50 text-slate-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                      }`}
                      title={lang === 'ar' ? av.name_ar : av.name_en}
                    >
                      <div className="w-14 h-14 rounded-full overflow-hidden border border-slate-700 aspect-square group-hover:scale-105 transition-transform">
                        <img src={av.asset_url} alt={av.name_ar} className="w-full h-full object-cover rounded-full" />
                      </div>
                      <div className="text-center w-full">
                        <div className="text-[11px] font-bold truncate">{lang === 'ar' ? av.name_ar : av.name_en}</div>
                        {isEquipped ? (
                          <span className="text-[9px] text-pink-400 font-bold block mt-0.5">✓ مجهّز حالياً</span>
                        ) : isShowcased ? (
                          <span className="text-[9px] text-purple-400 font-bold block mt-0.5">⭐ بالمعرض</span>
                        ) : (
                          <span className="text-[9px] text-slate-500 group-hover:text-slate-300 block mt-0.5">تجهيز</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* SECTION 2: إطارات البروفايل المتوهجة */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-cyan-950 border border-cyan-500/40 text-cyan-400 flex-shrink-0">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm sm:text-base text-white flex items-center gap-2">
                      <span>إطارات البروفايل المتوهجة</span>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-500/30 font-bold">
                        {ownedFrames.length} إطار مملوك
                      </span>
                    </h4>
                    <span className="text-[11px] text-slate-400">الإطارات الأسطورية لتزيين الأفاتار الشخصي</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => { setIsFrameModalOpen(true); sounds.playClick(); }}
                  className="px-4 py-2 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 hover:text-white text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm whitespace-nowrap self-start sm:self-auto"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>تغيير وتجهيز الإطار</span>
                  <span>➔</span>
                </button>
              </div>

              {/* Grid of Frames */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {ownedFrames.map(frame => {
                  const isEquipped = profile.active_frame_id === frame.id;
                  const isShowcased = profile.showcase_frames.includes(frame.id);

                  return (
                    <div
                      key={frame.id}
                      onClick={() => {
                        setIsFrameModalOpen(true);
                        sounds.playClick();
                      }}
                      className={`p-3 rounded-2xl border transition-all flex flex-col items-center gap-2.5 cursor-pointer group ${
                        isEquipped
                          ? 'bg-cyan-950/80 border-cyan-400 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.4)] ring-2 ring-cyan-400'
                          : isShowcased
                          ? 'bg-slate-950 border-cyan-500/50 text-slate-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                      }`}
                    >
                      <div className="w-14 h-14 aspect-square flex items-center justify-center group-hover:scale-105 transition-transform">
                        <AvatarWithFrame avatarUrl={profile.avatar_url} frameId={frame.id} size="sm" />
                      </div>
                      <div className="text-center w-full">
                        <div className="text-[11px] font-bold truncate">{lang === 'ar' ? frame.name_ar : frame.name_en}</div>
                        {isEquipped ? (
                          <span className="text-[9px] text-cyan-400 font-bold block mt-0.5">✓ الإطار النشط</span>
                        ) : isShowcased ? (
                          <span className="text-[9px] text-cyan-500 font-bold block mt-0.5">⭐ بالمعرض</span>
                        ) : (
                          <span className="text-[9px] text-slate-500 group-hover:text-slate-300 block mt-0.5">تجهيز</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* SECTION 3: الشعارات والأوسمة (التيجان والشارات) */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-950 border border-amber-500/40 text-amber-400 flex-shrink-0">
                    <Crown className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm sm:text-base text-white flex items-center gap-2">
                      <span>الشعارات والأوسمة (التيجان والشارات)</span>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-950 text-amber-400 border border-amber-500/30 font-bold">
                        {ownedTags.length} شارة وتاج
                      </span>
                    </h4>
                    <span className="text-[11px] text-slate-400">الأوسمة والتيجان التي تبرز جانب اسمك في البروفايل والمتصدرين</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => { setIsTagModalOpen(true); sounds.playClick(); }}
                  className="px-4 py-2 rounded-xl bg-amber-950/80 hover:bg-amber-900 border border-amber-500/40 text-amber-300 hover:text-white text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm whitespace-nowrap self-start sm:self-auto"
                >
                  <Crown className="w-3.5 h-3.5" />
                  <span>تغيير وتجهيز الشارة</span>
                  <span>➔</span>
                </button>
              </div>

              {/* Grid of Tags */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {ownedTags.map(tag => {
                  const isEquipped = profile.active_tag_id === tag.id;
                  const isShowcased = profile.showcase_tags.includes(tag.id);

                  return (
                    <div
                      key={tag.id}
                      onClick={() => {
                        setIsTagModalOpen(true);
                        sounds.playClick();
                      }}
                      className={`p-3 rounded-2xl border transition-all flex flex-col items-center gap-2 cursor-pointer group ${
                        isEquipped
                          ? 'bg-amber-950/80 border-amber-400 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.4)] ring-2 ring-amber-400'
                          : isShowcased
                          ? 'bg-slate-950 border-amber-500/50 text-slate-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                      }`}
                    >
                      <span className="text-3xl filter drop-shadow-[0_0_6px_rgba(245,158,11,0.4)] group-hover:scale-110 transition-transform">
                        {tag.asset_url}
                      </span>
                      <div className="text-center w-full">
                        <div className="text-[11px] font-bold truncate">{lang === 'ar' ? tag.name_ar : tag.name_en}</div>
                        {isEquipped ? (
                          <span className="text-[9px] text-amber-400 font-bold block mt-0.5">✓ الشارة النشطة</span>
                        ) : isShowcased ? (
                          <span className="text-[9px] text-amber-500 font-bold block mt-0.5">⭐ بالمعرض</span>
                        ) : (
                          <span className="text-[9px] text-slate-500 group-hover:text-slate-300 block mt-0.5">تجهيز</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* SECTION 4: الألقاب الفخرية */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-indigo-950 border border-indigo-500/40 text-indigo-400 flex-shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm sm:text-base text-white flex items-center gap-2">
                      <span>الألقاب الفخرية</span>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-950 text-indigo-400 border border-indigo-500/30 font-bold">
                        {ownedTitles.length} لقب مملوك
                      </span>
                    </h4>
                    <span className="text-[11px] text-slate-400">الألقاب المميزة التي تعبر عن هيبتك ومكانتك في عالم يوتوبيا</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => { setIsTitleModalOpen(true); sounds.playClick(); }}
                  className="px-4 py-2 rounded-xl bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-500/40 text-indigo-300 hover:text-white text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm whitespace-nowrap self-start sm:self-auto"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>تغيير وتجهيز اللقب</span>
                  <span>➔</span>
                </button>
              </div>

              {/* Grid of Titles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {ownedTitles.map(title => {
                  const isEquipped = profile.active_title_id === title.id;
                  const isShowcased = profile.showcase_titles.includes(title.id);

                  return (
                    <div
                      key={title.id}
                      onClick={() => {
                        setIsTitleModalOpen(true);
                        sounds.playClick();
                      }}
                      className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                        isEquipped
                          ? 'bg-indigo-950/80 border-indigo-400 text-indigo-200 shadow-[0_0_15px_rgba(99,102,241,0.4)] ring-2 ring-indigo-400'
                          : isShowcased
                          ? 'bg-slate-950 border-indigo-500/40 text-slate-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-xl flex-shrink-0">📜</span>
                        <div className="min-w-0">
                          <div className="text-xs sm:text-sm font-black truncate text-white">{lang === 'ar' ? title.name_ar : title.name_en}</div>
                          <div className="text-[10px] text-slate-400 truncate">{lang === 'ar' ? title.description_ar : title.description_en}</div>
                        </div>
                      </div>

                      <div className="flex-shrink-0 text-end">
                        {isEquipped ? (
                          <span className="text-[10px] text-indigo-400 font-bold bg-indigo-950 px-2 py-0.5 rounded-lg border border-indigo-500/40">✓ النشط</span>
                        ) : isShowcased ? (
                          <span className="text-[10px] text-purple-400 font-bold">⭐ بالمعرض</span>
                        ) : (
                          <span className="text-[10px] text-slate-500">تجهيز</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: AVATARS CUSTOMIZATION & SHOWCASE */}
      {/* ========================================================= */}
      {activeTab === 'avatars' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-lg text-white flex items-center gap-2">
                <Wand2 className="w-5 h-5 text-cyan-400" />
                <span>معرض وتجهيز صور الأفاتار</span>
              </h3>
              <span className="text-xs text-slate-400">انقر على أي أفاتار لتجهيزه فوراً أو إضافته إلى قائمة المفضلة</span>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
              <button
                onClick={() => setAvatarFilter('all')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${avatarFilter === 'all' ? 'bg-pink-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                الكل ({ownedAvatars.length})
              </button>
              <button
                onClick={() => setAvatarFilter('naruto')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${avatarFilter === 'naruto' ? 'bg-orange-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                🍥 ناروتو
              </button>
              <button
                onClick={() => setAvatarFilter('rezero')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${avatarFilter === 'rezero' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                🍎 ريزيرو
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
            {filteredAvatars.map(av => {
              const isEquipped = profile.active_avatar_id === av.id || profile.avatar_url === av.asset_url;
              const isShowcased = (profile.showcase_avatars || []).includes(av.id);

              return (
                <div
                  key={av.id}
                  onClick={() => {
                    equipItem(av.id, 'avatar', av.asset_url);
                    toggleShowcase('avatars', av.id);
                  }}
                  className={`p-4 rounded-3xl border transition-all flex flex-col items-center gap-3 cursor-pointer group ${
                    isEquipped
                      ? 'bg-pink-950/80 border-pink-500 text-pink-200 shadow-[0_0_18px_rgba(219,39,119,0.5)] ring-2 ring-pink-400'
                      : isShowcased
                      ? 'bg-slate-950 border-purple-500/60 text-slate-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                  }`}
                >
                  <div className="w-18 h-18 rounded-full overflow-hidden border-2 border-slate-700 aspect-square group-hover:scale-105 transition-transform">
                    <img src={av.asset_url} alt={av.name_ar} className="w-full h-full object-cover rounded-full" />
                  </div>
                  <div className="text-center w-full">
                    <div className="text-xs font-bold line-clamp-1">{lang === 'ar' ? av.name_ar : av.name_en}</div>
                    {isEquipped ? (
                      <span className="text-[10px] text-pink-400 font-bold block mt-1">✓ مُجهّز حالياً</span>
                    ) : isShowcased ? (
                      <span className="text-[10px] text-purple-400 font-bold block mt-1">⭐ معروض بالبروفايل</span>
                    ) : (
                      <span className="text-[10px] text-slate-500 group-hover:text-slate-300 font-bold block mt-1">انقر للتجهيز</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: FRAMES CUSTOMIZATION & SHOWCASE */}
      {/* ========================================================= */}
      {activeTab === 'frames' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          <div>
            <h3 className="font-bold text-lg text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-cyan-400" />
              <span>معرض وتجهيز إطارات البروفايل</span>
            </h3>
            <span className="text-xs text-slate-400">انقر على أي إطار لتجهيزه فوراً لبروفايلك وعرضه في المعرض</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {ownedFrames.map(frame => {
              const isEquipped = profile.active_frame_id === frame.id;
              const isShowcased = profile.showcase_frames.includes(frame.id);

              return (
                <div
                  key={frame.id}
                  onClick={() => {
                    equipItem(frame.id, 'frame');
                    toggleShowcase('frames', frame.id);
                  }}
                  className={`p-4 rounded-3xl border transition-all flex flex-col items-center gap-3 cursor-pointer group ${
                    isEquipped
                      ? 'bg-cyan-950/80 border-cyan-400 text-cyan-200 shadow-[0_0_20px_rgba(6,182,212,0.5)] ring-2 ring-cyan-400'
                      : isShowcased
                      ? 'bg-slate-950 border-cyan-500/60 text-slate-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                  }`}
                >
                  <div className="w-18 h-18 aspect-square flex items-center justify-center group-hover:scale-105 transition-transform">
                    <AvatarWithFrame 
                      avatarUrl={profile.avatar_url} 
                      frameId={frame.id} 
                      size="lg" 
                    />
                  </div>
                  <div className="text-center w-full">
                    <div className="text-xs font-bold line-clamp-1">{lang === 'ar' ? frame.name_ar : frame.name_en}</div>
                    {isEquipped ? (
                      <span className="text-[10px] text-cyan-400 font-bold block mt-1">✓ مُجهّز حالياً</span>
                    ) : isShowcased ? (
                      <span className="text-[10px] text-cyan-500 font-bold block mt-1">⭐ معروض بالبروفايل</span>
                    ) : (
                      <span className="text-[10px] text-slate-500 group-hover:text-slate-300 font-bold block mt-1">انقر للتجهيز</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: TAGS & BADGES CUSTOMIZATION & SHOWCASE */}
      {/* ========================================================= */}
      {activeTab === 'tags' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          <div>
            <h3 className="font-bold text-lg text-white flex items-center gap-2">
              <Crown className="w-5 h-5 text-amber-400" />
              <span>معرض وتجهيز التيجان والشارات</span>
            </h3>
            <span className="text-xs text-slate-400">انقر على أي تاج أو شارة لتجهيزها بجانب اسمك وعرضها في بروفايلك</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {ownedTags.map(tag => {
              const isEquipped = profile.active_tag_id === tag.id;
              const isShowcased = profile.showcase_tags.includes(tag.id);

              return (
                <div
                  key={tag.id}
                  onClick={() => {
                    equipItem(tag.id, 'tag');
                    toggleShowcase('tags', tag.id);
                  }}
                  className={`p-4 rounded-3xl border transition-all flex flex-col items-center gap-3 cursor-pointer group ${
                    isEquipped
                      ? 'bg-amber-950/80 border-amber-400 text-amber-200 shadow-[0_0_20px_rgba(245,158,11,0.5)] ring-2 ring-amber-400'
                      : isShowcased
                      ? 'bg-slate-950 border-amber-500/60 text-slate-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                  }`}
                >
                  <span className="text-4xl filter drop-shadow-[0_0_8px_rgba(245,158,11,0.5)] group-hover:scale-110 transition-transform">
                    {tag.asset_url}
                  </span>
                  <div className="text-center w-full">
                    <div className="text-xs font-bold line-clamp-1">{lang === 'ar' ? tag.name_ar : tag.name_en}</div>
                    {isEquipped ? (
                      <span className="text-[10px] text-amber-400 font-bold block mt-1">✓ مُجهّز حالياً</span>
                    ) : isShowcased ? (
                      <span className="text-[10px] text-amber-500 font-bold block mt-1">⭐ معروض بالبروفايل</span>
                    ) : (
                      <span className="text-[10px] text-slate-500 group-hover:text-slate-300 font-bold block mt-1">انقر للتجهيز</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 5: TITLES CUSTOMIZATION & SHOWCASE */}
      {/* ========================================================= */}
      {activeTab === 'titles' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          <div>
            <h3 className="font-bold text-lg text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <span>معرض وتجهيز الألقاب الفخرية</span>
            </h3>
            <span className="text-xs text-slate-400">انقر على أي لقب لتجهيزه كلقبك الرئيسي في البروفايل</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {ownedTitles.map(title => {
              const isEquipped = profile.active_title_id === title.id;
              const isShowcased = profile.showcase_titles.includes(title.id);

              return (
                <div
                  key={title.id}
                  onClick={() => {
                    equipItem(title.id, 'title');
                    toggleShowcase('titles', title.id);
                  }}
                  className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                    isEquipped
                      ? 'bg-indigo-950/90 border-indigo-400 text-indigo-200 shadow-[0_0_15px_rgba(99,102,241,0.5)] ring-2 ring-indigo-400'
                      : isShowcased
                      ? 'bg-slate-950 border-purple-500/60 text-slate-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">📜</span>
                    <div>
                      <div className="text-xs sm:text-sm font-black">{lang === 'ar' ? title.name_ar : title.name_en}</div>
                      <div className="text-[11px] text-slate-400">{lang === 'ar' ? title.description_ar : title.description_en}</div>
                    </div>
                  </div>

                  <div className="text-end flex-shrink-0">
                    {isEquipped ? (
                      <span className="text-xs text-indigo-400 font-bold bg-indigo-950 px-2.5 py-1 rounded-xl border border-indigo-500/40">✓ مجهّز</span>
                    ) : isShowcased ? (
                      <span className="text-xs text-purple-400 font-bold">⭐ بالمعرض</span>
                    ) : (
                      <span className="text-xs text-slate-500">تجهيز</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 6: PROMO CODES REDEMPTION */}
      {/* ========================================================= */}
      {activeTab === 'redeem' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl max-w-2xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-3xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto text-3xl shadow-lg">
              🎁
            </div>
            <h3 className="text-xl font-black text-white">استبدال كود الهدية والترويج</h3>
            <p className="text-xs sm:text-sm text-slate-400">
              أدخل الكود السري الذي حصلت عليه من فعاليات يوتوبيا للحصول على كوينز وجوائز أسطورية فوراً!
            </p>
          </div>

          <form onSubmit={handleRedeemCode} className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <input
                type="text"
                value={promoInput}
                onChange={e => setPromoInput(e.target.value)}
                placeholder="أدخل كود الهدية هنا (مثال: UTOPIA2026)"
                className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-400 rounded-2xl px-5 py-3.5 text-sm font-bold text-white placeholder-slate-500 outline-none uppercase tracking-wider"
              />
              <button
                type="submit"
                className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-sm font-black rounded-2xl transition-all shadow-[0_0_20px_rgba(160,185,129,0.4)] whitespace-nowrap cursor-pointer"
              >
                استلام المكافأة
              </button>
            </div>

            {promoFeedback && (
              <div className={`p-4 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 ${
                promoFeedback.success 
                  ? 'bg-emerald-950/80 border border-emerald-500/50 text-emerald-300' 
                  : 'bg-rose-950/80 border border-rose-500/50 text-rose-300'
              }`}>
                <span>{promoFeedback.success ? '🎉' : '⚠️'}</span>
                <span>{promoFeedback.message}</span>
              </div>
            )}
          </form>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. MODALS FOR QUICK EQUIPMENT & CUSTOMIZATION             */}
      {/* ========================================================= */}
      <AvatarModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        profile={profile}
        ownedAvatars={ownedAvatars}
        onEquip={(id, url) => equipItem(id, 'avatar', url)}
        onToggleShowcase={(id) => toggleShowcase('avatars', id)}
      />

      <FrameModal
        isOpen={isFrameModalOpen}
        onClose={() => setIsFrameModalOpen(false)}
        profile={profile}
        ownedFrames={ownedFrames}
        onEquip={(id) => equipItem(id, 'frame')}
        onToggleShowcase={(id) => toggleShowcase('frames', id)}
      />

      <TagModal
        isOpen={isTagModalOpen}
        onClose={() => setIsTagModalOpen(false)}
        profile={profile}
        ownedTags={ownedTags}
        onEquip={(id) => equipItem(id, 'tag')}
        onToggleShowcase={(id) => toggleShowcase('tags', id)}
      />

      <TitleModal
        isOpen={isTitleModalOpen}
        onClose={() => setIsTitleModalOpen(false)}
        profile={profile}
        ownedTitles={ownedTitles}
        onEquip={(id) => equipItem(id, 'title')}
        onToggleShowcase={(id) => toggleShowcase('titles', id)}
      />

    </div>
  );
};
