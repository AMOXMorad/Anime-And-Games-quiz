import React, { createContext, useContext, useState, useEffect } from 'react';
import { World, GameModeType, Difficulty, Profile, MatchRecord, SuperRoundResult } from '../types';
import { getAllWorlds, getWorldById, ChaosFilter } from '../data/worlds';
import { useAuth } from './AuthContext';
import { sounds } from '../lib/sound';

import { 
  createMultiplayerRoom, 
  joinMultiplayerRoom, 
  subscribeToRoomUpdates, 
  SynchronizedRoomQuestions, 
  MultiplayerRoom 
} from '../lib/multiplayerRoom';

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
  synchronizedQuestions: SynchronizedRoomQuestions | null;
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
  joinPrivateRoom: (code: string) => Promise<{ success: boolean; message: string }> | { success: boolean; message: string };
  reconnectToActiveRoom: () => boolean;
  cancelMatchmaking: () => void;
  finishMatch: (
    playerFinalScore: number, 
    opponentFinalScore: number, 
    customRewards?: { xpEarned?: number; coinsEarned?: number },
    explicitWon?: boolean
  ) => { won: boolean; xpEarned: number; coinsEarned: number; matchRecordId: string };
  exitGame: () => void;
}

const GameContext = createContext<GameContextType | null>(null);

// Themed challenger bots to ensure variety and prevent matching against oneself
const THEMED_CHALLENGERS: Record<string, Profile[]> = {
  naruto: [
    {
      id: 'bot_itachi_uchiha',
      username: 'Itachi_Tsukuyomi',
      tag: '1092',
      is_guest: false,
      role: 'user',
      is_banned: false,
      coins: 2400,
      xp: 4500,
      level: 19,
      active_frame_id: 'frame_sharingan',
      active_tag_id: 'tag_lightning_godspeed',
      active_title_id: 'title_king_shinobi',
      showcase_titles: ['title_king_shinobi'],
      showcase_tags: ['tag_lightning_godspeed'],
      showcase_frames: ['frame_sharingan'],
      stats: { totalMatches: 48, wins: 40, correctAnswers: 390, streak: 8, whoAmIWins: 14, triviaWins: 18, superChallengeWins: 8 },
      created_at: new Date().toISOString()
    },
    {
      id: 'bot_kakashi_hatake',
      username: 'Kakashi_CopyNinja',
      tag: '7734',
      is_guest: false,
      role: 'user',
      is_banned: false,
      coins: 1800,
      xp: 3200,
      level: 16,
      active_frame_id: 'frame_curse_flame',
      active_tag_id: 'tag_rookie',
      active_title_id: 'title_novice',
      showcase_titles: ['title_novice'],
      showcase_tags: ['tag_rookie'],
      showcase_frames: ['frame_curse_flame'],
      stats: { totalMatches: 36, wins: 27, correctAnswers: 280, streak: 5, whoAmIWins: 10, triviaWins: 11, superChallengeWins: 6 },
      created_at: new Date().toISOString()
    },
    {
      id: 'bot_minato_namikaze',
      username: 'Yellow_Flash_Minato',
      tag: '0404',
      is_guest: false,
      role: 'user',
      is_banned: false,
      coins: 3500,
      xp: 6200,
      level: 24,
      active_frame_id: 'frame_founder_exclusive',
      active_tag_id: 'tag_founder_trident',
      active_title_id: 'title_king_shinobi',
      showcase_titles: ['title_king_shinobi'],
      showcase_tags: ['tag_founder_trident'],
      showcase_frames: ['frame_founder_exclusive'],
      stats: { totalMatches: 65, wins: 56, correctAnswers: 580, streak: 12, whoAmIWins: 20, triviaWins: 24, superChallengeWins: 12 },
      created_at: new Date().toISOString()
    }
  ],
  rezero: [
    {
      id: 'bot_rem_oni',
      username: 'Rem_BlueOni',
      tag: '4490',
      is_guest: false,
      role: 'user',
      is_banned: false,
      coins: 2100,
      xp: 3800,
      level: 17,
      active_frame_id: 'frame_curse_flame',
      active_tag_id: 'tag_rezero_apple',
      active_title_id: 'title_death_return',
      showcase_titles: ['title_death_return'],
      showcase_tags: ['tag_rezero_apple'],
      showcase_frames: ['frame_curse_flame'],
      stats: { totalMatches: 42, wins: 33, correctAnswers: 340, streak: 7, whoAmIWins: 12, triviaWins: 15, superChallengeWins: 6 },
      created_at: new Date().toISOString()
    },
    {
      id: 'bot_emilia_halfelf',
      username: 'Emilia_Frost',
      tag: '9901',
      is_guest: false,
      role: 'user',
      is_banned: false,
      coins: 1600,
      xp: 2900,
      level: 14,
      active_frame_id: 'frame_founder_exclusive',
      active_tag_id: 'tag_rezero_apple',
      active_title_id: 'title_novice',
      showcase_titles: ['title_novice'],
      showcase_tags: ['tag_rezero_apple'],
      showcase_frames: ['frame_founder_exclusive'],
      stats: { totalMatches: 30, wins: 22, correctAnswers: 230, streak: 4, whoAmIWins: 8, triviaWins: 10, superChallengeWins: 4 },
      created_at: new Date().toISOString()
    }
  ],
  default: [
    {
      id: 'bot_eren_rumbling',
      username: 'Eren_Freedom',
      tag: '2091',
      is_guest: false,
      role: 'user',
      is_banned: false,
      coins: 2200,
      xp: 3900,
      level: 18,
      active_frame_id: 'frame_curse_flame',
      active_tag_id: 'tag_lightning_godspeed',
      active_title_id: 'title_king_shinobi',
      showcase_titles: ['title_king_shinobi'],
      showcase_tags: ['tag_lightning_godspeed'],
      showcase_frames: ['frame_curse_flame'],
      stats: { totalMatches: 45, wins: 36, correctAnswers: 360, streak: 7, whoAmIWins: 13, triviaWins: 15, superChallengeWins: 8 },
      created_at: new Date().toISOString()
    },
    {
      id: 'bot_levi_ackerman',
      username: 'Captain_Levi',
      tag: '9910',
      is_guest: false,
      role: 'user',
      is_banned: false,
      coins: 3100,
      xp: 5400,
      level: 22,
      active_frame_id: 'frame_sharingan',
      active_tag_id: 'tag_founder_trident',
      active_title_id: 'title_king_shinobi',
      showcase_titles: ['title_king_shinobi'],
      showcase_tags: ['tag_founder_trident'],
      showcase_frames: ['frame_sharingan'],
      stats: { totalMatches: 58, wins: 50, correctAnswers: 510, streak: 11, whoAmIWins: 18, triviaWins: 22, superChallengeWins: 10 },
      created_at: new Date().toISOString()
    },
    {
      id: 'bot_peter_spiderman',
      username: 'Web_Slinger_Peter',
      tag: '3321',
      is_guest: false,
      role: 'user',
      is_banned: false,
      coins: 1900,
      xp: 3300,
      level: 15,
      active_frame_id: 'frame_curse_flame',
      active_tag_id: 'tag_rookie',
      active_title_id: 'title_novice',
      showcase_titles: ['title_novice'],
      showcase_tags: ['tag_rookie'],
      showcase_frames: ['frame_curse_flame'],
      stats: { totalMatches: 34, wins: 26, correctAnswers: 260, streak: 5, whoAmIWins: 9, triviaWins: 12, superChallengeWins: 5 },
      created_at: new Date().toISOString()
    }
  ]
};

// Safe function to pick an opponent guaranteed to NOT be the current logged-in user
export function getSafeRandomOpponent(worldId: string, currentProfile: Profile | null): Profile {
  const currentId = currentProfile?.id;
  const currentUsername = (currentProfile?.username || '').toLowerCase().trim();

  // 1. Gather all candidates
  const candidates: Profile[] = [];

  // Real registered users
  try {
    const saved = localStorage.getItem('ag_utopia_registered_users');
    if (saved) {
      const list: Profile[] = JSON.parse(saved);
      list.forEach(u => {
        if (!u.is_banned && u.id !== currentId && u.username.toLowerCase().trim() !== currentUsername) {
          candidates.push(u);
        }
      });
    }
  } catch (e) {}

  // Themed bots for this world
  const worldBots = THEMED_CHALLENGERS[worldId] || [];
  const defaultBots = THEMED_CHALLENGERS['default'] || [];
  const allBots = [...worldBots, ...defaultBots];

  allBots.forEach(bot => {
    if (bot.id !== currentId && bot.username.toLowerCase().trim() !== currentUsername) {
      candidates.push(bot);
    }
  });

  if (candidates.length > 0) {
    const randomPick = candidates[Math.floor(Math.random() * candidates.length)];
    return randomPick;
  }

  // Absolute fallback: Generate an instant unique challenger
  const randomTag = Math.floor(1000 + Math.random() * 9000).toString();
  return {
    id: `challenger_utopia_${randomTag}`,
    username: `Rival_Shinobi_${randomTag}`,
    tag: randomTag,
    is_guest: false,
    role: 'user',
    is_banned: false,
    coins: 1500,
    xp: 2600,
    level: 12,
    active_frame_id: 'frame_sharingan',
    active_tag_id: 'tag_lightning_godspeed',
    active_title_id: 'title_novice',
    showcase_titles: ['title_novice'],
    showcase_tags: ['tag_lightning_godspeed'],
    showcase_frames: ['frame_sharingan'],
    stats: { totalMatches: 25, wins: 19, correctAnswers: 180, streak: 4, whoAmIWins: 6, triviaWins: 9, superChallengeWins: 4 },
    created_at: new Date().toISOString()
  };
}

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile, recordMatchResult } = useAuth();

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

  const [synchronizedQuestions, setSynchronizedQuestions] = useState<SynchronizedRoomQuestions | null>(null);

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
    setSuperRoomCode(null);
    setSynchronizedQuestions(null);
    sounds.playClick();
  };

  const startMatchmaking = (worldId: string, mode: GameModeType, diff: Difficulty) => {
    const w = getWorldById(worldId, chaosFilter);
    if (w) setSelectedWorld(w);
    setSelectedMode(mode);
    setSelectedDifficulty(diff);
    setMatchType('random');
    setIsSuperMatchmaking(true);
    setSuperRoomCode(null);
    sounds.playClick();

    setTimeout(() => {
      // Pick a safe, distinct opponent guaranteed not to be oneself
      const matchedOpponent = getSafeRandomOpponent(worldId, profile);
      setOpponentProfile(matchedOpponent);
      setIsSuperMatchmaking(false);
      setIsPlaying(true);
      setActiveSuperRound(1);
      setPlayerScore(0);
      setOpponentScore(0);
      setSuperRoomCode(null);
      setSynchronizedQuestions(null);

      localStorage.removeItem('ag_utopia_active_room_code');
      setSavedActiveRoomCode(null);

      sounds.playMatchFound();
    }, 2000);
  };

  const startSuperMatchmaking = (worldId: string, diff: Difficulty) => {
    startMatchmaking(worldId, 'super_challenge', diff);
  };

  const createPrivateRoom = (worldId: string, diff: Difficulty, mode: GameModeType = 'super_challenge'): string => {
    const w = getWorldById(worldId, chaosFilter) || getAllWorlds()[0];
    if (w) setSelectedWorld(w);
    setSelectedMode(mode);
    setSelectedDifficulty(diff);
    setIsHost(true);
    setMatchType('private');
    sounds.playClick();

    const fallbackCode = (worldId.toUpperCase().slice(0, 4) || 'ROOM') + '-' + Math.floor(1000 + Math.random() * 9000);
    setSuperRoomCode(fallbackCode);

    if (profile && w) {
      createMultiplayerRoom(w, diff, profile).then(res => {
        if (res.success && res.roomCode) {
          setSuperRoomCode(res.roomCode);
          localStorage.setItem('ag_utopia_active_room_code', res.roomCode);
          setSavedActiveRoomCode(res.roomCode);

          if (res.room) {
            setSynchronizedQuestions(res.room.game_state.questions);
          }

          // Realtime listener: when guest joins, automatically start game for Host!
          const unsubscribe = subscribeToRoomUpdates(res.roomCode, (updatedRoom) => {
            if (updatedRoom.status === 'active' && updatedRoom.guest_id) {
              setOpponentProfile(updatedRoom.game_state.guest_profile);
              setSynchronizedQuestions(updatedRoom.game_state.questions);
              setIsPlaying(true);
              setActiveSuperRound(1);
              setPlayerScore(0);
              setOpponentScore(0);
              sounds.playMatchFound();
              unsubscribe();
            }
          });
        }
      });
    }

    return fallbackCode;
  };

  const joinPrivateRoom = async (code: string): Promise<{ success: boolean; message: string }> => {
    if (!code.trim()) return { success: false, message: 'كود الغرفة غير صالح' };
    const upper = code.toUpperCase().trim();
    
    // Prevent joining own room
    if (upper === superRoomCode && isHost) {
      return { success: false, message: 'لا يمكنك الانضمام لغرفتك الخاصة بنفسك! شارك الكود مع صديقك.' };
    }

    if (!profile) return { success: false, message: 'يرجى تسجيل الدخول أو المحاولة مجدداً' };

    const res = await joinMultiplayerRoom(upper, profile);
    if (!res.success || !res.room) {
      return { success: false, message: res.message || 'تعذر الانضمام للغرفة' };
    }

    const room = res.room;
    setSuperRoomCode(upper);
    localStorage.setItem('ag_utopia_active_room_code', upper);
    setSavedActiveRoomCode(upper);
    setIsHost(false);
    setMatchType('private');

    const w = getWorldById(room.world_id, chaosFilter) || getAllWorlds()[0];
    if (w) setSelectedWorld(w);
    setSelectedMode('super_challenge');
    setSelectedDifficulty(room.difficulty);

    setOpponentProfile(room.game_state.host_profile);
    setSynchronizedQuestions(room.game_state.questions);
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
      setSelectedWorld(getAllWorlds()[0] || null);
    }
    if (!opponentProfile) {
      setOpponentProfile(getSafeRandomOpponent(selectedWorld?.id || 'default', profile));
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

  const finishMatch = (
    playerFinal: number, 
    opponentFinal: number, 
    customRewards?: { xpEarned?: number; coinsEarned?: number },
    explicitWon?: boolean
  ) => {
    const won = explicitWon !== undefined ? explicitWon : (playerFinal >= opponentFinal);
    
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

    const modeType: 'who_am_i' | 'trivia' | 'super' = selectedMode === 'super_challenge' ? 'super' : selectedMode === 'who_am_i' ? 'who_am_i' : 'trivia';
    const correctCount = Math.max(0, Math.floor(playerFinal / 100));

    // Perform atomic update across profile and registered user database
    recordMatchResult(xpEarned, coinsEarned, won, correctCount, modeType);

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
        synchronizedQuestions,
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
