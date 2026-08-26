export type Language = 'ar' | 'en';

export type WorldType = 'anime' | 'games' | 'superheroes';

export type Difficulty = 'easy' | 'medium' | 'hard';

export type GameModeType = 'who_am_i' | 'trivia' | 'true_false' | 'super_challenge';

export interface LocalizedString {
  ar: string;
  en: string;
}

export interface Character {
  id: string;
  name: LocalizedString;
  avatar: string; // High-res transparent render or AI portrait
  gender: 'male' | 'female' | 'other';
  role: LocalizedString;
  powerType: LocalizedString;
  affiliation: LocalizedString;
  clues: {
    easy: LocalizedString[];
    medium: LocalizedString[];
    hard: LocalizedString[];
  };
  quote?: LocalizedString;
}

export interface TriviaQuestion {
  id: string;
  difficulty: Difficulty;
  question: LocalizedString;
  options: [LocalizedString, LocalizedString, LocalizedString, LocalizedString];
  correctIndex: number;
  explanation?: LocalizedString;
  image?: string;
}

export interface TrueFalseQuestion {
  id: string;
  difficulty: Difficulty;
  statement: LocalizedString;
  isCorrect: boolean;
  explanation?: LocalizedString;
  image?: string;
}

export interface World {
  id: string;
  name: LocalizedString;
  category: WorldType;
  tagline: LocalizedString;
  description: LocalizedString;
  icon: string;
  banner: string;
  themeColor: string;
  accentGlow: string;
  characters: Character[];
  triviaQuestions: TriviaQuestion[];
  trueFalseQuestions: TrueFalseQuestion[];
  isCustom?: boolean;
  created_at?: string;
}

export type ItemRarity = 'common' | 'rare' | 'epic' | 'legendary';
export type ItemType = 'frame' | 'tag' | 'title' | 'avatar';
export type UnlockType = 'store' | 'code' | 'level' | 'gift';

export interface FrameConfig {
  scale?: number; // scale multiplier for the frame PNG overlay, e.g. 1.35
  avatar_scale?: number; // scale multiplier for the inner avatar circle, e.g. 0.85
  offset_x?: number; // px shift X, e.g. 0
  offset_y?: number; // px shift Y, e.g. 0
}

export type WorldCategory = 
  | 'all' 
  | 'naruto' 
  | 'rezero' 
  | 'general';

export interface WorldCategoryMeta {
  id: WorldCategory;
  name_ar: string;
  name_en: string;
  icon: string;
  badge_color: string;
}

export const WORLD_CATEGORIES: WorldCategoryMeta[] = [
  { id: 'all', name_ar: 'الكل (جميع العوالم)', name_en: 'All Worlds', icon: '🌐', badge_color: 'border-slate-600 bg-slate-900 text-slate-300' },
  { id: 'naruto', name_ar: 'ناروتو شيبودن', name_en: 'Naruto Shippuden', icon: '🍥', badge_color: 'border-orange-500/50 bg-orange-950/60 text-orange-300' },
  { id: 'rezero', name_ar: 'ريزيرو (Re:Zero)', name_en: 'Re:Zero', icon: '🍎', badge_color: 'border-purple-500/50 bg-purple-950/60 text-purple-300' },
  { id: 'general', name_ar: 'أساطير يوتوبيا (عام)', name_en: 'Utopia Legends', icon: '🔱', badge_color: 'border-rose-500/50 bg-rose-950/60 text-rose-300' },
];

export interface StoreItem {
  id: string;
  type: ItemType;
  name_ar: string;
  name_en: string;
  description_ar: string;
  description_en: string;
  price: number;
  rarity: ItemRarity;
  asset_url?: string; // Image URL / PNG or emoji
  world_category?: WorldCategory;
  avatar_category?: 'naruto' | 'rezero' | 'games' | 'chaos';
  unlock_type?: UnlockType;
  required_level?: number;
  redeem_code?: string;
  target_user_tag?: string;
  frame_config?: FrameConfig;
  css_style?: {
    border?: string;
    bg?: string;
    text?: string;
    animation?: string;
    glow?: string;
  };
  is_active: boolean;
}

export type PromoExpiryType = 'permanent' | 'date_limited' | 'uses_limited';

export interface PromoCode {
  id: string;
  code: string; // e.g. "UTOPIA2026", "AMOX_VIP"
  reward_coins: number;
  reward_item_id?: string;
  reward_item?: StoreItem;
  description_ar: string;
  description_en: string;
  expiry_type: PromoExpiryType;
  expires_at?: string; // e.g. "2026-12-31"
  max_uses?: number; // Total max redemptions (e.g. 1 for single-use, 10 for limited batch)
  current_uses: number; // Current number of times redeemed
  redeemed_by_users: string[]; // List of user IDs or tags who redeemed
  is_active: boolean;
  created_at: string;
}

export interface UserStats {
  totalMatches: number;
  wins: number;
  correctAnswers: number;
  streak: number;
  whoAmIWins: number;
  triviaWins: number;
  superChallengeWins: number;
}

export interface Profile {
  id: string;
  username: string;
  tag: string; // e.g. "1042"
  bio?: string; // Player self description
  last_username_change_at?: string; // ISO date of last name change (14 days cooldown)
  is_guest: boolean;
  role: 'user' | 'admin' | 'moderator';
  is_banned: boolean;
  ban_reason?: string;
  coins: number;
  xp: number;
  level: number;
  avatar_url?: string;
  active_avatar_id?: string;
  active_frame_id: string;
  active_tag_id: string;
  active_title_id: string;
  showcase_titles: string[]; // up to 5
  showcase_tags: string[];   // up to 5
  showcase_frames: string[]; // up to 5
  showcase_avatars?: string[]; // up to 5
  inventory?: string[]; // list of owned store items
  redeemed_codes?: string[]; // Promo codes redeemed by this user
  stats: UserStats;
  created_at: string;
}

export interface Friendship {
  id: string;
  user_id: string;
  friend_id: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
  friend_profile?: Profile;
}

export interface ChatMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface Report {
  id: string;
  reporter_id: string;
  reported_user_id?: string;
  type: 'player_report' | 'bug_report' | 'question_error';
  title: string;
  details: string;
  status: 'open' | 'investigating' | 'resolved' | 'dismissed';
  created_at: string;
  reporter_profile?: Profile;
  reported_profile?: Profile;
}

export interface Suggestion {
  id: string;
  user_id: string;
  category: 'world' | 'mode' | 'shop' | 'feature';
  title: string;
  details: string;
  upvotes: number;
  status: 'under_review' | 'planned' | 'implemented' | 'declined';
  created_at: string;
  user_profile?: Profile;
  has_voted?: boolean;
}

export interface UserNotification {
  id: string;
  user_id: string;
  sender_admin_id?: string;
  title_ar: string;
  title_en: string;
  message_ar: string;
  message_en: string;
  gift_coins: number;
  gift_item_id?: string;
  gift_item?: StoreItem;
  is_claimed: boolean;
  is_read: boolean;
  created_at: string;
}

export interface GameRoom {
  id: string;
  room_code: string;
  host_id: string;
  guest_id?: string;
  world_id: string;
  difficulty: Difficulty;
  status: 'waiting' | 'in_progress' | 'finished';
  game_state: {
    currentRound?: number;
    totalRounds?: number;
    roundType?: 'true_false' | 'trivia' | 'who_am_i';
    questionIndex?: number;
    hostScore?: number;
    guestScore?: number;
    hostCharacterId?: string;
    guestCharacterId?: string;
    activeQuestion?: any;
    winnerId?: string;
  };
  created_at: string;
  host_profile?: Profile;
  guest_profile?: Profile;
}
