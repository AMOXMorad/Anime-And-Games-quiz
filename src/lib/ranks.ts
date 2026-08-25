import { LocalizedString } from '../types';

export interface RankTier {
  id: string;
  minLevel: number;
  maxLevel: number;
  badge: string;
  name: LocalizedString;
  color: string;
  glow: string;
}

export const RANK_TIERS: RankTier[] = [
  {
    id: 'founder',
    minLevel: 999,
    maxLevel: 999,
    badge: '🔱',
    name: { ar: 'مؤسس يوتوبيا (المشرف العام)', en: 'The Grand Founder' },
    color: 'text-rose-400',
    glow: 'shadow-[0_0_20px_rgba(244,63,94,0.8)]'
  },
  {
    id: 'ultimate_king',
    minLevel: 100,
    maxLevel: 998,
    badge: '🌌',
    name: { ar: 'سلطان العوالم الأعظم', en: 'The Ultimate King of the Universe' },
    color: 'text-indigo-400',
    glow: 'shadow-[0_0_20px_rgba(99,102,241,0.8)]'
  },
  {
    id: 'supreme_sovereign',
    minLevel: 75,
    maxLevel: 99,
    badge: '👑',
    name: { ar: 'الحاكم العظيم (كاجي)', en: 'The Supreme Sovereign' },
    color: 'text-amber-400',
    glow: 'shadow-[0_0_15px_rgba(245,158,11,0.6)]'
  },
  {
    id: 'vanguard',
    minLevel: 50,
    maxLevel: 74,
    badge: '💎',
    name: { ar: 'طليعة الظلال (أنبو)', en: 'Shadow Elite Vanguard' },
    color: 'text-cyan-400',
    glow: 'shadow-[0_0_15px_rgba(6,182,212,0.6)]'
  },
  {
    id: 'elite_master',
    minLevel: 25,
    maxLevel: 49,
    badge: '🥇',
    name: { ar: 'نخبة الشينوبي (جونين)', en: 'Elite Master (Jonin)' },
    color: 'text-yellow-400',
    glow: 'shadow-[0_0_12px_rgba(234,179,8,0.5)]'
  },
  {
    id: 'challenger',
    minLevel: 10,
    maxLevel: 24,
    badge: '🥈',
    name: { ar: 'متحدي صاعد (تشونين)', en: 'Challenger (Chunin)' },
    color: 'text-slate-300',
    glow: 'shadow-[0_0_10px_rgba(203,213,225,0.4)]'
  },
  {
    id: 'apprentice',
    minLevel: 1,
    maxLevel: 9,
    badge: '🥉',
    name: { ar: 'مبتدئ (جينين)', en: 'Apprentice (Genin)' },
    color: 'text-amber-700',
    glow: 'shadow-[0_0_8px_rgba(180,83,9,0.3)]'
  }
];

export function getRankTier(level: number, role?: string): RankTier {
  if (role === 'admin') {
    return RANK_TIERS[0]; // The Grand Founder
  }
  for (const tier of RANK_TIERS.slice(1)) {
    if (level >= tier.minLevel && level <= tier.maxLevel) {
      return tier;
    }
  }
  return RANK_TIERS[RANK_TIERS.length - 1];
}

// Level calculation curve: XP needed = 100 * level^1.35
export function getRequiredXpForLevel(level: number): number {
  if (level <= 1) return 0;
  return Math.floor(100 * Math.pow(level, 1.35));
}

export function calculateLevel(xp: number): { level: number; currentLevelXp: number; nextLevelXp: number; progress: number } {
  let level = 1;
  while (true) {
    const nextXp = getRequiredXpForLevel(level + 1);
    if (xp < nextXp) {
      const currentBase = getRequiredXpForLevel(level);
      const needed = nextXp - currentBase;
      const earned = xp - currentBase;
      const progress = Math.min(100, Math.max(0, Math.floor((earned / needed) * 100)));
      return {
        level,
        currentLevelXp: earned,
        nextLevelXp: needed,
        progress
      };
    }
    level++;
    if (level > 200) break; // Safeguard
  }
  return { level: 200, currentLevelXp: 1000, nextLevelXp: 1000, progress: 100 };
}
