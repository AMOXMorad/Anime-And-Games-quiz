import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useI18n } from '../../lib/i18n';
import { sounds } from '../../lib/sound';
import { AvatarWithFrame } from '../ui/AvatarWithFrame';
import { LevelBadge } from '../ui/LevelBadge';
import { RarityBadge } from '../ui/RarityBadge';
import { PublicProfileModal } from '../profile/PublicProfileModal';
import { Profile, WORLD_CATEGORIES } from '../../types';
import { 
  Trophy, 
  Crown, 
  Flame, 
  Sparkles, 
  Coins, 
  Swords, 
  Medal, 
  Search, 
  ShieldCheck, 
  Globe, 
  Gamepad2, 
  Tv, 
  Zap, 
  ChevronUp, 
  ArrowUpRight,
  TrendingUp,
  User
} from 'lucide-react';
import confetti from 'canvas-confetti';

export type LeaderboardCategory = 
  | 'global' 
  | 'chaos' 
  | 'anime' 
  | 'games' 
  | 'naruto' 
  | 'rezero';

export type LeaderboardMetric = 'xp' | 'wins' | 'streak' | 'coins';

interface LeaderboardProps {
  onChallengePlayer?: (worldId: string) => void;
}

export const LeaderboardView: React.FC<LeaderboardProps> = ({ onChallengePlayer }) => {
  const { profile } = useAuth();
  const { lang, t } = useI18n();

  const [activeCategory, setActiveCategory] = useState<LeaderboardCategory>('global');
  const [activeMetric, setActiveMetric] = useState<LeaderboardMetric>('xp');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Load ONLY real registered users from database + current logged in profile
  const allPlayers = useMemo(() => {
    let savedUsers: Profile[] = [];
    try {
      savedUsers = JSON.parse(localStorage.getItem('ag_utopia_registered_users') || '[]');
    } catch (e) {
      savedUsers = [];
    }

    const map = new Map<string, Profile>();
    
    // Add real registered users that are not banned
    savedUsers.forEach(u => {
      if (!u.is_banned) map.set(u.id, u);
    });

    // Add / override with current user's profile
    if (profile && !profile.is_banned) {
      map.set(profile.id, profile);
    }

    return Array.from(map.values());
  }, [profile]);

  // Compute player scores based on selected category & metric
  const scoredPlayers = useMemo(() => {
    return allPlayers.map(p => {
      let score = 0;
      let specialtyScore = 0;

      // Category Weighting:
      if (activeCategory === 'chaos') {
        specialtyScore = (p.stats.superChallengeWins * 800) + (p.stats.streak * 500);
      } else if (activeCategory === 'naruto') {
        specialtyScore = (p.stats.triviaWins * 500);
      } else if (activeCategory === 'rezero') {
        specialtyScore = (p.stats.triviaWins * 500);
      } else if (activeCategory === 'anime') {
        specialtyScore = (p.stats.triviaWins * 300) + (p.stats.whoAmIWins * 300);
      } else if (activeCategory === 'games') {
        specialtyScore = (p.stats.wins * 400);
      }

      if (activeMetric === 'xp') {
        score = p.xp + specialtyScore;
      } else if (activeMetric === 'wins') {
        score = p.stats.wins + (specialtyScore > 0 ? Math.round(specialtyScore / 200) : 0);
      } else if (activeMetric === 'streak') {
        score = p.stats.streak + (specialtyScore > 0 ? Math.round(specialtyScore / 1000) : 0);
      } else if (activeMetric === 'coins') {
        score = p.coins;
      }

      return {
        ...p,
        computedScore: score
      };
    });
  }, [allPlayers, activeCategory, activeMetric]);

  // Sort & rank players
  const rankedPlayers = useMemo(() => {
    const sorted = [...scoredPlayers].sort((a, b) => {
      if (b.computedScore !== a.computedScore) return b.computedScore - a.computedScore;
      return b.xp - a.xp;
    });

    return sorted.map((p, idx) => ({
      ...p,
      rank: idx + 1
    }));
  }, [scoredPlayers]);

  // Filtered by Search Query
  const filteredPlayers = useMemo(() => {
    if (!searchQuery.trim()) return rankedPlayers;
    const q = searchQuery.trim().toLowerCase();
    return rankedPlayers.filter(p => 
      p.username.toLowerCase().includes(q) || 
      p.tag.includes(q)
    );
  }, [rankedPlayers, searchQuery]);

  // Current User's Rank Info
  const userRankInfo = useMemo(() => {
    if (!profile) return null;
    return rankedPlayers.find(p => p.id === profile.id);
  }, [rankedPlayers, profile]);

  // Top 3 Podium Players
  const top3 = rankedPlayers.slice(0, 3);
  const firstPlace = top3[0];
  const secondPlace = top3[1];
  const thirdPlace = top3[2];

  const handleCelebrate = () => {
    sounds.playVictory();
    confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
  };

  const handleOpenProfile = (player: Profile) => {
    sounds.playClick();
    setSelectedProfile(player);
    setIsProfileModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* ============================================================== */}
      {/* 1. HERO BANNER & HALL OF FAME INTRO                            */}
      {/* ============================================================== */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-950/60 via-purple-950/80 to-indigo-950/70 border border-amber-500/40 p-6 sm:p-8 mb-8 backdrop-blur-xl shadow-2xl">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 w-64 h-64 bg-purple-600/25 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-start">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-black text-xs mb-2 shadow-inner">
              <Crown className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
              <span>قاعة أساطير يوتوبيا والتصنيف التنافسي المباشر</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-wide flex items-center justify-center md:justify-start gap-2.5">
              <span>لوحة المتصدرين وقاعة العظماء</span>
              <Trophy className="w-7 h-7 text-amber-400" />
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-2 leading-relaxed">
              تنافس مع أبطال مجتمع يوتوبيا الحقيقيين واعتلِ صدارة الترتيب العالمي في عوالم الأنمي والألعاب وتحديات الفوضى الكبرى. انقر على أي لاعب لفتح بروفايله!
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={handleCelebrate}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs sm:text-sm transition-all duration-300 shadow-[0_0_20px_rgba(245,158,11,0.5)] transform hover:scale-105 flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>احتفال القمة 👑</span>
            </button>
          </div>
        </div>

        {/* Current User Quick Summary Bar */}
        {userRankInfo && (
          <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3">
              <span className="text-slate-400 font-bold">ترتيبك الحالي في الساحة:</span>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-600/30 border border-purple-400/40 text-purple-200 font-black">
                <Medal className="w-4 h-4 text-amber-400" />
                <span>المركز #{userRankInfo.rank}</span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-slate-300 font-bold">
              <span>المستوى: <strong className="text-white">Lv. {userRankInfo.level}</strong></span>
              <span>الانتصارات: <strong className="text-emerald-400">{userRankInfo.stats.wins}</strong></span>
              <span>الستريك: <strong className="text-orange-400">{userRankInfo.stats.streak} 🔥</strong></span>
              <span>الخبرة: <strong className="text-purple-300">{userRankInfo.xp.toLocaleString()} XP</strong></span>
            </div>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* 2. CATEGORY & METRIC FILTER CONTROLS                            */}
      {/* ============================================================== */}
      <div className="space-y-4 mb-8">
        
        {/* World Categories Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {[
            { id: 'global', name_ar: 'الترتيب العالمي العام', icon: '🌐', bg: 'hover:border-purple-500' },
            { id: 'chaos', name_ar: 'تحدي الفوضى الكبرى (Chaos)', icon: '🔮', bg: 'hover:border-rose-500' },
            { id: 'anime', name_ar: 'عالم الأنمي الشامل', icon: '🎌', bg: 'hover:border-indigo-500' },
            { id: 'games', name_ar: 'عالم الألعاب والجيمنج', icon: '🎮', bg: 'hover:border-emerald-500' },
            { id: 'naruto', name_ar: 'ناروتو شيبودن', icon: '🍥', bg: 'hover:border-orange-500' },
            { id: 'rezero', name_ar: 'ريزيرو (Re:Zero)', icon: '🍎', bg: 'hover:border-cyan-500' }
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => {
                sounds.playClick();
                setActiveCategory(cat.id as LeaderboardCategory);
              }}
              className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black whitespace-nowrap transition-all duration-300 flex items-center gap-2 cursor-pointer border ${
                activeCategory === cat.id
                  ? 'bg-purple-600 border-purple-400 text-white shadow-[0_0_15px_rgba(147,51,234,0.5)] scale-105'
                  : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white ' + cat.bg
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.name_ar}</span>
            </button>
          ))}
        </div>

        {/* Metric Switchers & Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-3 sm:p-4 rounded-2xl">
          
          {/* Metrics */}
          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <span className="text-xs text-slate-400 font-bold whitespace-nowrap">الترتيب حسب:</span>
            {[
              { id: 'xp', label: 'النقاط والخبرة XP', icon: <TrendingUp className="w-3.5 h-3.5" /> },
              { id: 'wins', label: 'مرات الفوز (Wins)', icon: <Swords className="w-3.5 h-3.5" /> },
              { id: 'streak', label: 'سلسلة الانتصارات 🔥', icon: <Flame className="w-3.5 h-3.5" /> },
              { id: 'coins', label: 'الثروة والكوينز 🪙', icon: <Coins className="w-3.5 h-3.5" /> }
            ].map(m => (
              <button
                key={m.id}
                onClick={() => {
                  sounds.playClick();
                  setActiveMetric(m.id as LeaderboardMetric);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeMetric === m.id
                    ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                    : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                }`}
              >
                {m.icon}
                <span>{m.label}</span>
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute top-1/2 -translate-y-1/2 start-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="بحث باسم اللاعب أو التاغ..."
              className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-xl ps-9 pe-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none transition-colors"
            />
          </div>

        </div>

      </div>

      {/* ============================================================== */}
      {/* 3. PODIUM (TOP 3 CHAMPIONS)                                    */}
      {/* ============================================================== */}
      {top3.length > 0 && !searchQuery && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 items-end">
          
          {/* #2 SILVER PODIUM */}
          {secondPlace && (
            <div 
              onClick={() => handleOpenProfile(secondPlace)}
              className="order-2 md:order-1 bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-slate-700/80 rounded-3xl p-6 flex flex-col items-center justify-between text-center relative overflow-hidden shadow-xl hover:border-slate-500 transition-all group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 font-black text-sm flex items-center justify-center mb-3 shadow">
                🥈 2
              </div>
              <div className="relative mb-3">
                <AvatarWithFrame
                  avatarUrl={secondPlace.avatar_url}
                  frameId={secondPlace.active_frame_id}
                  size="lg"
                />
              </div>
              <h3 className="font-black text-white text-base group-hover:text-purple-300 transition-colors">
                {secondPlace.username}
              </h3>
              <div className="text-xs text-slate-400 font-bold mb-3 flex items-center gap-1.5">
                <LevelBadge level={secondPlace.level} role={secondPlace.role} size="sm" />
                <span>#{secondPlace.tag}</span>
              </div>
              <div className="w-full bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 flex justify-around text-xs">
                <div>
                  <div className="text-[10px] text-slate-500 font-bold">الانتصارات</div>
                  <div className="text-white font-black">{secondPlace.stats.wins} ⚔️</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 font-bold">الخبرة XP</div>
                  <div className="text-purple-400 font-black">{secondPlace.xp.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 font-bold">ستريك</div>
                  <div className="text-orange-400 font-black">{secondPlace.stats.streak} 🔥</div>
                </div>
              </div>
            </div>
          )}

          {/* #1 GOLD PODIUM (Center, Elevated Champion) */}
          {firstPlace && (
            <div 
              onClick={() => handleOpenProfile(firstPlace)}
              className="order-1 md:order-2 bg-gradient-to-b from-amber-950/70 via-slate-900/95 to-slate-950/95 border-2 border-amber-400 rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-between text-center relative overflow-hidden shadow-[0_0_35px_rgba(245,158,11,0.35)] -translate-y-2 group cursor-pointer"
            >
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500 animate-pulse" />
              
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 font-black text-base flex items-center justify-center mb-3 shadow-[0_0_15px_rgba(245,158,11,0.7)]">
                👑 1
              </div>
              
              <div className="relative mb-3">
                <AvatarWithFrame
                  avatarUrl={firstPlace.avatar_url}
                  frameId={firstPlace.active_frame_id}
                  size="xl"
                />
                <span className="absolute -top-3 inset-x-0 flex justify-center">
                  <Crown className="w-7 h-7 text-amber-400 animate-bounce drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
                </span>
              </div>

              <h2 className="font-black text-white text-lg sm:text-xl group-hover:text-amber-300 transition-colors flex items-center gap-1.5">
                <span>{firstPlace.username}</span>
                <span className="text-amber-400">🔱</span>
              </h2>

              <div className="text-xs text-amber-300/80 font-bold mb-4 flex items-center gap-2">
                <LevelBadge level={firstPlace.level} role={firstPlace.role} size="sm" />
                <span>#{firstPlace.tag}</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px]">
                  بطل الساحة الأكبر
                </span>
              </div>

              <div className="w-full bg-slate-950 p-3 rounded-2xl border border-amber-500/30 flex justify-around text-xs shadow-inner">
                <div>
                  <div className="text-[10px] text-amber-400/80 font-bold">الانتصارات</div>
                  <div className="text-white font-black">{firstPlace.stats.wins} ⚔️</div>
                </div>
                <div>
                  <div className="text-[10px] text-amber-400/80 font-bold">الخبرة XP</div>
                  <div className="text-amber-400 font-black">{firstPlace.xp.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-[10px] text-amber-400/80 font-bold">ستريك فوز</div>
                  <div className="text-orange-400 font-black">{firstPlace.stats.streak} 🔥</div>
                </div>
              </div>
            </div>
          )}

          {/* #3 BRONZE PODIUM */}
          {thirdPlace && (
            <div 
              onClick={() => handleOpenProfile(thirdPlace)}
              className="order-3 bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-amber-800/60 rounded-3xl p-6 flex flex-col items-center justify-between text-center relative overflow-hidden shadow-xl hover:border-amber-600 transition-all group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-amber-900/40 border border-amber-700 text-amber-300 font-black text-sm flex items-center justify-center mb-3 shadow">
                🥉 3
              </div>
              <div className="relative mb-3">
                <AvatarWithFrame
                  avatarUrl={thirdPlace.avatar_url}
                  frameId={thirdPlace.active_frame_id}
                  size="lg"
                />
              </div>
              <h3 className="font-black text-white text-base group-hover:text-purple-300 transition-colors">
                {thirdPlace.username}
              </h3>
              <div className="text-xs text-slate-400 font-bold mb-3 flex items-center gap-1.5">
                <LevelBadge level={thirdPlace.level} role={thirdPlace.role} size="sm" />
                <span>#{thirdPlace.tag}</span>
              </div>
              <div className="w-full bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 flex justify-around text-xs">
                <div>
                  <div className="text-[10px] text-slate-500 font-bold">الانتصارات</div>
                  <div className="text-white font-black">{thirdPlace.stats.wins} ⚔️</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 font-bold">الخبرة XP</div>
                  <div className="text-purple-400 font-black">{thirdPlace.xp.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 font-bold">ستريك</div>
                  <div className="text-orange-400 font-black">{thirdPlace.stats.streak} 🔥</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. FULL RANKINGS TABLE                                         */}
      {/* ============================================================== */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
          <div>
            <h3 className="font-black text-white text-base sm:text-lg flex items-center gap-2">
              <Medal className="w-5 h-5 text-amber-400" />
              <span>جدول الترتيب الكامل ({filteredPlayers.length} متسابق)</span>
            </h3>
            <p className="text-xs text-slate-400">انقر على أي لاعب لعرض ملفه الشخصي ومعروضاته والتحدي المباشر</p>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-purple-950 border border-purple-500/40 text-purple-300">
            مباشر 🔴 Live
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-bold">
                <th className="pb-3 text-start w-16">الترتيب</th>
                <th className="pb-3 text-start">اللاعب والهوية</th>
                <th className="pb-3 text-start">المستوى واللقب</th>
                <th className="pb-3 text-start">الانتصارات (Wins)</th>
                <th className="pb-3 text-start">سلسلة الفوز</th>
                <th className="pb-3 text-start">النقاط (XP)</th>
                <th className="pb-3 text-start">العملات</th>
                <th className="pb-3 text-end">المواجهة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredPlayers.map((player) => {
                const isCurrentUser = profile && player.id === profile.id;
                const rank = player.rank;

                return (
                  <tr 
                    key={player.id} 
                    onClick={() => handleOpenProfile(player)}
                    className={`transition-colors cursor-pointer ${
                      isCurrentUser 
                        ? 'bg-purple-950/40 border-s-4 border-purple-500 shadow-inner' 
                        : 'hover:bg-slate-950/60'
                    }`}
                  >
                    {/* Rank Badge */}
                    <td className="py-3 font-black text-sm">
                      {rank === 1 ? (
                        <span className="w-7 h-7 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 flex items-center justify-center shadow">🥇</span>
                      ) : rank === 2 ? (
                        <span className="w-7 h-7 rounded-xl bg-slate-300 text-slate-950 flex items-center justify-center shadow">🥈</span>
                      ) : rank === 3 ? (
                        <span className="w-7 h-7 rounded-xl bg-amber-700 text-amber-100 flex items-center justify-center shadow">🥉</span>
                      ) : (
                        <span className="text-slate-400 font-mono">#{rank}</span>
                      )}
                    </td>

                    {/* Player Info */}
                    <td className="py-3">
                      <div className="flex items-center gap-2.5">
                        <AvatarWithFrame
                          avatarUrl={player.avatar_url}
                          frameId={player.active_frame_id}
                          size="sm"
                        />
                        <div>
                          <div className="font-bold text-white text-xs flex items-center gap-1.5">
                            <span>{player.username}</span>
                            {isCurrentUser && (
                              <span className="px-1.5 py-0.2 rounded bg-purple-600 text-white font-black text-[9px]">
                                أنت
                              </span>
                            )}
                            {player.role === 'admin' && (
                              <span className="text-[10px] text-amber-400" title="Founder & Master">🔱</span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            #{player.tag}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Level & Title */}
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <LevelBadge level={player.level} role={player.role} size="sm" />
                        <span className="text-purple-300 text-[11px] font-bold">
                          {player.active_title_id ? player.active_title_id.replace('title_', '') : 'متحدي'}
                        </span>
                      </div>
                    </td>

                    {/* Wins & Win Rate */}
                    <td className="py-3 font-bold text-white">
                      <div className="flex items-center gap-1">
                        <Swords className="w-3.5 h-3.5 text-purple-400" />
                        <span>{player.stats.wins}</span>
                        <span className="text-[10px] text-slate-500 font-normal">
                          ({player.stats.totalMatches > 0 ? Math.round((player.stats.wins / player.stats.totalMatches) * 100) : 0}%)
                        </span>
                      </div>
                    </td>

                    {/* Streak */}
                    <td className="py-3 font-bold text-orange-400">
                      <div className="flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5 text-orange-400" />
                        <span>{player.stats.streak}</span>
                      </div>
                    </td>

                    {/* XP */}
                    <td className="py-3 font-black text-purple-300">
                      {player.xp.toLocaleString()}
                    </td>

                    {/* Coins */}
                    <td className="py-3 font-black text-amber-400">
                      <div className="flex items-center gap-1">
                        <Coins className="w-3.5 h-3.5 text-amber-400" />
                        <span>{player.coins.toLocaleString()}</span>
                      </div>
                    </td>

                    {/* Action: Challenge */}
                    <td className="py-3 text-end" onClick={e => e.stopPropagation()}>
                      {!isCurrentUser && (
                        <button
                          onClick={() => {
                            sounds.playClick();
                            if (onChallengePlayer) {
                              onChallengePlayer(activeCategory === 'chaos' ? 'chaos_realm' : activeCategory === 'naruto' ? 'naruto' : activeCategory === 'rezero' ? 'rezero' : 'chaos_realm');
                            }
                          }}
                          className="px-3 py-1 rounded-xl bg-purple-950/80 hover:bg-purple-600 border border-purple-500/40 hover:border-purple-400 text-purple-300 hover:text-white text-xs font-bold transition-all shadow-md flex items-center gap-1 ms-auto cursor-pointer"
                        >
                          <Swords className="w-3 h-3" />
                          <span>تحدّي 1v1</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Public Profile Modal */}
      <PublicProfileModal
        user={selectedProfile}
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onChallenge={() => {
          if (onChallengePlayer) {
            onChallengePlayer(activeCategory === 'chaos' ? 'chaos_realm' : activeCategory === 'naruto' ? 'naruto' : activeCategory === 'rezero' ? 'rezero' : 'chaos_realm');
          }
        }}
      />

    </div>
  );
};
