import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useI18n } from '../../lib/i18n';
import { sounds } from '../../lib/sound';
import { AvatarWithFrame } from '../ui/AvatarWithFrame';
import { LevelBadge } from '../ui/LevelBadge';
import { calculateLevel, getRankTier } from '../../lib/ranks';
import { INITIAL_STORE_ITEMS } from '../store/StoreView';
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
  Edit3
} from 'lucide-react';

export const ProfileView: React.FC = () => {
  const { profile, inventory, updateShowcases } = useAuth();
  const { lang, t } = useI18n();

  const [copiedTag, setCopiedTag] = useState(false);

  if (!profile) return null;

  const { currentLevelXp, nextLevelXp, progress } = calculateLevel(profile.xp);
  const tier = getRankTier(profile.level, profile.role);
  const winRate = profile.stats.totalMatches > 0
    ? Math.round((profile.stats.wins / profile.stats.totalMatches) * 100)
    : 0;

  const handleCopyTag = () => {
    navigator.clipboard.writeText(`${profile.username}#${profile.tag}`);
    setCopiedTag(true);
    sounds.playClick();
    setTimeout(() => setCopiedTag(false), 2000);
  };

  // Get owned titles, tags, frames for showcase customization
  const ownedTitles = INITIAL_STORE_ITEMS.filter(i => i.type === 'title' && inventory.includes(i.id));
  const ownedTags = INITIAL_STORE_ITEMS.filter(i => i.type === 'tag' && inventory.includes(i.id));
  const ownedFrames = INITIAL_STORE_ITEMS.filter(i => i.type === 'frame' && inventory.includes(i.id));

  const toggleShowcase = (type: 'titles' | 'tags' | 'frames', itemId: string) => {
    sounds.playClick();
    let current = type === 'titles' ? [...profile.showcase_titles] : type === 'tags' ? [...profile.showcase_tags] : [...profile.showcase_frames];
    if (current.includes(itemId)) {
      current = current.filter(id => id !== itemId);
    } else {
      if (current.length < 5) {
        current.push(itemId);
      }
    }
    updateShowcases(type, current);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      
      {/* Profile Header Hero Card */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Avatar & Identity */}
          <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-start">
            <AvatarWithFrame frameId={profile.active_frame_id} size="2xl" />
            <div>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-2">
                <h1 className="text-2xl sm:text-3xl font-black text-white">{profile.username}</h1>
                <button
                  onClick={handleCopyTag}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-purple-950/60 border border-purple-500/40 text-purple-300 text-xs font-bold hover:bg-purple-900/60 transition-all"
                  title="نسخ التاغ الكامل"
                >
                  <span>#{profile.tag}</span>
                  {copiedTag ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>

              {/* Title & Tier Badge */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-4">
                <LevelBadge level={profile.level} role={profile.role} showName size="md" />
                <span className="text-xs font-bold text-amber-400 px-3 py-1 rounded-full bg-amber-950/60 border border-amber-500/30">
                  {INITIAL_STORE_ITEMS.find(i => i.id === profile.active_title_id)?.[lang === 'ar' ? 'name_ar' : 'name_en'] || 'متحدي يوتوبيا'}
                </span>
              </div>

              {/* XP Progress Bar */}
              <div className="w-full max-w-md">
                <div className="flex justify-between text-xs text-slate-400 font-bold mb-1.5">
                  <span>مستوى {profile.level}</span>
                  <span>{currentLevelXp} / {nextLevelXp} XP ({progress}%)</span>
                </div>
                <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5">
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-purple-600 via-indigo-500 to-cyan-400 transition-all duration-500 shadow-[0_0_10px_rgba(147,51,234,0.6)]"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Win Rate Card */}
          <div className="bg-slate-950/80 border border-slate-800 p-5 rounded-2xl text-center min-w-[160px]">
            <div className="text-3xl font-black text-emerald-400 mb-1">{winRate}%</div>
            <span className="text-xs font-bold text-slate-400">{t('winRate')}</span>
            <div className="text-[11px] text-purple-400 mt-2 font-semibold">
              {profile.stats.wins} فوز من {profile.stats.totalMatches} معركة
            </div>
          </div>

        </div>
      </div>

      {/* Battle Stats Grid */}
      <div>
        <h3 className="text-sm font-bold text-slate-400 mb-3 flex items-center gap-1.5">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span>{t('statsTitle')}</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center">
            <div className="text-2xl font-black text-white mb-1">{profile.stats.totalMatches}</div>
            <span className="text-xs text-slate-400">{t('totalMatches')}</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center">
            <div className="text-2xl font-black text-emerald-400 mb-1">{profile.stats.wins}</div>
            <span className="text-xs text-slate-400">{t('wins')}</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center">
            <div className="text-2xl font-black text-cyan-400 mb-1">{profile.stats.correctAnswers}</div>
            <span className="text-xs text-slate-400">{t('correctAnswers')}</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center">
            <div className="text-2xl font-black text-amber-400 mb-1">{profile.stats.streak} 🔥</div>
            <span className="text-xs text-slate-400">أطول سلسلة انتصارات</span>
          </div>
        </div>
      </div>

      {/* SHOWCASE SECTION 1: Top 5 Titles */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>{t('showcaseTitles')} (تخصيص حتى 5 ألقاب)</span>
            </h3>
            <span className="text-xs text-slate-400">اختر الألقاب التي تفتخر بها لتعرضها في بروفايلك العام</span>
          </div>
          <span className="text-xs font-black text-purple-400">
            {profile.showcase_titles.length} / 5
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {ownedTitles.map(title => {
            const isShowcased = profile.showcase_titles.includes(title.id);
            return (
              <button
                key={title.id}
                onClick={() => toggleShowcase('titles', title.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                  isShowcased
                    ? 'bg-purple-950 border-purple-400 text-purple-200 shadow-[0_0_10px_rgba(168,85,247,0.4)]'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {isShowcased && <CheckCircle className="w-3.5 h-3.5 text-purple-400" />}
                <span>{lang === 'ar' ? title.name_ar : title.name_en}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SHOWCASE SECTION 2: Top 5 Tags & Badges */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <Crown className="w-4 h-4 text-amber-400" />
              <span>{t('showcaseTags')} (تخصيص حتى 5 شارات وتيجان)</span>
            </h3>
            <span className="text-xs text-slate-400">معرض التيجان والرموز المميزة التي يراها أصدقاؤك</span>
          </div>
          <span className="text-xs font-black text-amber-400">
            {profile.showcase_tags.length} / 5
          </span>
        </div>

        <div className="flex flex-wrap gap-3">
          {ownedTags.map(tag => {
            const isShowcased = profile.showcase_tags.includes(tag.id);
            return (
              <button
                key={tag.id}
                onClick={() => toggleShowcase('tags', tag.id)}
                className={`p-3 rounded-2xl border transition-all flex items-center gap-2 ${
                  isShowcased
                    ? 'bg-amber-950/60 border-amber-400 text-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <span className="text-xl">{tag.asset_url}</span>
                <span className="text-xs font-bold">{lang === 'ar' ? tag.name_ar : tag.name_en}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SHOWCASE SECTION 3: Top 5 Frames */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-cyan-400" />
              <span>{t('showcaseFrames')} (معرض أفضل 5 إطارات نادرة)</span>
            </h3>
            <span className="text-xs text-slate-400">استعرض الإطارات الأسطورية التي تمتلكها</span>
          </div>
          <span className="text-xs font-black text-cyan-400">
            {profile.showcase_frames.length} / 5
          </span>
        </div>

        <div className="flex flex-wrap gap-4">
          {ownedFrames.map(frame => {
            const isShowcased = profile.showcase_frames.includes(frame.id);
            return (
              <button
                key={frame.id}
                onClick={() => toggleShowcase('frames', frame.id)}
                className={`p-3 rounded-2xl border transition-all flex flex-col items-center gap-2 ${
                  isShowcased
                    ? 'bg-cyan-950/60 border-cyan-400 text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <AvatarWithFrame frameId={frame.id} size="md" />
                <span className="text-xs font-bold">{lang === 'ar' ? frame.name_ar : frame.name_en}</span>
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
};
