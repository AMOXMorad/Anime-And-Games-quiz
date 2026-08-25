export type Language = 'ar' | 'en';

export type WorldCategory = 'anime' | 'games';

export type Difficulty = 'easy' | 'medium' | 'hard';

export type GameModeType = 'who_am_i' | 'trivia' | 'true_false' | 'super_challenge';

export interface LocalizedString {
  ar: string;
  en: string;
}

export interface Character {
  id: string;
  name: LocalizedString;
  avatar: string; // High-res transparent render
  gender: 'male' | 'female' | 'other';
  role: LocalizedString; // e.g. Hokage, Shinobi, Spirit Knight, Maid, Witch
  powerType: LocalizedString; // e.g. Ninjutsu/Sage, Yin Magic/Sword, Curse
  affiliation: LocalizedString; // e.g. Hidden Leaf Village, Roswaal Mansion, Lugnica
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
  image?: string; // High quality scene or character shot
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
  category: WorldCategory;
  tagline: LocalizedString;
  description: LocalizedString;
  icon: string;
  banner: string; // Official high-res key visual
  themeColor: string; // Tailored accent color (e.g. #f97316 for Naruto, #a855f7 for Re:Zero)
  accentGlow: string;
  characters: Character[];
  triviaQuestions: TriviaQuestion[];
  trueFalseQuestions: TrueFalseQuestion[];
}

export type ItemRarity = 'common' | 'rare' | 'epic' | 'legendary';
export type ItemType = 'frame' | 'tag' | 'title';

export interface StoreItem {
  id: string;
  type: ItemType;
  name_ar: string;
  name_en: string;
  description_ar: string;
  description_en: string;
  price: number;
  rarity: ItemRarity;
  asset_url?: string;
  css_style?: {
    border?: string;
    bg?: string;
    text?: string;
    animation?: string;
    glow?: string;
  };
  is_active: boolean;
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
  is_guest: boolean;
  role: 'user' | 'admin' | 'moderator';
  is_banned: boolean;
  ban_reason?: string;
  coins: number;
  xp: number;
  level: number;
  active_frame_id: string;
  active_tag_id: string;
  active_title_id: string;
  showcase_titles: string[]; // up to 5
  showcase_tags: string[];   // up to 5
  showcase_frames: string[]; // up to 5
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
  is_claimed: boolean;
  is_read: boolean;
  created_at: string;
  gift_item?: StoreItem;
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
