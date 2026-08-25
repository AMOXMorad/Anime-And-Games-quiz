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

interface GameContextType {
  selectedWorld: World | null;
  selectedMode: GameModeType | null;
  selectedDifficulty: Difficulty;
  chaosFilter: ChaosFilter;
  isPlaying: boolean;
  isSuperMatchmaking: boolean;
  superRoomCode: string | null;
  isHost: boolean;
  opponentProfile: Profile | null;
  superRoundsResults: SuperRoundResult[];
  activeSuperRound: number;
  playerScore: number;
  opponentScore: number;
  
  // Setup & Navigation
  selectWorld: (worldId: string) => void;
  setMode: (mode: GameModeType) => void;
  setDifficulty: (diff: Difficulty) => void;
  setChaosCategoryFilter: (filter: ChaosFilter) => void;
  startSoloGame: (world: World, mode: GameModeType, diff: Difficulty) => void;
  startSuperMatchmaking: (worldId: string, diff: Difficulty) => void;
  createPrivateRoom: (worldId: string, diff: Difficulty) => string;
  joinPrivateRoom: (code: string) => { success: boolean; message: string };
  cancelMatchmaking: () => void;
  finishMatch: (playerFinalScore: number, opponentFinalScore: number) => { won: boolean; xpEarned: number; coinsEarned: number };
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
  
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isSuperMatchmaking, setIsSuperMatchmaking] = useState<boolean>(false);
  const [superRoomCode, setSuperRoomCode] = useState<string | null>(null);
  const [isHost, setIsHost] = useState<boolean>(true);
  const [opponentProfile, setOpponentProfile] = useState<Profile | null>(null);

  const [activeSuperRound, setActiveSuperRound] = useState<number>(1);
  const [playerScore, setPlayerScore] = useState<number>(0);
  const [opponentScore, setOpponentScore] = useState<number>(0);
  const [superRoundsResults, setSuperRoundsResults] = useState<SuperRoundResult[]>([]);

  const selectWorld = (worldId: string) => {
    const w = getWorldById(worldId);
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
    sounds.playClick();
  };

  const startSoloGame = (world: World, mode: GameModeType, diff: Difficulty) => {
    setSelectedWorld(world);
    setSelectedMode(mode);
    setSelectedDifficulty(diff);
    setIsPlaying(true);
    setPlayerScore(0);
    setOpponentScore(0);
    sounds.playClick();
  };

  const startSuperMatchmaking = (worldId: string, diff: Difficulty) => {
    selectWorld(worldId);
    setSelectedMode('super_challenge');
    setSelectedDifficulty(diff);
    setIsSuperMatchmaking(true);
    sounds.playClick();

    // Simulate matchmaking search & match finding after 2.5s
    setTimeout(() => {
      const opp = DEMO_OPPONENTS[Math.floor(Math.random() * DEMO_OPPONENTS.length)];
      setOpponentProfile(opp);
      setIsSuperMatchmaking(false);
      setIsPlaying(true);
      setActiveSuperRound(1);
      setPlayerScore(0);
      setOpponentScore(0);
      sounds.playMatchFound();
    }, 2500);
  };

  const createPrivateRoom = (worldId: string, diff: Difficulty): string => {
    const code = generateRoomCode(worldId === 'naruto' ? 'NARUTO' : worldId === 're_zero' ? 'REZERO' : 'CHAOS');
    setSuperRoomCode(code);
    setIsHost(true);
    selectWorld(worldId);
    setSelectedMode('super_challenge');
    setSelectedDifficulty(diff);
    sounds.playClick();
    return code;
  };

  const joinPrivateRoom = (code: string): { success: boolean; message: string } => {
    if (!code.trim()) return { success: false, message: 'Invalid room code' };
    setSuperRoomCode(code.toUpperCase());
    setIsHost(false);
    setSelectedMode('super_challenge');
    const opp = DEMO_OPPONENTS[0];
    setOpponentProfile(opp);
    setIsPlaying(true);
    setActiveSuperRound(1);
    setPlayerScore(0);
    setOpponentScore(0);
    sounds.playMatchFound();
    return { success: true, message: 'Joined room successfully!' };
  };

  const cancelMatchmaking = () => {
    setIsSuperMatchmaking(false);
    setSuperRoomCode(null);
    sounds.playClick();
  };

  const finishMatch = (playerFinal: number, opponentFinal: number) => {
    const won = playerFinal >= opponentFinal;
    const baseMultiplier = selectedDifficulty === 'hard' ? 1.5 : selectedDifficulty === 'medium' ? 1.2 : 1;
    
    let xpEarned = Math.floor((playerFinal * 15 + (won ? 80 : 25)) * baseMultiplier);
    let coinsEarned = Math.floor((playerFinal * 10 + (won ? 50 : 15)) * baseMultiplier);

    if (selectedWorld?.id === 'chaos_realm') {
      xpEarned = Math.floor(xpEarned * 1.3);
      coinsEarned = Math.floor(coinsEarned * 1.3);
    }

    addXp(xpEarned);
    updateCoins(coinsEarned);
    updateStats(won, playerFinal, selectedMode === 'super_challenge' ? 'super' : selectedMode === 'who_am_i' ? 'who_am_i' : 'trivia');

    if (won) {
      sounds.playVictory();
    } else {
      sounds.playWrong();
    }

    return { won, xpEarned, coinsEarned };
  };

  const exitGame = () => {
    setIsPlaying(false);
    setSelectedMode(null);
    setOpponentProfile(null);
    setSuperRoomCode(null);
    sounds.playClick();
  };

  return (
    <GameContext.Provider
      value={{
        selectedWorld,
        selectedMode,
        selectedDifficulty,
        chaosFilter,
        isPlaying,
        isSuperMatchmaking,
        superRoomCode,
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
        startSuperMatchmaking,
        createPrivateRoom,
        joinPrivateRoom,
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
