import React, { createContext, useContext, useState, useEffect } from 'react';
import { World, GameModeType, Difficulty, Character, TriviaQuestion, TrueFalseQuestion, Profile } from '../types';
import { allWorlds, getWorldById, getChaosCharacters, getChaosTriviaQuestions, getChaosTrueFalseQuestions, ChaosFilter } from '../data/worlds';
import { useAuth } from './AuthContext';
import { sounds } from '../lib/sound';
import { generateRoomCode } from '../lib/supabase';

interface SuperRoundResult {
  round: number;
  playerScore: number;
  opponentScore: number;
  roundType: 'true_false' | 'trivia' | 'who_am_i';
}

interface MatchRecord {
  matchId: string;
  roomCode: string;
  worldId: string;
  mode: string;
  winner: 'player' | 'opponent';
  playerFinalScore: number;
  opponentFinalScore: number;
  timestamp: string;
}

export type MatchType = 'solo' | 'random' | 'private';

interface GameContextType {
  selectedWorld: World | null;
  selectedMode: GameModeType | null;
  selectedDifficulty: Difficulty;
  chaosFilter: ChaosFilter;
  matchType: MatchType;
  isPlaying: boolean;
  isSuperMatchmaking: boolean;
  superRoomCode: string | null;
  isHost: boolean;
  opponentProfile: Profile | null;
  superRoundsResults: SuperRoundResult[];
  activeSuperRound: number;
  playerScore: number;
  opponentScore: number;
  savedActiveRoomCode: string | null;
  
  // Setup & Navigation
  selectWorld: (worldId: string) => void;
  setMode: (mode: GameModeType) => void;
  setDifficulty: (diff: Difficulty) => void;
  setChaosCategoryFilter: (filter: ChaosFilter) => void;
  startSoloGame: (world: World, mode: GameModeType, diff: Difficulty) => void;
  startMatchmaking: (worldId: string, mode: GameModeType, diff: Difficulty) => void;
  startSuperMatchmaking: (worldId: string, diff: Difficulty) => void;
  createPrivateRoom: (worldId: string, diff: Difficulty, mode?: GameModeType) => string;
  joinPrivateRoom: (code: string) => { success: boolean; message: string };
  reconnectToActiveRoom: () => boolean;
  cancelMatchmaking: () => void;
  finishMatch: (playerFinalScore: number, opponentFinalScore: number, customRewards?: { xpEarned?: number; coinsEarned?: number }) => { won: boolean; xpEarned: number; coinsEarned: number; matchRecordId: string };
  exitGame: () => void;
}

const GameContext = createContext<GameContextType | null>(null);

const DEMO_OPPONENTS: Profile[] = [
  {
    id: 'opp_sasuke',
    username: 'Shadow_Sasuke',
    tag: '3941',
    is_guest: false,
    role: 'user',
    is_banned: false,
    coins: 1400,
    xp: 2800,
    level: 15,
    active_frame_id: 'frame_sharingan',
    active_tag_id: 'tag_lightning_godspeed',
    active_title_id: 'title_king_shinobi',
    showcase_titles: ['title_king_shinobi'],
    showcase_tags: ['tag_lightning_godspeed'],
    showcase_frames: ['frame_sharingan'],
    stats: { totalMatches: 35, wins: 28, correctAnswers: 240, streak: 6, whoAmIWins: 10, triviaWins: 12, superChallengeWins: 6 },
    created_at: new Date().toISOString()
  },
  {
    id: 'opp_subaru',
    username: 'Natsuki_Knight',
    tag: '8812',
    is_guest: false,
    role: 'user',
    is_banned: false,
    coins: 1100,
    xp: 1900,
    level: 11,
    active_frame_id: 'frame_curse_flame',
    active_tag_id: 'tag_rezero_apple',
    active_title_id: 'title_death_return',
    showcase_titles: ['title_death_return'],
    showcase_tags: ['tag_rezero_apple'],
    showcase_frames: ['frame_curse_flame'],
    stats: { totalMatches: 24, wins: 18, correctAnswers: 160, streak: 4, whoAmIWins: 6, triviaWins: 8, superChallengeWins: 4 },
    created_at: new Date().toISOString()
  }
];

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { addXp, updateCoins, updateStats } = useAuth();

  const [selectedWorld, setSelectedWorld] = useState<World | null>(null);
  const [selectedMode, setSelectedMode] = useState<GameModeType | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('medium');
  const [chaosFilter, setChaosFilter] = useState<ChaosFilter>('all');
  const [matchType, setMatchType] = useState<MatchType>('solo');
  
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isSuperMatchmaking, setIsSuperMatchmaking] = useState<boolean>(false);
  const [superRoomCode, setSuperRoomCode] = useState<string | null>(null);
  const [savedActiveRoomCode, setSavedActiveRoomCode] = useState<string | null>(null);
  const [isHost, setIsHost] = useState<boolean>(true);
  const [opponentProfile, setOpponentProfile] = useState<Profile | null>(null);

  const [activeSuperRound, setActiveSuperRound] = useState<number>(1);
  const [playerScore, setPlayerScore] = useState<number>(0);
  const [opponentScore, setOpponentScore] = useState<number>(0);
  const [superRoundsResults, setSuperRoundsResults] = useState<SuperRoundResult[]>([]);

  // Check on load if an active room exists in localStorage for reconnection
  useEffect(() => {
    const savedRoom = localStorage.getItem('ag_utopia_active_room_code');
    if (savedRoom) {
      setSavedActiveRoomCode(savedRoom);
    }
  }, []);

  const selectWorld = (worldId: string) => {
    const w = getWorldById(worldId, chaosFilter);
    if (w) setSelectedWorld(w);
    sounds.playClick();
  };

  const setMode = (mode: GameModeType) => {
    setSelectedMode(mode);
    sounds.playClick();
  };

  const setDifficulty = (diff: Difficulty) => {
    setSelectedDifficulty(diff);
    sounds.playClick();
  };

  const setChaosCategoryFilter = (filter: ChaosFilter) => {
    setChaosFilter(filter);
    if (selectedWorld?.id === 'chaos_realm') {
      const updated = getWorldById('chaos_realm', filter);
      if (updated) setSelectedWorld(updated);
    }
    sounds.playClick();
  };

  const startSoloGame = (world: World, mode: GameModeType, diff: Difficulty) => {
    setSelectedWorld(world);
    setSelectedMode(mode);
    setSelectedDifficulty(diff);
    setMatchType('solo');
    setIsPlaying(true);
    setPlayerScore(0);
    setOpponentScore(0);
    setOpponentProfile(null);
    sounds.playClick();
  };

  const startMatchmaking = (worldId: string, mode: GameModeType, diff: Difficulty) => {
    const w = getWorldById(worldId, chaosFilter);
    if (w) setSelectedWorld(w);
    setSelectedMode(mode);
    setSelectedDifficulty(diff);
    setMatchType('random');
    setIsSuperMatchmaking(true);
    sounds.playClick();

    setTimeout(() => {
      // Pick or create a themed opponent for this specific world
      const matchedOpponent = DEMO_OPPONENTS[Math.floor(Math.random() * DEMO_OPPONENTS.length)];
      setOpponentProfile(matchedOpponent);
      setIsSuperMatchmaking(false);
      setIsPlaying(true);
      setActiveSuperRound(1);
      setPlayerScore(0);
      setOpponentScore(0);

      const tempCode = generateRoomCode(worldId.toUpperCase().slice(0, 4));
      setSuperRoomCode(tempCode);
      localStorage.setItem('ag_utopia_active_room_code', tempCode);
      setSavedActiveRoomCode(tempCode);

      sounds.playMatchFound();
    }, 2000);
  };

  const startSuperMatchmaking = (worldId: string, diff: Difficulty) => {
    startMatchmaking(worldId, 'super_challenge', diff);
  };

  const createPrivateRoom = (worldId: string, diff: Difficulty, mode: GameModeType = 'super_challenge'): string => {
    const code = generateRoomCode(worldId === 'naruto' ? 'NARUTO' : worldId === 'rezero' ? 'REZERO' : 'CHAOS');
    setSuperRoomCode(code);
    localStorage.setItem('ag_utopia_active_room_code', code);
    setSavedActiveRoomCode(code);
    setIsHost(true);
    setMatchType('private');
    const w = getWorldById(worldId, chaosFilter);
    if (w) setSelectedWorld(w);
    setSelectedMode(mode);
    setSelectedDifficulty(diff);
    sounds.playClick();
    return code;
  };

  const joinPrivateRoom = (code: string): { success: boolean; message: string } => {
    if (!code.trim()) return { success: false, message: 'كود الغرفة غير صالح' };
    const upper = code.toUpperCase().trim();
    setSuperRoomCode(upper);
    localStorage.setItem('ag_utopia_active_room_code', upper);
    setSavedActiveRoomCode(upper);
    setIsHost(false);
    setMatchType('private');
    
    // Infer world from code prefix
    let targetWorldId = 'naruto';
    if (upper.startsWith('REZE')) targetWorldId = 'rezero';
    else if (upper.startsWith('CHAO')) targetWorldId = 'chaos_realm';
    
    const w = getWorldById(targetWorldId, chaosFilter);
    if (w) setSelectedWorld(w);
    setSelectedMode('super_challenge');
    
    const opp = DEMO_OPPONENTS[0];
    setOpponentProfile(opp);
    setIsPlaying(true);
    setActiveSuperRound(1);
    setPlayerScore(0);
    setOpponentScore(0);
    sounds.playMatchFound();
    return { success: true, message: 'تم الانضمام للغرفة بنجاح!' };
  };

  const reconnectToActiveRoom = (): boolean => {
    const activeCode = localStorage.getItem('ag_utopia_active_room_code');
    if (!activeCode) return false;

    setSuperRoomCode(activeCode);
    setIsPlaying(true);
    setSelectedMode('super_challenge');
    setMatchType('private');
    if (!selectedWorld) {
      setSelectedWorld(allWorlds[0]);
    }
    if (!opponentProfile) {
      setOpponentProfile(DEMO_OPPONENTS[0]);
    }
    sounds.playVictory();
    return true;
  };

  const cancelMatchmaking = () => {
    setIsSuperMatchmaking(false);
    setSuperRoomCode(null);
    localStorage.removeItem('ag_utopia_active_room_code');
    setSavedActiveRoomCode(null);
    sounds.playClick();
  };

  const finishMatch = (playerFinal: number, opponentFinal: number, customRewards?: { xpEarned?: number; coinsEarned?: number }) => {
    const won = playerFinal >= opponentFinal;
    
    let xpEarned = 0;
    let coinsEarned = 0;

    if (customRewards && customRewards.xpEarned !== undefined && customRewards.coinsEarned !== undefined) {
      // Use exact custom calculated rewards (e.g. from WhoAmI attempts or Double XP questions)
      xpEarned = customRewards.xpEarned;
      coinsEarned = customRewards.coinsEarned;
    } else if (matchType === 'solo') {
      // Training Solo: 10 XP & 10 Coins per question
      const count = Math.max(1, Math.floor(playerFinal / 100) || 5);
      xpEarned = count * 10;
      coinsEarned = count * 10;
    } else {
      // Standard PvP / Private: 20 per correct, 10 per wrong
      const count = Math.max(1, Math.floor(playerFinal / 100) || 5);
      xpEarned = won ? (count * 20 + 20) : (count * 10);
      coinsEarned = won ? (count * 20 + 20) : (count * 10);
    }

    addXp(xpEarned);
    updateCoins(coinsEarned);
    updateStats(won, playerFinal, selectedMode === 'super_challenge' ? 'super' : selectedMode === 'who_am_i' ? 'who_am_i' : 'trivia');

    // Archive Match with unique timestamped ID
    const now = new Date();
    const dateStr = now.toISOString().replace(/[-:T]/g, '').slice(0, 12);
    const randHex = Math.random().toString(36).substring(2, 6).toUpperCase();
    const matchRecordId = `MATCH_${(selectedWorld?.id || 'WORLD').toUpperCase()}_${dateStr}_${randHex}`;

    const matchRecord: MatchRecord = {
      matchId: matchRecordId,
      roomCode: superRoomCode || (matchType === 'solo' ? 'SOLO_PRACTICE' : 'RANDOM_QUEUE'),
      worldId: selectedWorld?.id || 'world',
      mode: selectedMode || 'mode',
      winner: won ? 'player' : 'opponent',
      playerFinalScore: playerFinal,
      opponentFinalScore: opponentFinal,
      timestamp: now.toISOString()
    };

    // Save to match archives & clear active room
    try {
      const existingRecords = JSON.parse(localStorage.getItem('ag_utopia_match_archives') || '[]');
      existingRecords.unshift(matchRecord);
      localStorage.setItem('ag_utopia_match_archives', JSON.stringify(existingRecords.slice(0, 50)));
      localStorage.removeItem('ag_utopia_active_room_code');
      setSavedActiveRoomCode(null);
    } catch (e) {
      console.error(e);
    }

    if (won) {
      sounds.playVictory();
    } else {
      sounds.playWrong();
    }

    return { xpEarned, coinsEarned, won, matchRecordId };
  };

  const exitGame = () => {
    setIsPlaying(false);
    setSelectedMode(null);
    setOpponentProfile(null);
    setSuperRoomCode(null);
    localStorage.removeItem('ag_utopia_active_room_code');
    setSavedActiveRoomCode(null);
    sounds.playClick();
  };

  return (
    <GameContext.Provider
      value={{
        selectedWorld,
        selectedMode,
        selectedDifficulty,
        chaosFilter,
        matchType,
        isPlaying,
        isSuperMatchmaking,
        superRoomCode,
        savedActiveRoomCode,
        isHost,
        opponentProfile,
        superRoundsResults,
        activeSuperRound,
        playerScore,
        opponentScore,
        selectWorld,
        setMode,
        setDifficulty,
        setChaosCategoryFilter,
        startSoloGame,
        startMatchmaking,
        startSuperMatchmaking,
        createPrivateRoom,
        joinPrivateRoom,
        reconnectToActiveRoom,
        cancelMatchmaking,
        finishMatch,
        exitGame
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used inside GameProvider');
  return ctx;
};
