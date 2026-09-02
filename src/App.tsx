import React, { useState, useEffect } from 'react';
import { I18nProvider, useI18n } from './lib/i18n';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocialProvider, useSocial } from './context/SocialContext';
import { GameProvider, useGame } from './context/GameContext';
import { getAllWorlds, getWorldById } from './data/worlds';
import { Difficulty, GameModeType, World } from './types';
import { sounds } from './lib/sound';

// Layout
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { NotificationDrawer } from './components/layout/NotificationDrawer';

// Modals
import { AuthModal } from './components/auth/AuthModal';
import { WorldModal } from './components/worlds/WorldModal';
import { MatchmakingModal } from './components/game/MatchmakingModal';
import { VictoryModal } from './components/game/VictoryModal';
import { FriendsModal } from './components/social/FriendsModal';
import { ChatModal } from './components/social/ChatModal';
import { SuggestionsModal } from './components/community/SuggestionsModal';
import { ReportModal } from './components/community/ReportModal';

// Worlds & Views
import { ChaosRealmCard } from './components/worlds/ChaosRealmCard';
import { WorldCard } from './components/worlds/WorldCard';
import { StoreView } from './components/store/StoreView';
import { LeaderboardView } from './components/leaderboard/LeaderboardView';
import { ProfileView } from './components/profile/ProfileView';
import { SuggestionsView } from './components/community/SuggestionsView';
import { AdminPanel } from './components/admin/AdminPanel';

// Game Modes
import { TriviaMode } from './components/game/TriviaMode';
import { TrueFalseMode } from './components/game/TrueFalseMode';
import { WhoAmIMode } from './components/game/WhoAmIMode';
import { SuperChallengeArena } from './components/game/SuperChallengeArena';
import { Film, Gamepad2, Globe, Sparkles, LogIn, Shield } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { lang, t } = useI18n();
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const { profile, isLoading } = useAuth();
  const { activeChatFriend, closeChat, openChat } = useSocial();
  const { 
    selectedWorld, 
    selectWorld,
    selectedMode, 
    selectedDifficulty, 
    isPlaying, 
    opponentProfile, 
    finishMatch, 
    exitGame 
  } = useGame();

  const [currentView, setCurrentView] = useState<string>('worlds'); // worlds | store | profile | admin
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<'all' | 'anime' | 'games' | 'superheroes'>('all');
  const [worldsList, setWorldsList] = useState<World[]>(() => getAllWorlds());

  useEffect(() => {
    const handleWorldsUpdate = () => {
      setWorldsList(getAllWorlds());
    };
    window.addEventListener('ag_utopia_worlds_updated', handleWorldsUpdate);
    return () => window.removeEventListener('ag_utopia_worlds_updated', handleWorldsUpdate);
  }, []);

  // Modals state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [notifDrawerOpen, setNotifDrawerOpen] = useState(false);
  const [friendsModalOpen, setFriendsModalOpen] = useState(false);
  const [suggestionsModalOpen, setSuggestionsModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  
  const [activeWorldId, setActiveWorldId] = useState<string | null>(null);
  const [worldModalOpen, setWorldModalOpen] = useState(false);
  const [matchmakingModalOpen, setMatchmakingModalOpen] = useState(false);
  const [matchmakingDiff, setMatchmakingDiff] = useState<Difficulty>('medium');
  const [matchmakingMode, setMatchmakingMode] = useState<GameModeType>('super_challenge');

  // Victory modal state
  const [victoryModalOpen, setVictoryModalOpen] = useState(false);
  const [lastMatchResult, setLastMatchResult] = useState<{
    won: boolean;
    score: number;
    oppScore?: number;
    xpEarned: number;
    coinsEarned: number;
  } | null>(null);

  // Prompt login modal on first entry if no active session
  useEffect(() => {
    if (!isLoading && !profile) {
      setAuthModalOpen(true);
    }
  }, [isLoading, profile]);

  const handleOpenWorldModal = (worldId: string) => {
    selectWorld(worldId);
    if (!profile) {
      setAuthModalOpen(true);
      return;
    }
    setActiveWorldId(worldId);
    setWorldModalOpen(true);
  };

  const handleOpenMatchmaking = (worldId: string, diff: Difficulty, mode: GameModeType = 'super_challenge') => {
    if (!profile) {
      setAuthModalOpen(true);
      return;
    }
    setActiveWorldId(worldId);
    setMatchmakingDiff(diff);
    setMatchmakingMode(mode);
    setMatchmakingModalOpen(true);
  };

  const handleSoloGameFinish = (score: number, customRewards?: { xpEarned: number; coinsEarned: number }, isWon?: boolean) => {
    const finalWon = isWon !== undefined ? isWon : score > 0;
    const res = finishMatch(score, 0, customRewards, finalWon);
    setLastMatchResult({
      won: res.won,
      score,
      xpEarned: res.xpEarned,
      coinsEarned: res.coinsEarned
    });
    setVictoryModalOpen(true);
  };

  const handleWhoAmIFinish = (score: number, customRewards?: { xpEarned: number; coinsEarned: number }, isWon?: boolean) => {
    const finalWon = isWon !== undefined ? isWon : score > 0;
    finishMatch(score, 0, customRewards, finalWon);
    exitGame();
  };

  const handleSuperGameFinish = (playerScore: number, oppScore: number, customRewards?: { xpEarned: number; coinsEarned: number }) => {
    const res = finishMatch(playerScore, oppScore, customRewards);
    setLastMatchResult({
      won: res.won,
      score: playerScore,
      oppScore,
      xpEarned: res.xpEarned,
      coinsEarned: res.coinsEarned
    });
    setVictoryModalOpen(true);
  };

  const filteredWorlds = worldsList.filter(w => {
    if (activeCategoryFilter === 'all') return true;
    return w.category === activeCategoryFilter;
  });

  const activeWorld = activeWorldId ? getWorldById(activeWorldId) : null;

  return (
    <div className="min-h-screen flex flex-col font-arabic selection:bg-cyan-500 selection:text-white transition-colors duration-300">
      
      {/* Top Navigation */}
      <Navbar
        currentView={currentView}
        setCurrentView={(view) => {
          if (isPlaying) exitGame();
          setCurrentView(view);
        }}
        openAuthModal={() => setAuthModalOpen(true)}
        openNotifications={() => setNotifDrawerOpen(true)}
        openFriendsModal={() => setFriendsModalOpen(true)}
        openSuggestionsModal={() => setCurrentView('suggestions')}
      />

      {/* Main Container */}
      <main className="flex-1">
        
        {/* IF PLAYING A GAME MODE */}
        {isPlaying && selectedWorld ? (
          <div className="py-6">
            {selectedMode === 'trivia' && (
              <TriviaMode
                world={selectedWorld}
                difficulty={selectedDifficulty}
                onFinish={handleSoloGameFinish}
              />
            )}

            {selectedMode === 'true_false' && (
              <TrueFalseMode
                world={selectedWorld}
                difficulty={selectedDifficulty}
                onFinish={handleSoloGameFinish}
              />
            )}

            {selectedMode === 'who_am_i' && (
              <WhoAmIMode
                world={selectedWorld}
                difficulty={selectedDifficulty}
                onFinish={handleWhoAmIFinish}
              />
            )}

            {selectedMode === 'super_challenge' && (
              <SuperChallengeArena
                world={selectedWorld}
                difficulty={selectedDifficulty}
                opponent={opponentProfile || {
                  id: 'rival_player',
                  username: 'المنافس الأسطوري',
                  tag: '7777',
                  is_guest: false,
                  role: 'user',
                  is_banned: false,
                  coins: 1000,
                  xp: 2000,
                  level: 10,
                  active_frame_id: 'frame_sharingan',
                  active_tag_id: 'tag_rookie',
                  active_title_id: 'title_novice',
                  showcase_titles: ['title_novice'],
                  showcase_tags: ['tag_rookie'],
                  showcase_frames: ['frame_sharingan'],
                  stats: { totalMatches: 10, wins: 5, correctAnswers: 50, streak: 2, whoAmIWins: 2, triviaWins: 2, superChallengeWins: 1 },
                  created_at: new Date().toISOString()
                }}
                onComplete={handleSuperGameFinish}
              />
            )}
          </div>
        ) : (
          /* STANDARD APPLICATION VIEWS */
          <>
            {/* STORE VIEW */}
            {currentView === 'store' && <StoreView />}

            {/* LEADERBOARD VIEW */}
            {currentView === 'leaderboard' && (
              <LeaderboardView 
                onChallengePlayer={(wId) => handleOpenMatchmaking(wId, 'medium')} 
              />
            )}

            {/* PROFILE VIEW */}
            {currentView === 'profile' && <ProfileView />}

            {/* SUGGESTIONS VIEW */}
            {currentView === 'suggestions' && <SuggestionsView />}

            {/* ADMIN PANEL */}
            {currentView === 'admin' && profile?.role === 'admin' && <AdminPanel />}

            {/* WORLDS EXPLORER VIEW (DEFAULT HOME) */}
            {currentView === 'worlds' && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
                
                {/* Guest / Non-logged in Callout Banner */}
                {!profile && (
                  <div className="mb-8 p-4 sm:p-6 rounded-3xl bg-gradient-to-r from-purple-950/80 via-slate-900 to-indigo-950/80 border border-purple-500/40 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-start animate-pulse">
                    <div>
                      <h3 className="text-base sm:text-lg font-black text-white flex items-center justify-center sm:justify-start gap-2">
                        <Sparkles className="w-5 h-5 text-amber-400" />
                        <span>مرحباً بك في يوتوبيا (AG Utopia)!</span>
                      </h3>
                      <p className="text-xs text-slate-300 mt-1">
                        سجل دخولك كـ AMOX أو أنشئ حسابك لحفظ إنجازاتك وكوينزاتك وتحدي أصدقائك في العوالم
                      </p>
                    </div>

                    <button
                      onClick={() => setAuthModalOpen(true)}
                      className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs rounded-xl shadow-lg transition-all flex items-center gap-2 flex-shrink-0"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>تسجيل الدخول / انضم للعب</span>
                    </button>
                  </div>
                )}

                {/* Hero Section */}
                <div className="text-center mb-10">
                  <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full font-bold text-xs mb-3 transition-all ${
                    isLight 
                      ? 'bg-cyan-100/90 border border-cyan-300 text-cyan-800 shadow-sm'
                      : 'bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                  }`}>
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>{t('chooseWorld')}</span>
                  </div>
                  <h1 className={`text-3xl sm:text-5xl font-black tracking-tight mb-3 ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}>
                    عوالم الأنمي والألعاب الكبرى
                  </h1>
                  <p className={`text-xs sm:text-sm max-w-xl mx-auto ${
                    isLight ? 'text-slate-600 font-medium' : 'text-slate-400'
                  }`}>
                    اختر عالمك المفضل وانطلق في تحديات التريفيا، الصح والخطأ، ولعبة من أنا التنافسية
                  </p>
                </div>

                {/* Chaos Realm Crown Jewel */}
                <div className="mb-10">
                  <ChaosRealmCard
                    onOpenWorldModal={handleOpenWorldModal}
                  />
                </div>

                {/* Category Filters Bar */}
                <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 border-b pb-4 mb-8 ${
                  isLight ? 'border-slate-200' : 'border-slate-800'
                }`}>
                  <h2 className={`text-lg font-black flex items-center gap-2 ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}>
                    <Globe className="w-5 h-5 text-cyan-500" />
                    <span>العوالم المتاحة</span>
                  </h2>

                  <div className={`flex items-center gap-1.5 p-1 rounded-2xl border ${
                    isLight ? 'bg-slate-100 border-slate-200 shadow-inner' : 'bg-slate-900/80 border-slate-800'
                  }`}>
                    <button
                      type="button"
                      onClick={() => { setActiveCategoryFilter('all'); sounds.playClick(); }}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        activeCategoryFilter === 'all'
                          ? 'bg-gradient-to-r from-cyan-600 to-sky-500 text-white shadow-md'
                          : isLight 
                          ? 'text-slate-600 hover:text-slate-900 hover:bg-white/80' 
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {t('allWorlds')}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setActiveCategoryFilter('anime'); sounds.playClick(); }}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        activeCategoryFilter === 'anime'
                          ? 'bg-gradient-to-r from-cyan-600 to-sky-500 text-white shadow-md'
                          : isLight 
                          ? 'text-slate-600 hover:text-slate-900 hover:bg-white/80' 
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Film className="w-3.5 h-3.5" />
                      <span>{t('animeOnly')}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => { setActiveCategoryFilter('games'); sounds.playClick(); }}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        activeCategoryFilter === 'games'
                          ? 'bg-gradient-to-r from-cyan-600 to-sky-500 text-white shadow-md'
                          : isLight 
                          ? 'text-slate-600 hover:text-slate-900 hover:bg-white/80' 
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Gamepad2 className="w-3.5 h-3.5" />
                      <span>{t('gamesOnly')}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => { setActiveCategoryFilter('superheroes'); sounds.playClick(); }}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        activeCategoryFilter === 'superheroes'
                          ? 'bg-gradient-to-r from-cyan-600 to-sky-500 text-white shadow-md'
                          : isLight 
                          ? 'text-slate-600 hover:text-slate-900 hover:bg-white/80' 
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Shield className="w-3.5 h-3.5" />
                      <span>{t('superheroesOnly')}</span>
                    </button>
                  </div>
                </div>

                {/* Standard Worlds Grid */}
                {filteredWorlds.filter(w => w.id !== 'chaos_realm').length === 0 ? (
                  <div className={`p-12 text-center rounded-3xl border ${
                    isLight ? 'bg-white border-slate-200 text-slate-700' : 'bg-black/60 border-slate-800 text-slate-300'
                  }`}>
                    <Shield className="w-12 h-12 text-cyan-400 mx-auto mb-3 animate-pulse" />
                    <h3 className="text-lg font-black mb-1">عوالم {activeCategoryFilter === 'superheroes' ? 'الأبطال الخارقين (مارفل ودي سي)' : 'هذا التصنيف'} قيد التجهيز</h3>
                    <p className="text-xs text-slate-400 max-w-md mx-auto mb-4">
                      يمكن للمسؤول (الأدمن) إضافة عوالم جديدة وشخصيات وأسئلة عبر نظام رفع الإكسيل من لوحة التحكم لتظهر فوراً هنا وفي عالم الفوضى.
                    </p>
                    {profile?.role === 'admin' && (
                      <button
                        onClick={() => { setCurrentView('admin'); sounds.playClick(); }}
                        className="px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-sky-500 text-white text-xs font-bold rounded-xl shadow-md"
                      >
                        + إنشاء وإضافة عالم جديد الآن
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredWorlds
                      .filter(w => w.id !== 'chaos_realm')
                      .map(world => (
                        <WorldCard
                          key={world.id}
                          world={world}
                          onOpen={handleOpenWorldModal}
                        />
                      ))}
                  </div>
                )}

              </div>
            )}
          </>
        )}

      </main>

      {/* Modals & Drawers */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />

      <NotificationDrawer
        isOpen={notifDrawerOpen}
        onClose={() => setNotifDrawerOpen(false)}
      />

      <FriendsModal
        isOpen={friendsModalOpen}
        onClose={() => setFriendsModalOpen(false)}
        openChatForFriend={openChat}
      />

      {activeChatFriend && (
        <ChatModal
          isOpen={Boolean(activeChatFriend)}
          friend={activeChatFriend}
          onClose={closeChat}
        />
      )}

      <SuggestionsModal
        isOpen={suggestionsModalOpen}
        onClose={() => setSuggestionsModalOpen(false)}
      />

      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
      />

      {activeWorld && (
        <WorldModal
          isOpen={worldModalOpen}
          world={activeWorld}
          onClose={() => setWorldModalOpen(false)}
          openMatchmakingModal={handleOpenMatchmaking}
        />
      )}

      {activeWorld && (
        <MatchmakingModal
          isOpen={matchmakingModalOpen}
          worldId={activeWorld.id}
          difficulty={matchmakingDiff}
          mode={matchmakingMode}
          onClose={() => setMatchmakingModalOpen(false)}
        />
      )}

      {lastMatchResult && (
        <VictoryModal
          isOpen={victoryModalOpen}
          won={lastMatchResult.won}
          score={lastMatchResult.score}
          opponentScore={lastMatchResult.oppScore}
          xpEarned={lastMatchResult.xpEarned}
          coinsEarned={lastMatchResult.coinsEarned}
          onClose={() => {
            setVictoryModalOpen(false);
            exitGame();
          }}
          onPlayAgain={() => {
            setVictoryModalOpen(false);
            exitGame();
          }}
        />
      )}

      {/* Footer */}
      <Footer
        openReportModal={() => setReportModalOpen(true)}
        openSuggestionsModal={() => setCurrentView('suggestions')}
      />

    </div>
  );
};

export const App: React.FC = () => {
  return (
    <I18nProvider>
      <ThemeProvider>
        <AuthProvider>
          <SocialProvider>
            <GameProvider>
              <MainAppContent />
            </GameProvider>
          </SocialProvider>
        </AuthProvider>
      </ThemeProvider>
    </I18nProvider>
  );
};

export default App;
