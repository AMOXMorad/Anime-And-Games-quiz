import React, { useState } from 'react';
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
import { Film, Gamepad2, Globe, Sparkles } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { lang, t } = useI18n();
  const { profile } = useAuth();
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

  const handleOpenWorldModal = (worldId: string) => {
    setActiveWorldId(worldId);
    setWorldModalOpen(true);
  };

  const handleOpenMatchmaking = (worldId: string, diff: Difficulty) => {
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

  const filteredWorlds = activeCategoryFilter === 'all'
    ? allWorlds
    : allWorlds.filter(w => w.category === activeCategoryFilter);

  // If in active gameplay mode
  if (isPlaying && selectedWorld && selectedMode) {
    return (
      <div className="min-h-screen bg-utopia-dark flex flex-col justify-between">
        <Navbar
          currentView={currentView}
          setCurrentView={setCurrentView}
          openAuthModal={() => setAuthModalOpen(true)}
          openNotifications={() => setNotifDrawerOpen(true)}
          openFriendsModal={() => setFriendsModalOpen(true)}
          openSuggestionsModal={() => setSuggestionsModalOpen(true)}
        />

        <main className="flex-1">
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
        </main>

        <VictoryModal
          isOpen={victoryModalOpen}
          won={lastMatchResult?.won || false}
          score={lastMatchResult?.score || 0}
          opponentScore={lastMatchResult?.oppScore}
          xpEarned={lastMatchResult?.xpEarned || 0}
          coinsEarned={lastMatchResult?.coinsEarned || 0}
          onClose={() => setVictoryModalOpen(false)}
          onPlayAgain={() => {
            setVictoryModalOpen(false);
            if (activeWorldId) handleOpenWorldModal(activeWorldId);
          }}
        />

        <Footer
          openReportModal={() => setReportModalOpen(true)}
          openSuggestionsModal={() => setSuggestionsModalOpen(true)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-utopia-dark flex flex-col justify-between">
      
      {/* Navbar */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        openAuthModal={() => setAuthModalOpen(true)}
        openNotifications={() => setNotifDrawerOpen(true)}
        openFriendsModal={() => setFriendsModalOpen(true)}
        openSuggestionsModal={() => setSuggestionsModalOpen(true)}
      />

      {/* Main Views Container */}
      <main className="flex-1">
        
        {/* VIEW 1: Worlds & Chaos Arena Page */}
        {currentView === 'worlds' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 animate-fadeIn">
            
            {/* 1. Chaos Realm Card (Top Center) */}
            <div>
              <ChaosRealmCard onOpenWorldModal={handleOpenWorldModal} />
            </div>

            {/* 2. Category Filter Tabs (All / Anime / Games) */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                  <span>عوالم يوتوبيا التنافسية</span>
                  <Sparkles className="w-4 h-4 text-purple-400" />
                </h2>
                <span className="text-xs text-slate-400">اختر عالمك المفضل وانطلق في التحديات والأسئلة</span>
              </div>

              <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-2xl border border-slate-800">
                <button
                  onClick={() => setActiveCategoryFilter('all')}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    activeCategoryFilter === 'all'
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>{t('allWorlds')}</span>
                </button>

                <button
                  onClick={() => setActiveCategoryFilter('anime')}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    activeCategoryFilter === 'anime'
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Film className="w-3.5 h-3.5" />
                  <span>{t('anime')}</span>
                </button>

                <button
                  onClick={() => setActiveCategoryFilter('games')}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    activeCategoryFilter === 'games'
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Gamepad2 className="w-3.5 h-3.5" />
                  <span>{t('games')}</span>
                </button>
              </div>
            </div>

            {/* 3. Worlds Grid (Naruto, Re:Zero, etc.) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredWorlds.map(world => (
                <WorldCard
                  key={world.id}
                  world={world}
                  onOpen={handleOpenWorldModal}
                />
              ))}
            </div>

          </div>
        )}

        {/* VIEW 2: Store */}
        {currentView === 'store' && <StoreView />}

        {/* VIEW 3: Profile */}
        {currentView === 'profile' && <ProfileView />}

        {/* VIEW 4: Admin Panel */}
        {currentView === 'admin' && <AdminPanel />}

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
        openChatForFriend={(f) => openChat(f)}
      />

      <ChatModal
        isOpen={!!activeChatFriend}
        friend={activeChatFriend}
        onClose={closeChat}
      />

      <SuggestionsModal
        isOpen={suggestionsModalOpen}
        onClose={() => setSuggestionsModalOpen(false)}
      />

      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
      />

      <WorldModal
        world={activeWorldId ? getWorldById(activeWorldId) || null : null}
        isOpen={worldModalOpen}
        onClose={() => setWorldModalOpen(false)}
        openMatchmakingModal={handleOpenMatchmaking}
      />

      <MatchmakingModal
        worldId={activeWorldId || 'chaos_realm'}
        difficulty={matchmakingDiff}
        isOpen={matchmakingModalOpen}
        onClose={() => setMatchmakingModalOpen(false)}
      />

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
