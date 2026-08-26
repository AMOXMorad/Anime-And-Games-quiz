import React from 'react';
import { Profile } from '../../types';
import { useI18n } from '../../lib/i18n';
import { sounds } from '../../lib/sound';
import { AvatarWithFrame } from '../ui/AvatarWithFrame';
import { LevelBadge } from '../ui/LevelBadge';
import { calculateLevel, getRankTier } from '../../lib/ranks';
import { getActiveStoreItems } from '../store/StoreView';
import { 
  X, 
  Trophy, 
  Flame, 
  Swords, 
  UserPlus, 
  Sparkles, 
  Crown, 
  Shield, 
  Quote, 
  Check, 
  Copy,
  BarChart3,
  Calendar
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface PublicProfileModalProps {
  user: Profile | null;
  isOpen: boolean;
  onClose: () => void;
  onChallenge?: (user: Profile) => void;
  onAddFriend?: (user: Profile) => void;
}

export const PublicProfileModal: React.FC<PublicProfileModalProps> = ({
  user,
  isOpen,
  onClose,
  onChallenge,
  onAddFriend
}) => {
  const { lang, t } = useI18n();
  const [copied, setCopied] = React.useState(false);
  const [friendSent, setFriendSent] = React.useState(false);

  if (!isOpen || !user) return null;

  const activeStoreItems = getActiveStoreItems();
  const { currentLevelXp, nextLevelXp, progress } = calculateLevel(user.xp);
  const tier = getRankTier(user.level, user.role);
  const winRate = user.stats.totalMatches > 0
    ? Math.round((user.stats.wins / user.stats.totalMatches) * 100)
    : 0;

  // Active items meta
  const activeTitleObj = activeStoreItems.find(i => i.id === user.active_title_id);
  const activeTitleName = activeTitleObj ? (lang === 'ar' ? activeTitleObj.name_ar : activeTitleObj.name_en) : (lang === 'ar' ? 'متحدي يوتوبيا' : 'Utopia Challenger');
  
  const activeTagObj = activeStoreItems.find(i => i.id === user.active_tag_id);
  const activeTagEmoji = activeTagObj?.asset_url || '🔰';

  // Showcased items
  const showcasedAvatars = activeStoreItems.filter(i => i.type === 'avatar' && (user.showcase_avatars || []).includes(i.id));
  const showcasedFrames = activeStoreItems.filter(i => i.type === 'frame' && (user.showcase_frames || []).includes(i.id));
  const showcasedTitles = activeStoreItems.filter(i => i.type === 'title' && (user.showcase_titles || []).includes(i.id));
  const showcasedTags = activeStoreItems.filter(i => i.type === 'tag' && (user.showcase_tags || []).includes(i.id));

  const handleCopyTag = () => {
    navigator.clipboard.writeText(`${user.username}#${user.tag}`);
    setCopied(true);
    sounds.playClick();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddFriendClick = () => {
    if (onAddFriend) {
      onAddFriend(user);
    }
    setFriendSent(true);
    sounds.playVictory();
    confetti({ particleCount: 50, spread: 60 });
    setTimeout(() => setFriendSent(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div 
        className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 end-5 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950/40 border border-slate-800 p-6">
          <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-start">
            
            {/* Avatar with Frame */}
            <div className="w-28 h-28 min-w-[112px] min-h-[112px] max-w-[112px] max-h-[112px] aspect-square flex-shrink-0 relative flex items-center justify-center">
              <AvatarWithFrame 
                avatarUrl={user.avatar_url} 
                frameId={user.active_frame_id} 
                size="xl" 
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1.5">
                <span className="text-2xl filter drop-shadow-[0_0_6px_rgba(255,255,255,0.4)]">{activeTagEmoji}</span>
                <h2 className="text-2xl font-black text-white truncate">{user.username}</h2>
                <button
                  onClick={handleCopyTag}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-purple-950/60 border border-purple-500/40 text-purple-300 text-xs font-bold hover:bg-purple-900 transition-all cursor-pointer"
                  title="نسخ التاغ"
                >
                  <span>#{user.tag}</span>
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-3">
                <LevelBadge level={user.level} role={user.role} showName size="sm" />
                <span className="text-[11px] font-bold text-amber-400 px-2.5 py-0.5 rounded-full bg-amber-950/60 border border-amber-500/30">
                  {activeTitleName}
                </span>
                <span className="text-[11px] font-bold text-emerald-400 px-2.5 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/30">
                  {winRate}% فوز
                </span>
              </div>

              {/* Bio / Description */}
              {user.bio ? (
                <div className="relative p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs text-slate-300 italic flex items-start gap-2 mt-2">
                  <Quote className="w-3.5 h-3.5 text-purple-400 flex-shrink-0 mt-0.5" />
                  <p className="line-clamp-3">{user.bio}</p>
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">لا توجد نبذة شخصية مضافة بعد.</p>
              )}
            </div>
          </div>
        </div>

        {/* Battle Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
            <div className="text-xl font-black text-white">{user.stats.totalMatches}</div>
            <span className="text-[10px] text-slate-400 font-bold">إجمالي المباريات</span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
            <div className="text-xl font-black text-emerald-400">{user.stats.wins}</div>
            <span className="text-[10px] text-slate-400 font-bold">مرات الفوز</span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
            <div className="text-xl font-black text-cyan-400">{user.stats.correctAnswers}</div>
            <span className="text-[10px] text-slate-400 font-bold">الإجابات الصحيحة</span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
            <div className="text-xl font-black text-amber-400">{user.stats.streak} 🔥</div>
            <span className="text-[10px] text-slate-400 font-bold">أطول سلسلة فوز</span>
          </div>
        </div>

        {/* Categorized Showcased Items Preview */}
        {(showcasedAvatars.length > 0 || showcasedFrames.length > 0 || showcasedTags.length > 0 || showcasedTitles.length > 0) && (
          <div className="space-y-4 pt-2 border-t border-slate-800">
            <h4 className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>المعروضات الفخرية المميزة للّاعب</span>
            </h4>

            <div className="space-y-3.5">
              {/* Category 1: Avatars */}
              {showcasedAvatars.length > 0 && (
                <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <span className="text-[11px] font-bold text-pink-400 block">🖼️ صور البروفايل المعروضة ({showcasedAvatars.length})</span>
                  <div className="flex flex-wrap gap-2.5">
                    {showcasedAvatars.map(av => (
                      <div key={av.id} className="w-11 h-11 rounded-full overflow-hidden border-2 border-pink-500/50 aspect-square shadow-sm" title={lang === 'ar' ? av.name_ar : av.name_en}>
                        <img src={av.asset_url} alt={av.name_ar} className="w-full h-full object-cover rounded-full" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Category 2: Frames */}
              {showcasedFrames.length > 0 && (
                <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <span className="text-[11px] font-bold text-cyan-400 block">👑 إطارات البروفايل المعروضة ({showcasedFrames.length})</span>
                  <div className="flex flex-wrap gap-2.5">
                    {showcasedFrames.map(frame => (
                      <div key={frame.id} className="w-12 h-12 aspect-square flex items-center justify-center" title={lang === 'ar' ? frame.name_ar : frame.name_en}>
                        <AvatarWithFrame avatarUrl={user.avatar_url} frameId={frame.id} size="sm" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Category 3: Tags & Badges */}
              {showcasedTags.length > 0 && (
                <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <span className="text-[11px] font-bold text-amber-400 block">🏷️ الشعارات والأوسمة المعروضة ({showcasedTags.length})</span>
                  <div className="flex flex-wrap gap-2.5">
                    {showcasedTags.map(tag => (
                      <div key={tag.id} className="px-3 py-1.5 rounded-xl bg-slate-900 border border-amber-500/30 text-xs font-bold text-amber-300 flex items-center gap-1.5" title={lang === 'ar' ? tag.name_ar : tag.name_en}>
                        <span className="text-base">{tag.asset_url}</span>
                        <span>{lang === 'ar' ? tag.name_ar : tag.name_en}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Category 4: Titles */}
              {showcasedTitles.length > 0 && (
                <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <span className="text-[11px] font-bold text-indigo-400 block">📜 الألقاب الفخرية المعروضة ({showcasedTitles.length})</span>
                  <div className="flex flex-wrap gap-2">
                    {showcasedTitles.map(title => (
                      <div key={title.id} className="px-3 py-1.5 rounded-xl bg-slate-900 border border-indigo-500/40 text-xs font-bold text-indigo-200 flex items-center gap-1.5">
                        <span>📜</span>
                        <span>{lang === 'ar' ? title.name_ar : title.name_en}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-4 border-t border-slate-800">
          <button
            onClick={() => {
              if (onChallenge) onChallenge(user);
              onClose();
            }}
            className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-black transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
          >
            <Swords className="w-4 h-4" />
            <span>تحدي 1 ضد 1 الآن</span>
          </button>

          <button
            onClick={handleAddFriendClick}
            disabled={friendSent}
            className={`flex-1 py-3 px-4 rounded-2xl border text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
              friendSent
                ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                : 'bg-purple-950/60 hover:bg-purple-900 border-purple-500/50 text-purple-200'
            }`}
          >
            {friendSent ? <Check className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            <span>{friendSent ? 'تم إرسال الطلب بنجاح' : 'إضافة صديق'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
