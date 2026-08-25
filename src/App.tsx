import React, { useState, useEffect } from 'react';
import { I18nProvider, useI18n } from './lib/i18n';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocialProvider, useSocial } from './context/SocialContext';
import { GameProvider, useGame } from './context/GameContext';
import { allWorlds, getWorldById } from './data/worlds';
import { Difficulty } from './types';

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
import { ProfileView } from './components/profile/ProfileView';
import { AdminPanel } from './components/admin/AdminPanel';

// Game Modes
import { TriviaMode } from './components/game/TriviaMode';
import { TrueFalseMode } from './components/game/TrueFalseMode';
import { WhoAmIMode } from './components/game/WhoAmIMode';
import { SuperChallengeArena } from './components/game/SuperChallengeArena';
import { Film, Gamepad2, Globe, Sparkles, LogIn } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { lang, t } = useI18n();
  const { profile, isLoading } = useAuth();
  const { activeChatFriend, closeChat, openChat } = useSocial();
  const { 
    selectedWorld, 
    selectedMode, 
    selectedDifficulty, 
    isPlaying, 
    opponentProfile, 
    finishMatch, 
    exitGame 
  } = useGame();

  const [currentView, setCurrentView] = useState<string>('worlds'); // worlds | store | profile | admin
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<'all' | 'anime' | 'games'>('all');

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
    if (!profile) {
      setAuthModalOpen(true);
      return;
    }
    setActiveWorldId(worldId);
    setWorldModalOpen(true);
  };

  const handleOpenMatchmaking = (worldId: string, diff: Difficulty) => {
    if (!profile) {
      setAuthModalOpen(true);
      return;
    }
    setActiveWorldId(worldId);
    setMatchmakingDiff(diff);
    setMatchmakingModalOpen(true);
  };

  const handleSoloGameFinish = (score: number) => {
    const res = finishMatch(score, 0);
    setLastMatchResult({
      won: true,
      score,
      xpEarned: res.xpEarned,
      coinsEarned: res.coinsEarned
    });
    setVictoryModalOpen(true);
  };

  const handleSuperGameFinish = (playerScore: number, oppScore: number) => {
    const res = finishMatch(playerScore, oppScore);
    setLastMatchResult({
      won: res.won,
      score: playerScore,
      oppScore,
      xpEarned: res.xpEarned,
      coinsEarned: res.coinsEarned
    });
    setVictoryModalOpen(true);
  };

  const filteredWorlds = allWorlds.filter(w => {
    if (activeCategoryFilter === 'all') return true;
    return w.category === activeCategoryFilter;
  });

  const activeWorld = activeWorldId ? getWorldById(activeWorldId) : null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-purple-500 selection:text-white">
      
      {/* Top Navigation */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        openAuthModal={() => setAuthModalOpen(true)}
        openNotifications={() => setNotifDrawerOpen(true)}
        openFriendsModal={() => setFriendsModalOpen(true)}
        openSuggestionsModal={() => setSuggestionsModalOpen(true)}
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
                onFinish={handleSoloGameFinish}
              />
            )}

            {selectedMode === 'super_challenge' && opponentProfile && (
              <SuperChallengeArena
                world={selectedWorld}
                difficulty={selectedDifficulty}
                opponent={opponentProfile}
                onComplete={handleSuperGameFinish}
              />
            )}
          </div>
        ) : (
          /* STANDARD APPLICATION VIEWS */
          <>
            {/* STORE VIEW */}
            {currentView === 'store' && <StoreView />}

            {/* PROFILE VIEW */}
            {currentView === 'profile' && <ProfileView />}

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
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-950/60 border border-purple-500/30 text-purple-300 font-bold text-xs mb-3 shadow-[0_0_15px_rgba(147,51,234,0.3)]">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>{t('chooseWorld')}</span>
                  </div>
                  <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-3">
                    عوالم الأنمي والألعاب الكبرى
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
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
                <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-8">
                  <h2 className="text-lg font-black text-white flex items-center gap-2">
                    <Globe className="w-5 h-5 text-purple-400" />
                    <span>العوالم المتاحة</span>
                  </h2>

                  <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
                    <button
                      onClick={() => setActiveCategoryFilter('all')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        activeCategoryFilter === 'all'
                          ? 'bg-purple-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {t('allWorlds')}
                    </button>
                    <button
                      onClick={() => setActiveCategoryFilter('anime')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                        activeCategoryFilter === 'anime'
                          ? 'bg-purple-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Film className="w-3.5 h-3.5" />
                      <span>{t('animeOnly')}</span>
                    </button>
                    <button
                      onClick={() => setActiveCategoryFilter('games')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                        activeCategoryFilter === 'games'
                          ? 'bg-purple-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Gamepad2 className="w-3.5 h-3.5" />
                      <span>{t('gamesOnly')}</span>
                    </button>
                  </div>
                </div>

                {/* Standard Worlds Grid */}
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
        openSuggestionsModal={() => setSuggestionsModalOpen(true)}
      />

    </div>
  );
};

export const App: React.FC = () => {
  return (
    <I18nProvider>
      <AuthProvider>
        <SocialProvider>
          <GameProvider>
            <MainAppContent />
          </GameProvider>
        </SocialProvider>
      </AuthProvider>
    </I18nProvider>
  );
};

export default App;
