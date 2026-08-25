import React, { createContext, useContext, useState, useEffect } from 'react';
import { Profile, StoreItem } from '../types';
import { generateUserTag } from '../lib/supabase';
import { calculateLevel } from '../lib/ranks';
import { sounds } from '../lib/sound';
import confetti from 'canvas-confetti';

interface AuthContextType {
  profile: Profile | null;
  isLoading: boolean;
  inventory: string[]; // item IDs
  loginAsGuest: (username?: string) => Promise<Profile>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (username: string, email: string, pass: string) => Promise<void>;
  logout: () => void;
  updateCoins: (amount: number) => void;
  addXp: (amount: number) => { levelUp: boolean; newLevel: number; rewardCoins: number };
  equipItem: (itemId: string, type: 'frame' | 'tag' | 'title') => void;
  updateShowcases: (type: 'titles' | 'tags' | 'frames', items: string[]) => void;
  updateStats: (win: boolean, correctCount: number, mode: 'who_am_i' | 'trivia' | 'super') => void;
  buyItem: (item: StoreItem) => { success: boolean; message: string };
  setAdminRole: (role: 'user' | 'admin' | 'moderator') => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const DEFAULT_PROFILE: Profile = {
  id: 'guest_' + Math.random().toString(36).substring(2, 9),
  username: 'Challenger',
  tag: generateUserTag(),
  is_guest: true,
  role: 'user',
  is_banned: false,
  coins: 300,
  xp: 0,
  level: 1,
  active_frame_id: 'frame_default',
  active_tag_id: 'tag_rookie',
  active_title_id: 'title_novice',
  showcase_titles: ['title_novice'],
  showcase_tags: ['tag_rookie'],
  showcase_frames: ['frame_default'],
  stats: {
    totalMatches: 0,
    wins: 0,
    correctAnswers: 0,
    streak: 0,
    whoAmIWins: 0,
    triviaWins: 0,
    superChallengeWins: 0
  },
  created_at: new Date().toISOString()
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [inventory, setInventory] = useState<string[]>([
    'frame_default',
    'tag_rookie',
    'title_novice'
  ]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load cloud or initial session
  useEffect(() => {
    const saved = localStorage.getItem('ag_utopia_session');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setProfile(parsed.profile);
        setInventory(parsed.inventory || ['frame_default', 'tag_rookie', 'title_novice']);
      } catch (e) {
        setProfile(DEFAULT_PROFILE);
      }
    } else {
      // Auto create guest cloud session
      const initial = { ...DEFAULT_PROFILE, tag: generateUserTag() };
      setProfile(initial);
      localStorage.setItem('ag_utopia_session', JSON.stringify({ profile: initial, inventory }));
    }
    setIsLoading(false);
  }, []);

  const saveSession = (p: Profile, inv: string[]) => {
    localStorage.setItem('ag_utopia_session', JSON.stringify({ profile: p, inventory: inv }));
  };

  const loginAsGuest = async (customName?: string): Promise<Profile> => {
    const guest: Profile = {
      ...DEFAULT_PROFILE,
      id: 'guest_' + Math.random().toString(36).substring(2, 9),
      username: customName || `Guest_${Math.floor(100 + Math.random() * 900)}`,
      tag: generateUserTag(),
      is_guest: true,
      created_at: new Date().toISOString()
    };
    setProfile(guest);
    setInventory(['frame_default', 'tag_rookie', 'title_novice']);
    saveSession(guest, ['frame_default', 'tag_rookie', 'title_novice']);
    sounds.playClick();
    return guest;
  };

  const loginWithEmail = async (email: string, _pass: string) => {
    const username = email.split('@')[0];
    const isAdmin = username.toLowerCase() === 'admin' || username.toLowerCase() === 'founder';
    const userProfile: Profile = {
      ...DEFAULT_PROFILE,
      id: 'usr_' + Math.random().toString(36).substring(2, 9),
      username: username,
      tag: generateUserTag(),
      is_guest: false,
      role: isAdmin ? 'admin' : 'user',
      active_frame_id: isAdmin ? 'frame_founder_exclusive' : 'frame_default',
      active_tag_id: isAdmin ? 'tag_founder_trident' : 'tag_rookie',
      active_title_id: isAdmin ? 'title_founder' : 'title_novice',
      coins: isAdmin ? 99999 : 500,
      xp: isAdmin ? 15000 : 100,
      level: isAdmin ? 999 : 2
    };
    const inv = isAdmin
      ? ['frame_default', 'frame_founder_exclusive', 'tag_rookie', 'tag_founder_trident', 'title_novice', 'title_founder']
      : ['frame_default', 'tag_rookie', 'title_novice'];

    setProfile(userProfile);
    setInventory(inv);
    saveSession(userProfile, inv);
    sounds.playVictory();
  };

  const registerWithEmail = async (username: string, _email: string, _pass: string) => {
    const userProfile: Profile = {
      ...DEFAULT_PROFILE,
      id: 'usr_' + Math.random().toString(36).substring(2, 9),
      username,
      tag: generateUserTag(),
      is_guest: false,
      coins: 400
    };
    const inv = ['frame_default', 'tag_rookie', 'title_novice'];
    setProfile(userProfile);
    setInventory(inv);
    saveSession(userProfile, inv);
    sounds.playVictory();
  };

  const logout = () => {
    loginAsGuest();
  };

  const updateCoins = (amount: number) => {
    if (!profile) return;
    const updated = { ...profile, coins: Math.max(0, profile.coins + amount) };
    setProfile(updated);
    saveSession(updated, inventory);
  };

  const addXp = (amount: number) => {
    if (!profile) return { levelUp: false, newLevel: 1, rewardCoins: 0 };
    const oldLevel = profile.level;
    const newXp = profile.xp + amount;
    const { level: newLevel } = calculateLevel(newXp);

    let rewardCoins = 0;
    let levelUp = false;

    if (newLevel > oldLevel) {
      levelUp = true;
      rewardCoins = (newLevel - oldLevel) * 150;
      sounds.playLevelUp();
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 }
      });
    }

    const updated: Profile = {
      ...profile,
      xp: newXp,
      level: newLevel,
      coins: profile.coins + rewardCoins
    };

    setProfile(updated);
    saveSession(updated, inventory);
    return { levelUp, newLevel, rewardCoins };
  };

  const equipItem = (itemId: string, type: 'frame' | 'tag' | 'title') => {
    if (!profile) return;
    const updated = { ...profile };
    if (type === 'frame') updated.active_frame_id = itemId;
    if (type === 'tag') updated.active_tag_id = itemId;
    if (type === 'title') updated.active_title_id = itemId;

    setProfile(updated);
    saveSession(updated, inventory);
    sounds.playClick();
  };

  const updateShowcases = (type: 'titles' | 'tags' | 'frames', items: string[]) => {
    if (!profile) return;
    const updated = { ...profile };
    if (type === 'titles') updated.showcase_titles = items.slice(0, 5);
    if (type === 'tags') updated.showcase_tags = items.slice(0, 5);
    if (type === 'frames') updated.showcase_frames = items.slice(0, 5);

    setProfile(updated);
    saveSession(updated, inventory);
  };

  const updateStats = (win: boolean, correctCount: number, mode: 'who_am_i' | 'trivia' | 'super') => {
    if (!profile) return;
    const stats = { ...profile.stats };
    stats.totalMatches += 1;
    if (win) {
      stats.wins += 1;
      stats.streak += 1;
      if (mode === 'who_am_i') stats.whoAmIWins += 1;
      if (mode === 'trivia') stats.triviaWins += 1;
      if (mode === 'super') stats.superChallengeWins += 1;
    } else {
      stats.streak = 0;
    }
    stats.correctAnswers += correctCount;

    const updated = { ...profile, stats };
    setProfile(updated);
    saveSession(updated, inventory);
  };

  const buyItem = (item: StoreItem): { success: boolean; message: string } => {
    if (!profile) return { success: false, message: 'No profile' };
    if (inventory.includes(item.id)) {
      return { success: false, message: 'Item already owned' };
    }
    if (profile.coins < item.price) {
      sounds.playWrong();
      return { success: false, message: 'Not enough coins' };
    }

    const updatedCoins = profile.coins - item.price;
    const updatedInv = [...inventory, item.id];
    const updatedProfile = { ...profile, coins: updatedCoins };

    setInventory(updatedInv);
    setProfile(updatedProfile);
    saveSession(updatedProfile, updatedInv);
    sounds.playClaim();
    confetti({ particleCount: 60, spread: 60 });
    return { success: true, message: 'Purchased successfully' };
  };

  const setAdminRole = (role: 'user' | 'admin' | 'moderator') => {
    if (!profile) return;
    const updated = { ...profile, role };
    setProfile(updated);
    saveSession(updated, inventory);
  };

  return (
    <AuthContext.Provider
      value={{
        profile,
        isLoading,
        inventory,
        loginAsGuest,
        loginWithEmail,
        registerWithEmail,
        logout,
        updateCoins,
        addXp,
        equipItem,
        updateShowcases,
        updateStats,
        buyItem,
        setAdminRole
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
