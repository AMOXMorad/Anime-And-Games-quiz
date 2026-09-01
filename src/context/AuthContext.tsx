import React, { createContext, useContext, useState, useEffect } from 'react';
import { Profile, StoreItem, PromoCode } from '../types';
import { generateUserTag, supabase } from '../lib/supabase';
import { calculateLevel } from '../lib/ranks';
import { sounds } from '../lib/sound';
import { realtimeService } from '../lib/realtimeService';
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
  recordMatchResult: (
    xpEarned: number,
    coinsEarned: number,
    won: boolean,
    correctCount: number,
    mode: 'who_am_i' | 'trivia' | 'super'
  ) => { levelUp: boolean; newLevel: number; rewardCoins: number; updatedProfile: Profile | null };
  equipItem: (itemId: string, type: 'frame' | 'tag' | 'title' | 'avatar', assetUrl?: string) => void;
  updateShowcases: (type: 'titles' | 'tags' | 'frames' | 'avatars', items: string[]) => void;
  updateStats: (win: boolean, correctCount: number, mode: 'who_am_i' | 'trivia' | 'super') => void;
  buyItem: (item: StoreItem) => { success: boolean; message: string };
  redeemPromoCode: (code: string, storeItems: StoreItem[]) => { success: boolean; message: string; item?: StoreItem; coins?: number };
  updateProfileDetails: (newUsername?: string, newBio?: string) => { success: boolean; message: string };
  deleteUserFromDatabase: (userId: string) => { success: boolean; message: string };
  adminBanUser: (userId: string, isBanned: boolean, reason?: string) => { success: boolean; message: string };
  adminModifyUser: (userId: string, updates: Partial<Profile>) => { success: boolean; message: string };
  adminRemoveItemFromUser: (userId: string, itemId: string) => { success: boolean; message: string };
  adminAddItemToUser: (userId: string, itemId: string) => { success: boolean; message: string };
  adminGetUserInventory: (userId: string) => string[];
  setAdminRole: (role: 'user' | 'admin' | 'moderator') => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const ADMIN_USERNAME = 'AMOX';
const ADMIN_PASSWORD = 'Between-The-Earth-And-Sky-Iam-The-Honored-One-AMOX2000';

export const INITIAL_PROMO_CODES: PromoCode[] = [
  {
    id: 'promo_utopia_welcome',
    code: 'UTOPIA2026',
    reward_coins: 300,
    description_ar: 'كود ترويجي دائم يمنح 300 كوينز مجاناً لجميع اللاعبين (استخدام واحد لكل حساب)',
    description_en: 'Permanent promo code granting 300 free coins for all players',
    expiry_type: 'permanent',
    current_uses: 0,
    redeemed_by_users: [],
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'promo_amox_vip',
    code: 'AMOX_VIP',
    reward_coins: 500,
    description_ar: 'كود VIP خاص ومحدود لأول 20 مستخدم فقط!',
    description_en: 'Exclusive VIP code limited to the first 20 users',
    expiry_type: 'uses_limited',
    max_uses: 20,
    current_uses: 0,
    redeemed_by_users: [],
    is_active: true,
    created_at: new Date().toISOString()
  }
];

const DEFAULT_PROFILE: Profile = {
  id: 'guest_' + Math.random().toString(36).substring(2, 9),
  username: 'Challenger',
  tag: generateUserTag(),
  is_guest: true,
  role: 'user',
  is_banned: false,
  coins: 150,
  xp: 0,
  level: 1,
  avatar_url: 'https://s4.anilist.co/file/anilistcdn/character/large/b17-phjcWCkRuIhu.png',
  active_avatar_id: 'avatar_default',
  active_frame_id: 'frame_default',
  active_tag_id: 'tag_rookie',
  active_title_id: 'title_novice',
  showcase_titles: ['title_novice'],
  showcase_tags: ['tag_rookie'],
  showcase_frames: ['frame_default'],
  showcase_avatars: ['avatar_default'],
  redeemed_codes: [],
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
    'avatar_default',
    'frame_default',
    'tag_rookie',
    'title_novice'
  ]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load session and verify user existence in database
  useEffect(() => {
    const checkAndLoadSession = () => {
      const saved = localStorage.getItem('ag_utopia_session');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.profile?.role === 'admin') {
            setProfile(parsed.profile);
            setInventory(parsed.inventory || ['avatar_default', 'frame_default', 'tag_rookie', 'title_novice']);
          } else if (parsed.profile) {
            // Verify if user is still in registered database
            const savedUsers: Profile[] = JSON.parse(localStorage.getItem('ag_utopia_registered_users') || '[]');
            const userInDb = savedUsers.find(
              u => u.id === parsed.profile.id || u.username.toLowerCase() === parsed.profile.username?.toLowerCase()
            );

            if (!userInDb) {
              // User was deleted by admin! Wipe session.
              console.warn('User account was deleted from database. Clearing session.');
              localStorage.removeItem('ag_utopia_session');
              setProfile(null);
            } else if (userInDb.is_banned) {
              // User was banned by admin!
              console.warn('User account is banned. Clearing session.');
              localStorage.removeItem('ag_utopia_session');
              setProfile(null);
            } else {
              // Sync latest data from database
              const merged = { ...parsed.profile, ...userInDb };
              if (merged.avatar_url?.includes('unsplash.com') || merged.avatar_url?.includes('myanimelist.net/images/characters/12/29795.jpg')) {
                merged.avatar_url = 'https://s4.anilist.co/file/anilistcdn/character/large/b17-phjcWCkRuIhu.png';
              }
              const inv = userInDb.inventory && userInDb.inventory.length > 0
                ? userInDb.inventory
                : parsed.inventory || ['avatar_default', 'frame_default', 'tag_rookie', 'title_novice'];
              setProfile(merged);
              setInventory(inv);
              localStorage.setItem('ag_utopia_session', JSON.stringify({ profile: merged, inventory: inv }));
            }
          }
        } catch (e) {
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
      setIsLoading(false);
    };

    checkAndLoadSession();
  }, []);

  // Listen to realtime database events (Bans, Deletions, Profile Modifications)
  useEffect(() => {
    const handleUserBanned = (e: Event) => {
      const { detail } = e as CustomEvent;
      if (profile && detail?.userId === profile.id && detail?.isBanned) {
        alert('🚫 تم حظر حسابك من قِبل المشرف العام!');
        logout();
      }
    };
    const handleUserDeleted = (e: Event) => {
      const { detail } = e as CustomEvent;
      if (profile && (detail?.userId === profile.id || detail?.userId === profile.username)) {
        alert('⚠️ تم حذف حسابك نهائياً من قاعدة البيانات بواسطة المشرف العام!');
        logout();
      }
    };
    const handleUserUpdated = (e: Event) => {
      const { detail } = e as CustomEvent;
      if (profile && detail?.id === profile.id) {
        setProfile(prev => prev ? { ...prev, ...detail } : null);
        if (detail.inventory) setInventory(detail.inventory);
      }
    };

    window.addEventListener('ag_realtime_user_banned', handleUserBanned);
    window.addEventListener('ag_realtime_user_deleted', handleUserDeleted);
    window.addEventListener('ag_realtime_user_updated', handleUserUpdated);

    return () => {
      window.removeEventListener('ag_realtime_user_banned', handleUserBanned);
      window.removeEventListener('ag_realtime_user_deleted', handleUserDeleted);
      window.removeEventListener('ag_realtime_user_updated', handleUserUpdated);
    };
  }, [profile]);

  const saveSession = (p: Profile, inv: string[]) => {
    localStorage.setItem('ag_utopia_session', JSON.stringify({ profile: p, inventory: inv }));
    
    // 1. Broadcast live profile update
    realtimeService.broadcast('profile_updated', p);

    // 2. Persist to Supabase Database
    try {
      supabase.from('profiles').upsert([{
        id: p.id,
        username: p.username,
        tag: p.tag,
        bio: p.bio || '',
        is_guest: p.is_guest,
        role: p.role,
        is_banned: p.is_banned,
        coins: p.coins,
        xp: p.xp,
        level: p.level,
        avatar_url: p.avatar_url || '',
        active_avatar_id: p.active_avatar_id,
        active_frame_id: p.active_frame_id,
        active_tag_id: p.active_tag_id,
        active_title_id: p.active_title_id,
        showcase_titles: p.showcase_titles,
        showcase_tags: p.showcase_tags,
        showcase_frames: p.showcase_frames,
        showcase_avatars: p.showcase_avatars || [],
        inventory: inv,
        redeemed_codes: p.redeemed_codes || [],
        stats: p.stats,
        updated_at: new Date().toISOString()
      }]).then(({ error }) => {
        if (error) console.warn('Supabase profile upsert fallback to local:', error.message);
      });
    } catch (e) {}

    // 3. Keep registered users database in sync only if user exists
    try {
      const saved = localStorage.getItem('ag_utopia_registered_users');
      const list: Profile[] = saved ? JSON.parse(saved) : [];
      const index = list.findIndex(u => u.id === p.id || u.username.toLowerCase() === p.username.toLowerCase());
      if (index !== -1) {
        list[index] = { ...list[index], ...p, inventory: inv };
        localStorage.setItem('ag_utopia_registered_users', JSON.stringify(list));
        window.dispatchEvent(new CustomEvent('ag_utopia_users_updated'));
      }
    } catch (e) {
      console.error('Failed to sync registered users', e);
    }
  };

  const loginAsGuest = async (customName?: string): Promise<Profile> => {
    const guest: Profile = {
      ...DEFAULT_PROFILE,
      id: 'guest_' + Math.random().toString(36).substring(2, 9),
      username: customName || `Challenger_${Math.floor(100 + Math.random() * 900)}`,
      tag: generateUserTag(),
      is_guest: true,
      redeemed_codes: [],
      created_at: new Date().toISOString()
    };
    setProfile(guest);
    setInventory(['avatar_default', 'frame_default', 'tag_rookie', 'title_novice']);
    saveSession(guest, ['avatar_default', 'frame_default', 'tag_rookie', 'title_novice']);
    sounds.playClick();
    return guest;
  };

  const loginWithEmail = async (identifier: string, pass: string) => {
    const cleanUser = identifier.split('@')[0].trim();
    const isAttemptingAdmin = cleanUser.toUpperCase() === ADMIN_USERNAME.toUpperCase();

    if (isAttemptingAdmin) {
      if (pass !== ADMIN_PASSWORD) {
        sounds.playWrong();
        throw new Error('كلمة المرور غير صحيحة لحساب المشرف العام AMOX!');
      }

      const adminProfile: Profile = {
        ...DEFAULT_PROFILE,
        id: 'usr_founder_amox',
        username: 'AMOX',
        tag: '0001',
        is_guest: false,
        role: 'admin',
        active_frame_id: 'frame_founder_exclusive',
        active_tag_id: 'tag_founder_trident',
        active_title_id: 'title_founder',
        active_avatar_id: 'avatar_madara_void',
        avatar_url: 'https://s4.anilist.co/file/anilistcdn/character/large/b53901-HnRKSoHMG5Vg.png',
        coins: 100000,
        xp: 100000,
        level: 999,
        redeemed_codes: []
      };

      const adminInv = [
        'avatar_default',
        'avatar_madara_void',
        'frame_default',
        'frame_founder_exclusive',
        'tag_rookie',
        'tag_founder_trident',
        'title_novice',
        'title_founder'
      ];

      setProfile(adminProfile);
      setInventory(adminInv);
      saveSession(adminProfile, adminInv);
      sounds.playVictory();
      confetti({ particleCount: 100, spread: 80 });
      return;
    }

    // Normal User Lookup in Database
    let savedUsers: Profile[] = [];
    try {
      savedUsers = JSON.parse(localStorage.getItem('ag_utopia_registered_users') || '[]');
    } catch (e) {}

    const matchedUser = savedUsers.find(
      u => u.username.toLowerCase() === cleanUser.toLowerCase() || u.id === cleanUser
    );

    // CRITICAL: Check if account exists
    if (!matchedUser) {
      sounds.playWrong();
      throw new Error(`⚠️ الحساب "${cleanUser}" غير موجود أو تم حذفه نهائياً من قاعدة البيانات من قِبل المشرف العام!`);
    }

    // CRITICAL: Check if account is banned
    if (matchedUser.is_banned) {
      sounds.playWrong();
      throw new Error(`🚫 هذا الحساب محظور حالياً من دخول اللعبة بواسطة إدارة يوتوبيا! ${matchedUser.ban_reason ? `السبب: ${matchedUser.ban_reason}` : ''}`);
    }

    // Verify Password if recorded
    try {
      const creds = JSON.parse(localStorage.getItem('ag_utopia_user_credentials') || '{}');
      const userCred = creds[cleanUser.toLowerCase()];
      if (userCred && userCred.password && userCred.password !== pass) {
        sounds.playWrong();
        throw new Error('كلمة المرور غير صحيحة لهذا الحساب!');
      }
    } catch (e) {}

    const userInv = matchedUser.inventory && matchedUser.inventory.length > 0
      ? matchedUser.inventory
      : adminGetUserInventory(matchedUser.id);

    setProfile(matchedUser);
    setInventory(userInv);
    saveSession(matchedUser, userInv);
    sounds.playVictory();
  };

  const registerWithEmail = async (username: string, email: string, pass: string) => {
    const cleanUser = username.trim();
    if (cleanUser.toUpperCase() === ADMIN_USERNAME.toUpperCase()) {
      sounds.playWrong();
      throw new Error('اسم المستخدم AMOX مخصص ومحجوز للمشرف العام فقط!');
    }

    // 1. Check if user already exists
    const savedUsers: Profile[] = JSON.parse(localStorage.getItem('ag_utopia_registered_users') || '[]');
    const exists = savedUsers.some(u => u.username.toLowerCase() === cleanUser.toLowerCase());
    if (exists) {
      sounds.playWrong();
      throw new Error(`اسم المستخدم "${cleanUser}" مسجل مسبقاً! يرجى اختيار اسم آخر أو تسجيل الدخول.`);
    }

    const newId = 'usr_' + Math.random().toString(36).substring(2, 9);
    const userProfile: Profile = {
      ...DEFAULT_PROFILE,
      id: newId,
      username: cleanUser,
      tag: generateUserTag(),
      is_guest: false,
      role: 'user',
      is_banned: false,
      coins: 200,
      xp: 0,
      level: 1,
      redeemed_codes: [],
      inventory: ['avatar_default', 'frame_default', 'tag_rookie', 'title_novice'],
      created_at: new Date().toISOString()
    };
    const inv = ['avatar_default', 'frame_default', 'tag_rookie', 'title_novice'];

    // 2. Save credentials
    try {
      const creds = JSON.parse(localStorage.getItem('ag_utopia_user_credentials') || '{}');
      creds[cleanUser.toLowerCase()] = { id: newId, email, password: pass };
      if (email) creds[email.toLowerCase()] = { id: newId, email, password: pass };
      localStorage.setItem('ag_utopia_user_credentials', JSON.stringify(creds));
    } catch (e) {}

    // 3. Add to registered users
    savedUsers.push({ ...userProfile, inventory: inv });
    localStorage.setItem('ag_utopia_registered_users', JSON.stringify(savedUsers));
    window.dispatchEvent(new CustomEvent('ag_utopia_users_updated'));

    // 4. Save session and Supabase
    setProfile(userProfile);
    setInventory(inv);
    saveSession(userProfile, inv);
    sounds.playVictory();
  };

  const logout = () => {
    setProfile(null);
    localStorage.removeItem('ag_utopia_session');
    sounds.playClick();
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
      rewardCoins = (newLevel - oldLevel) * 40;
      sounds.playLevelUp();
      confetti({
        particleCount: 80,
        spread: 70,
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

  const recordMatchResult = (
    xpEarned: number,
    coinsEarned: number,
    won: boolean,
    correctCount: number,
    mode: 'who_am_i' | 'trivia' | 'super'
  ) => {
    if (!profile) return { levelUp: false, newLevel: 1, rewardCoins: 0, updatedProfile: null };

    const oldLevel = profile.level;
    const cleanXpGained = Math.max(0, xpEarned);
    const newXp = profile.xp + cleanXpGained;
    const { level: newLevel } = calculateLevel(newXp);

    let rewardCoins = 0;
    let levelUp = false;

    if (newLevel > oldLevel) {
      levelUp = true;
      rewardCoins = (newLevel - oldLevel) * 40;
      sounds.playLevelUp();
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.6 }
      });
    }

    const cleanCoinsGained = Math.max(0, coinsEarned);
    const finalCoins = Math.max(0, profile.coins + cleanCoinsGained + rewardCoins);

    const stats = { ...profile.stats };
    stats.totalMatches += 1;
    if (won) {
      stats.wins += 1;
      stats.streak += 1;
      if (mode === 'who_am_i') stats.whoAmIWins += 1;
      if (mode === 'trivia') stats.triviaWins += 1;
      if (mode === 'super') stats.superChallengeWins += 1;
    } else {
      stats.streak = 0;
    }
    stats.correctAnswers += Math.max(0, correctCount);

    const updated: Profile = {
      ...profile,
      xp: newXp,
      level: newLevel,
      coins: finalCoins,
      stats
    };

    setProfile(updated);
    saveSession(updated, inventory);
    return { levelUp, newLevel, rewardCoins, updatedProfile: updated };
  };

  const equipItem = (itemId: string, type: 'frame' | 'tag' | 'title' | 'avatar', assetUrl?: string) => {
    if (!profile) return;
    const updated = { ...profile };
    if (type === 'frame') updated.active_frame_id = itemId;
    if (type === 'tag') updated.active_tag_id = itemId;
    if (type === 'title') updated.active_title_id = itemId;
    if (type === 'avatar') {
      updated.active_avatar_id = itemId;
      if (assetUrl) updated.avatar_url = assetUrl;
    }

    setProfile(updated);
    saveSession(updated, inventory);
    sounds.playClick();
  };

  const updateShowcases = (type: 'titles' | 'tags' | 'frames' | 'avatars', items: string[]) => {
    if (!profile) return;
    const updated = { ...profile };
    if (type === 'titles') updated.showcase_titles = items.slice(0, 5);
    if (type === 'tags') updated.showcase_tags = items.slice(0, 5);
    if (type === 'frames') updated.showcase_frames = items.slice(0, 5);
    if (type === 'avatars') updated.showcase_avatars = items.slice(0, 5);

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
    if (!profile) return { success: false, message: 'يرجى تسجيل الدخول أولاً لإجراء عمليات الشراء' };
    if (inventory.includes(item.id)) {
      return { success: false, message: 'تمتلك هذا العنصر بالفعل' };
    }

    if (item.unlock_type === 'code') {
      sounds.playWrong();
      return { success: false, message: 'هذا العنصر حصري عبر كود ترويجي خاص فقط!' };
    }

    if (item.unlock_type === 'gift') {
      sounds.playWrong();
      return { success: false, message: 'هذا العنصر حصري كهدية خاصة يرسلها المؤسس فقط!' };
    }

    // Determine actual cost: Free if player has reached or exceeded required_level
    const isFreeAtLevel = item.unlock_type === 'level' && item.required_level && profile.level >= item.required_level;
    const actualCost = isFreeAtLevel ? 0 : item.price;

    if (profile.coins < actualCost) {
      sounds.playWrong();
      if (item.unlock_type === 'level' && item.required_level) {
        return { 
          success: false, 
          message: `لا تملك عملات كافية للشراء المبكر (${item.price} كوينز). يمكنك أيضاً الانتظار حتى تصل للمستوى ${item.required_level} للحصول عليه مجاناً!` 
        };
      }
      return { success: false, message: 'لا تملك عملات كافية' };
    }

    const updatedCoins = profile.coins - actualCost;
    const updatedInv = [...inventory, item.id];
    const updatedProfile = { ...profile, coins: updatedCoins };

    setInventory(updatedInv);
    setProfile(updatedProfile);
    saveSession(updatedProfile, updatedInv);
    sounds.playClaim();
    confetti({ particleCount: 70, spread: 65 });

    if (isFreeAtLevel) {
      return { success: true, message: `🎉 مبروك! تم استلام العنصر مجاناً لوصولك للمستوى ${item.required_level}!` };
    }
    return { success: true, message: 'تم الشراء بنجاح!' };
  };

  // Advanced Promo Code Engine: Single-use per account, date expiry, and max users limit
  const redeemPromoCode = (
    code: string,
    storeItems: StoreItem[]
  ): { success: boolean; message: string; item?: StoreItem; coins?: number } => {
    if (!profile) {
      sounds.playWrong();
      return { success: false, message: 'يرجى تسجيل الدخول أولاً لاسترداد الأكواد' };
    }

    if (!code.trim()) {
      return { success: false, message: 'يرجى إدخال الكود' };
    }

    const cleanCode = code.trim().toUpperCase();

    // 1. Check if user already redeemed this code
    const userRedeemed = profile.redeemed_codes || [];
    if (userRedeemed.includes(cleanCode)) {
      sounds.playWrong();
      return {
        success: false,
        message: '❌ لقد قمت باسترداد هذا الكود مسبقاً! كل كود صالح للاستخدام مرة واحدة فقط لكل حساب.'
      };
    }

    // 2. Load promo codes list
    let allPromoCodes: PromoCode[] = [];
    try {
      const saved = localStorage.getItem('ag_utopia_promo_codes');
      allPromoCodes = saved ? JSON.parse(saved) : INITIAL_PROMO_CODES;
    } catch (e) {
      allPromoCodes = INITIAL_PROMO_CODES;
    }

    const matchedPromo = allPromoCodes.find(
      p => p.code.toUpperCase() === cleanCode && p.is_active
    );

    // Also check if tied directly to a StoreItem with redeem_code
    const matchedItem = storeItems.find(
      i => i.redeem_code && i.redeem_code.toUpperCase() === cleanCode
    );

    if (!matchedPromo && !matchedItem) {
      sounds.playWrong();
      return { success: false, message: 'الكود غير صحيح أو غير مفعل' };
    }

    // 3. Verify Promo Code Expiration Constraints
    if (matchedPromo) {
      // Check date expiry
      if (matchedPromo.expiry_type === 'date_limited' && matchedPromo.expires_at) {
        const expiryDate = new Date(matchedPromo.expires_at);
        if (new Date() > expiryDate) {
          sounds.playWrong();
          return {
            success: false,
            message: `⏰ انتهت صلاحية هذا الكود بتاريخ ${matchedPromo.expires_at}`
          };
        }
      }

      // Check max uses limit (e.g. for first 10 users or single use)
      if (
        (matchedPromo.expiry_type === 'uses_limited' || matchedPromo.max_uses) &&
        matchedPromo.max_uses &&
        matchedPromo.current_uses >= matchedPromo.max_uses
      ) {
        sounds.playWrong();
        return {
          success: false,
          message: `🚫 عذراً! لقد تم استنفاد هذا الكود بالكامل (صالح لأول ${matchedPromo.max_uses} مستخدم فقط).`
        };
      }
    }

    // 4. Grant Rewards
    let rewardCoins = 0;
    let unlockedItem: StoreItem | undefined = undefined;
    let newInventory = [...inventory];

    if (matchedPromo) {
      rewardCoins = matchedPromo.reward_coins || 0;
      if (matchedPromo.reward_item_id) {
        unlockedItem = storeItems.find(i => i.id === matchedPromo.reward_item_id);
      }
    }

    if (matchedItem) {
      unlockedItem = matchedItem;
    }

    if (unlockedItem && !newInventory.includes(unlockedItem.id)) {
      newInventory.push(unlockedItem.id);
    }

    // 5. Update user session with redeemed code and balance
    const updatedProfile: Profile = {
      ...profile,
      coins: profile.coins + rewardCoins,
      redeemed_codes: [...userRedeemed, cleanCode]
    };

    setInventory(newInventory);
    setProfile(updatedProfile);
    saveSession(updatedProfile, newInventory);

    // 6. Update Promo Code redemption stats in database
    if (matchedPromo) {
      const updatedPromos = allPromoCodes.map(p => {
        if (p.id === matchedPromo.id) {
          const updatedUses = p.current_uses + 1;
          const updatedUsers = [...(p.redeemed_by_users || []), profile.id];
          return {
            ...p,
            current_uses: updatedUses,
            redeemed_by_users: updatedUsers,
            is_active: p.max_uses ? updatedUses < p.max_uses : p.is_active
          };
        }
        return p;
      });
      localStorage.setItem('ag_utopia_promo_codes', JSON.stringify(updatedPromos));
    }

    sounds.playClaim();
    confetti({ particleCount: 100, spread: 80 });

    let successMsg = `🎉 تم استرداد الكود بنجاح!`;
    if (rewardCoins > 0 && unlockedItem) {
      successMsg = `🎉 مبروك! حصلت على +${rewardCoins} كوينز وتم فتح: ${unlockedItem.name_ar}`;
    } else if (rewardCoins > 0) {
      successMsg = `🎉 مبروك! تم إضافة +${rewardCoins} عملة (Coins) لحسابك!`;
    } else if (unlockedItem) {
      successMsg = `🎉 مبروك! تم فتح: ${unlockedItem.name_ar}`;
    }

    return {
      success: true,
      message: successMsg,
      item: unlockedItem,
      coins: rewardCoins
    };
  };

  const updateProfileDetails = (
    newUsername?: string,
    newBio?: string
  ): { success: boolean; message: string } => {
    if (!profile) return { success: false, message: 'يرجى تسجيل الدخول أولاً' };

    let updatedUsername = profile.username;
    let updatedLastChange = profile.last_username_change_at;

    if (newUsername && newUsername.trim() !== profile.username) {
      const cleanName = newUsername.trim();

      // Check 14-day limit if not admin
      if (profile.role !== 'admin' && profile.last_username_change_at) {
        const lastChangeDate = new Date(profile.last_username_change_at).getTime();
        const now = Date.now();
        const diffDays = (now - lastChangeDate) / (1000 * 60 * 60 * 24);
        const cooldownDays = 14;

        if (diffDays < cooldownDays) {
          const remainingDays = Math.ceil(cooldownDays - diffDays);
          sounds.playWrong();
          return {
            success: false,
            message: `⏰ عذراً! لا يمكنك تغيير اسمك إلا مرة كل 14 يوماً (أسبوعين). المتبقي: ${remainingDays} يوم.`
          };
        }
      }

      if (cleanName.toUpperCase() === ADMIN_USERNAME.toUpperCase() && profile.role !== 'admin') {
        sounds.playWrong();
        return { success: false, message: 'اسم المستخدم AMOX مخصص للمشرف العام فقط!' };
      }

      updatedUsername = cleanName;
      updatedLastChange = new Date().toISOString();
    }

    const updatedProfile: Profile = {
      ...profile,
      username: updatedUsername,
      bio: newBio !== undefined ? newBio.trim() : profile.bio,
      last_username_change_at: updatedLastChange
    };

    setProfile(updatedProfile);
    saveSession(updatedProfile, inventory);

    // Update in registered users list
    try {
      const savedUsers: Profile[] = JSON.parse(localStorage.getItem('ag_utopia_registered_users') || '[]');
      const userIndex = savedUsers.findIndex(u => u.id === profile.id);
      if (userIndex >= 0) {
        savedUsers[userIndex] = updatedProfile;
      } else {
        savedUsers.push(updatedProfile);
      }
      localStorage.setItem('ag_utopia_registered_users', JSON.stringify(savedUsers));
    } catch (e) {}

    sounds.playVictory();
    return { success: true, message: '✅ تم حفظ تعديلات الملف الشخصي بنجاح!' };
  };

  const deleteUserFromDatabase = (userId: string): { success: boolean; message: string } => {
    if (!profile || profile.role !== 'admin') {
      return { success: false, message: 'صلاحية الأدمن مطلوبة لحذف المستخدمين' };
    }
    if (userId === profile.id || userId === 'usr_founder_amox') {
      return { success: false, message: 'لا يمكن حذف حساب الأدمن والمؤسس الرئيسي' };
    }

    try {
      // 1. Delete from local database
      const savedUsers: Profile[] = JSON.parse(localStorage.getItem('ag_utopia_registered_users') || '[]');
      const targetUser = savedUsers.find(u => u.id === userId);
      const filtered = savedUsers.filter(u => u.id !== userId);
      localStorage.setItem('ag_utopia_registered_users', JSON.stringify(filtered));

      // 2. Remove credentials
      if (targetUser) {
        const creds = JSON.parse(localStorage.getItem('ag_utopia_user_credentials') || '{}');
        delete creds[targetUser.username.toLowerCase()];
        localStorage.setItem('ag_utopia_user_credentials', JSON.stringify(creds));
      }

      // 3. Remove dedicated inventory
      const invMap = JSON.parse(localStorage.getItem('ag_utopia_user_inventories') || '{}');
      delete invMap[userId];
      localStorage.setItem('ag_utopia_user_inventories', JSON.stringify(invMap));

      // 4. Delete from Supabase profiles table
      try {
        supabase.from('profiles').delete().eq('id', userId).then(({ error }) => {
          if (error) console.warn('Supabase delete profile:', error.message);
        });
      } catch (e) {}

      // 5. Broadcast real-time deletion event
      realtimeService.broadcast('user_deleted', { userId });
      window.dispatchEvent(new CustomEvent('ag_utopia_users_updated'));

      sounds.playWrong();
      return { success: true, message: `🗑️ تم حذف حساب اللاعب [${targetUser?.username || userId}] نهائياً من قاعدة البيانات.` };
    } catch (e) {
      return { success: false, message: 'فشل حذف المستخدم من قاعدة البيانات' };
    }
  };

  const adminBanUser = (userId: string, isBanned: boolean, reason?: string): { success: boolean; message: string } => {
    if (!profile || profile.role !== 'admin') {
      return { success: false, message: 'صلاحية الأدمن مطلوبة لتنفيذ الحظر' };
    }
    if (userId === profile.id || userId === 'usr_founder_amox') {
      return { success: false, message: 'لا يمكن حظر حساب الأدمن والمؤسس' };
    }

    try {
      const savedUsers: Profile[] = JSON.parse(localStorage.getItem('ag_utopia_registered_users') || '[]');
      const userIdx = savedUsers.findIndex(u => u.id === userId);
      if (userIdx >= 0) {
        savedUsers[userIdx].is_banned = isBanned;
        savedUsers[userIdx].ban_reason = reason || '';
        localStorage.setItem('ag_utopia_registered_users', JSON.stringify(savedUsers));

        // Sync to Supabase
        try {
          supabase.from('profiles').update({
            is_banned: isBanned,
            ban_reason: reason || ''
          }).eq('id', userId).then();
        } catch (e) {}

        // Broadcast real-time ban event
        realtimeService.broadcast('user_banned', { userId, isBanned, reason });
        window.dispatchEvent(new CustomEvent('ag_utopia_users_updated'));
      }
      sounds.playClick();
      return { success: true, message: isBanned ? '🚫 تم حظر اللاعب بنجاح وإيقاف حسابه.' : '✅ تم إلغاء حظر اللاعب وتفعيل حسابه.' };
    } catch (e) {
      return { success: false, message: 'حدث خطأ أثناء تعديل حالة الحظر' };
    }
  };

  const adminModifyUser = (userId: string, updates: Partial<Profile>): { success: boolean; message: string } => {
    if (!profile || profile.role !== 'admin') {
      return { success: false, message: 'صلاحية الأدمن مطلوبة لتعديل بيانات اللاعبين' };
    }

    try {
      const savedUsers: Profile[] = JSON.parse(localStorage.getItem('ag_utopia_registered_users') || '[]');
      const userIdx = savedUsers.findIndex(u => u.id === userId);
      if (userIdx >= 0) {
        const updated = { ...savedUsers[userIdx], ...updates };
        savedUsers[userIdx] = updated;
        localStorage.setItem('ag_utopia_registered_users', JSON.stringify(savedUsers));

        // Sync to Supabase
        try {
          supabase.from('profiles').update(updates).eq('id', userId).then();
        } catch (e) {}

        // Broadcast real-time update
        realtimeService.broadcast('user_updated', updated);
        window.dispatchEvent(new CustomEvent('ag_utopia_users_updated'));

        // If active session is this user
        if (profile.id === userId) {
          setProfile(updated);
          localStorage.setItem('ag_utopia_session', JSON.stringify({ profile: updated, inventory }));
        }

        return { success: true, message: '✅ تم حفظ تعديلات بيانات اللاعب في قاعدة البيانات بنجاح!' };
      }
      return { success: false, message: 'اللاعب غير موجود في قاعدة البيانات' };
    } catch (e) {
      return { success: false, message: 'فشل تعديل بيانات اللاعب' };
    }
  };

  const adminGetUserInventory = (userId: string): string[] => {
    if (userId === profile?.id) {
      return inventory;
    }
    try {
      const savedUsers: Profile[] = JSON.parse(localStorage.getItem('ag_utopia_registered_users') || '[]');
      const user = savedUsers.find(u => u.id === userId);
      if (user?.inventory && user.inventory.length > 0) {
        return user.inventory;
      }
      const invMap = JSON.parse(localStorage.getItem('ag_utopia_user_inventories') || '{}');
      if (invMap[userId] && Array.isArray(invMap[userId])) {
        return invMap[userId];
      }
    } catch (e) {}
    return ['avatar_default', 'frame_default', 'tag_rookie', 'title_novice'];
  };

  const adminRemoveItemFromUser = (userId: string, itemId: string): { success: boolean; message: string } => {
    if (!profile || profile.role !== 'admin') {
      return { success: false, message: 'صلاحية المشرف العام مطلوبة لسحب العناصر' };
    }

    try {
      const defaultItems = ['avatar_default', 'frame_default', 'tag_rookie', 'title_novice'];
      if (defaultItems.includes(itemId)) {
        return { success: false, message: 'لا يمكن حذف العناصر الافتراضية الأساسية للنظام' };
      }

      // If modifying current session user
      if (userId === profile.id) {
        const updatedInv = inventory.filter(id => id !== itemId);
        setInventory(updatedInv);
        const updatedProfile = { ...profile };
        if (updatedProfile.active_avatar_id === itemId) updatedProfile.active_avatar_id = 'avatar_default';
        if (updatedProfile.active_frame_id === itemId) updatedProfile.active_frame_id = 'frame_default';
        if (updatedProfile.active_tag_id === itemId) updatedProfile.active_tag_id = 'tag_rookie';
        if (updatedProfile.active_title_id === itemId) updatedProfile.active_title_id = 'title_novice';
        if (updatedProfile.showcase_avatars) updatedProfile.showcase_avatars = updatedProfile.showcase_avatars.filter(id => id !== itemId);
        if (updatedProfile.showcase_frames) updatedProfile.showcase_frames = updatedProfile.showcase_frames.filter(id => id !== itemId);
        if (updatedProfile.showcase_tags) updatedProfile.showcase_tags = updatedProfile.showcase_tags.filter(id => id !== itemId);
        if (updatedProfile.showcase_titles) updatedProfile.showcase_titles = updatedProfile.showcase_titles.filter(id => id !== itemId);
        setProfile(updatedProfile);
        saveSession(updatedProfile, updatedInv);
      }

      // Update registered users list in database
      const savedUsers: Profile[] = JSON.parse(localStorage.getItem('ag_utopia_registered_users') || '[]');
      const userIdx = savedUsers.findIndex(u => u.id === userId);
      if (userIdx >= 0) {
        const target = savedUsers[userIdx];
        const userInv = (target.inventory || adminGetUserInventory(userId)).filter(id => id !== itemId);
        target.inventory = userInv;
        if (target.active_avatar_id === itemId) target.active_avatar_id = 'avatar_default';
        if (target.active_frame_id === itemId) target.active_frame_id = 'frame_default';
        if (target.active_tag_id === itemId) target.active_tag_id = 'tag_rookie';
        if (target.active_title_id === itemId) target.active_title_id = 'title_novice';
        if (target.showcase_avatars) target.showcase_avatars = target.showcase_avatars.filter(id => id !== itemId);
        if (target.showcase_frames) target.showcase_frames = target.showcase_frames.filter(id => id !== itemId);
        if (target.showcase_tags) target.showcase_tags = target.showcase_tags.filter(id => id !== itemId);
        if (target.showcase_titles) target.showcase_titles = target.showcase_titles.filter(id => id !== itemId);
        savedUsers[userIdx] = target;
        localStorage.setItem('ag_utopia_registered_users', JSON.stringify(savedUsers));

        // Sync to Supabase
        try {
          supabase.from('profiles').update({
            inventory: userInv,
            active_avatar_id: target.active_avatar_id,
            active_frame_id: target.active_frame_id,
            active_tag_id: target.active_tag_id,
            active_title_id: target.active_title_id
          }).eq('id', userId).then();
        } catch (e) {}

        realtimeService.broadcast('user_updated', target);
        window.dispatchEvent(new CustomEvent('ag_utopia_users_updated'));
      }

      // Update dedicated inventories storage map
      const invMap = JSON.parse(localStorage.getItem('ag_utopia_user_inventories') || '{}');
      invMap[userId] = (invMap[userId] || adminGetUserInventory(userId)).filter((id: string) => id !== itemId);
      localStorage.setItem('ag_utopia_user_inventories', JSON.stringify(invMap));

      sounds.playWrong();
      return { success: true, message: '🗑️ تم سحب وحذف العنصر من مخزون اللاعب بنجاح!' };
    } catch (e) {
      return { success: false, message: 'حدث خطأ أثناء سحب العنصر' };
    }
  };

  const adminAddItemToUser = (userId: string, itemId: string): { success: boolean; message: string } => {
    if (!profile || profile.role !== 'admin') {
      return { success: false, message: 'صلاحية المشرف العام مطلوبة لمنح العناصر' };
    }

    try {
      if (userId === profile.id) {
        if (!inventory.includes(itemId)) {
          const updatedInv = [...inventory, itemId];
          setInventory(updatedInv);
          saveSession(profile, updatedInv);
        }
      }

      const savedUsers: Profile[] = JSON.parse(localStorage.getItem('ag_utopia_registered_users') || '[]');
      const userIdx = savedUsers.findIndex(u => u.id === userId);
      if (userIdx >= 0) {
        const target = savedUsers[userIdx];
        const userInv = target.inventory || adminGetUserInventory(userId);
        if (!userInv.includes(itemId)) {
          target.inventory = [...userInv, itemId];
          savedUsers[userIdx] = target;
          localStorage.setItem('ag_utopia_registered_users', JSON.stringify(savedUsers));

          // Sync to Supabase
          try {
            supabase.from('profiles').update({ inventory: target.inventory }).eq('id', userId).then();
          } catch (e) {}

          realtimeService.broadcast('user_updated', target);
          window.dispatchEvent(new CustomEvent('ag_utopia_users_updated'));
        }
      }

      const invMap = JSON.parse(localStorage.getItem('ag_utopia_user_inventories') || '{}');
      const curInv = invMap[userId] || adminGetUserInventory(userId);
      if (!curInv.includes(itemId)) {
        invMap[userId] = [...curInv, itemId];
        localStorage.setItem('ag_utopia_user_inventories', JSON.stringify(invMap));
      }

      sounds.playVictory();
      return { success: true, message: '🎁 تم إضافة العنصر لمخزون اللاعب بنجاح!' };
    } catch (e) {
      return { success: false, message: 'حدث خطأ أثناء إضافة العنصر' };
    }
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
        recordMatchResult,
        equipItem,
        updateShowcases,
        updateStats,
        buyItem,
        redeemPromoCode,
        updateProfileDetails,
        deleteUserFromDatabase,
        adminBanUser,
        adminModifyUser,
        adminRemoveItemFromUser,
        adminAddItemToUser,
        adminGetUserInventory,
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
