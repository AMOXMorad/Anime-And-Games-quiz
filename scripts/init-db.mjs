import pg from 'pg';
const { Client } = pg;

const connectionString = 'postgresql://postgres.wlgecqqddvoamufwtwkf:LshyN5%40%21Mda%2BCe6@aws-0-eu-west-2.pooler.supabase.com:6543/postgres';

const schemaSQL = `
-- 1. Profiles Table (Supports both registered and cloud guests)
CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL,
  tag TEXT NOT NULL,
  is_guest BOOLEAN DEFAULT FALSE,
  role TEXT DEFAULT 'user', -- 'user' | 'admin' | 'moderator'
  is_banned BOOLEAN DEFAULT FALSE,
  ban_reason TEXT,
  coins INT DEFAULT 250,
  xp INT DEFAULT 0,
  level INT DEFAULT 1,
  active_frame_id TEXT DEFAULT 'frame_default',
  active_tag_id TEXT DEFAULT 'tag_rookie',
  active_title_id TEXT DEFAULT 'title_novice',
  showcase_titles TEXT[] DEFAULT ARRAY['title_novice']::TEXT[],
  showcase_tags TEXT[] DEFAULT ARRAY['tag_rookie']::TEXT[],
  showcase_frames TEXT[] DEFAULT ARRAY['frame_default']::TEXT[],
  stats JSONB DEFAULT '{"totalMatches":0,"wins":0,"correctAnswers":0,"streak":0,"whoAmIWins":0,"triviaWins":0,"superChallengeWins":0}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Store Items Table
CREATE TABLE IF NOT EXISTS store_items (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL, -- 'frame' | 'tag' | 'title'
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  description_ar TEXT,
  description_en TEXT,
  price INT NOT NULL,
  rarity TEXT DEFAULT 'rare', -- 'common' | 'rare' | 'epic' | 'legendary'
  asset_url TEXT,
  css_style JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. User Inventory Table
CREATE TABLE IF NOT EXISTS user_inventory (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  item_id TEXT NOT NULL REFERENCES store_items(id) ON DELETE CASCADE,
  purchased_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, item_id)
);

-- 4. Friendships Table
CREATE TABLE IF NOT EXISTS friendships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  friend_id TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending' | 'accepted' | 'declined'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, friend_id)
);

-- 5. Chat Messages Table (Auto purged if older than 3 days)
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id TEXT NOT NULL,
  receiver_id TEXT NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Reports & Bug Tracking Table
CREATE TABLE IF NOT EXISTS reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_id TEXT NOT NULL,
  reported_user_id TEXT,
  type TEXT NOT NULL, -- 'player_report' | 'bug_report' | 'question_error'
  title TEXT NOT NULL,
  details TEXT NOT NULL,
  status TEXT DEFAULT 'open', -- 'open' | 'investigating' | 'resolved' | 'dismissed'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Community Suggestions Table
CREATE TABLE IF NOT EXISTS suggestions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  category TEXT NOT NULL, -- 'world' | 'mode' | 'shop' | 'feature'
  title TEXT NOT NULL,
  details TEXT NOT NULL,
  upvotes INT DEFAULT 1,
  status TEXT DEFAULT 'under_review', -- 'under_review' | 'planned' | 'implemented' | 'declined'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Suggestion Votes Table
CREATE TABLE IF NOT EXISTS suggestion_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  suggestion_id UUID NOT NULL REFERENCES suggestions(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(suggestion_id, user_id)
);

-- 9. User Notifications & Admin Gifts Table
CREATE TABLE IF NOT EXISTS user_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  sender_admin_id TEXT,
  title_ar TEXT NOT NULL,
  title_en TEXT NOT NULL,
  message_ar TEXT NOT NULL,
  message_en TEXT NOT NULL,
  gift_coins INT DEFAULT 0,
  gift_item_id TEXT REFERENCES store_items(id) ON DELETE SET NULL,
  is_claimed BOOLEAN DEFAULT FALSE,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. 1v1 Super Battle Game Rooms Table
CREATE TABLE IF NOT EXISTS game_rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_code TEXT UNIQUE NOT NULL,
  host_id TEXT NOT NULL,
  guest_id TEXT,
  world_id TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  status TEXT DEFAULT 'waiting', -- 'waiting' | 'in_progress' | 'finished'
  game_state JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Function for Auto-deleting Chat messages older than 3 days
CREATE OR REPLACE FUNCTION purge_old_chat_messages()
RETURNS void AS $$
BEGIN
  DELETE FROM chat_messages WHERE created_at < NOW() - INTERVAL '3 days';
END;
$$ LANGUAGE plpgsql;
`;

const seedStoreItemsSQL = `
INSERT INTO store_items (id, type, name_ar, name_en, description_ar, description_en, price, rarity, asset_url, css_style)
VALUES
  -- Frames
  ('frame_default', 'frame', 'إطار البداية', 'Initiate Frame', 'الإطار الافتراضي لكل متحدي في يوتوبيا', 'Default frame for every challenger in Utopia', 0, 'common', '', '{"border": "border-slate-600"}'),
  ('frame_sharingan', 'frame', 'إطار الشارينغان الناري', 'Flame Sharingan Frame', 'إطار متوهج بقوة وعراقة الشارينغان', 'Blazing frame radiating the power of the Sharingan', 300, 'epic', '', '{"border": "border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.7)] ring-2 ring-red-400"}'),
  ('frame_curse_flame', 'frame', 'هالة عودة الموت البنفسجية', 'Re:Zero Witch Aura Frame', 'هالة ساحرة ومظلمة تفيض بقوة غامضة', 'Dark bewitching aura filled with mysterious miasma', 350, 'epic', '', '{"border": "border-purple-500 shadow-[0_0_18px_rgba(168,85,247,0.75)] ring-2 ring-fuchsia-400"}'),
  ('frame_cyber_neon', 'frame', 'إطار السايبربانك النيون', 'Cyber Neon Frame', 'تصميم رقمي مستقبلي لعشاق ألعاب الخيال العلمي', 'Futuristic digital neon border for sci-fi enthusiasts', 250, 'rare', '', '{"border": "border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.7)] ring-2 ring-teal-300"}'),
  ('frame_gold_royalty', 'frame', 'الإطار الذهبي الملكي', 'Golden Sovereign Frame', 'إطار ذهبي نقي مخصص لكبار المتصدرين', 'Pure gold frame forged for supreme champions', 500, 'legendary', '', '{"border": "border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.8)] ring-2 ring-yellow-200"}'),
  ('frame_chaos_vortex', 'frame', 'إطار دوامة الفوضى الكونية', 'Chaos Cosmic Frame', 'إطار كوني ناصع ينبض بطاقة الفوضى المطلقة', 'Cosmic pulsating border bursting with chaotic energy', 750, 'legendary', '', '{"border": "border-indigo-400 shadow-[0_0_25px_rgba(99,102,241,0.85)] ring-2 ring-sky-300 animate-pulse"}'),
  ('frame_founder_exclusive', 'frame', 'إطار مؤسس يوتوبيا', 'The Grand Founder Frame', 'إطار فخم وحصري للأدمن والمؤسس', 'Exclusive leadership aura for the Founder and Admin', 9999, 'legendary', '', '{"border": "border-rose-500 shadow-[0_0_30px_rgba(244,63,94,0.9)] ring-4 ring-amber-300"}'),

  -- Name Tags / Badges
  ('tag_rookie', 'tag', 'شارة المبتدئ', 'Rookie Tag', 'شارة البداية', 'Starting challenger badge', 0, 'common', '🔰', '{}'),
  ('tag_shinobi_flame', 'tag', 'لهب الشينوبي', 'Shinobi Flame', 'تاج لهب النار لعشاق عالم النينجا', 'Fire flame tag for the ninja realm lovers', 150, 'rare', '🔥', '{}'),
  ('tag_lightning_godspeed', 'tag', 'صاعقة البرق', 'Thunder Lightning', 'شارة السرعة الخاطفة', 'Godspeed thunder badge', 200, 'rare', '⚡', '{}'),
  ('tag_rezero_apple', 'tag', 'تفاحة الأببا', 'Appa of Lugnica', 'رمز تجار العاصمة في ريزيرو', 'The iconic Appa fruit symbol from Lugnica', 180, 'rare', '🍎', '{}'),
  ('tag_king_crown', 'tag', 'تاج الملك الفاخر', 'Sovereign Crown', 'تاج ذهبي ملكي يوضع بجانب الاسم', 'Royal golden crown placed beside your name', 400, 'epic', '👑', '{}'),
  ('tag_cosmic_star', 'tag', 'نجم الفوضى اللامع', 'Cosmic Chaos Star', 'شارة الفوضى الكونية المشعة', 'Radiant cosmic star badge', 500, 'legendary', '🌟', '{}'),
  ('tag_founder_trident', 'tag', 'شارة المشرف العام', 'Founder Trident', 'شارة التاج والصولجان الملكي للمؤسس', 'Founder insignia & royal trident', 9999, 'legendary', '🔱', '{}'),

  -- Titles
  ('title_novice', 'title', 'متحدي يوتوبيا', 'Utopia Challenger', 'اللقب الأولي لكل لاعب جديد', 'Initial title for every newcomer', 0, 'common', '', '{}'),
  ('title_ninja_leaf', 'title', 'نينجا كونوها', 'Leaf Village Ninja', 'أحد شينوبي قرية الورق المخفية', 'A proud shinobi of the Hidden Leaf', 100, 'common', '', '{}'),
  ('title_death_return', 'title', 'العائد من الموت', 'Return by Death', 'من يتحدى المصير مراراً وتكراراً', 'The one who defies fate again and again', 250, 'rare', '', '{}'),
  ('title_king_shinobi', 'title', 'ملك الشينوبي الحقيقي', 'The True King of Shinobi', 'سيد ومحترف عالم ناروتو بلا منازع', 'Undisputed master of the Naruto universe', 600, 'epic', '', '{}'),
  ('title_king_rezero', 'title', 'ملك ريزيرو الحقيقي', 'The True King of Re:Zero', 'سيد ومحترف عالم ريزيرو وكافة خفاياه', 'Undisputed master of the Re:Zero universe', 600, 'epic', '', '{}'),
  ('title_king_gaming', 'title', 'ملك الجيمنج الحقيقي', 'The True King of Gaming', 'بطل عوالم الألعاب التنافسية', 'Supreme champion of the gaming realms', 600, 'epic', '', '{}'),
  ('title_ultimate_universe', 'title', 'سلطان العوالم الأعظم', 'The Ultimate King of the Universe', 'اللقب الأسطوري الأعلى لمن يتقن عالم الفوضى الكوني', 'The highest mythical title for the master of Chaos Realm', 1200, 'legendary', '', '{}'),
  ('title_founder', 'title', 'مؤسس يوتوبيا', 'The Grand Founder', 'اللقب الحصري لمنشئ ومطور المنصة', 'Exclusive title for the Platform Founder & Admin', 9999, 'legendary', '', '{}')
ON CONFLICT (id) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  description_ar = EXCLUDED.description_ar,
  description_en = EXCLUDED.description_en,
  price = EXCLUDED.price,
  rarity = EXCLUDED.rarity,
  asset_url = EXCLUDED.asset_url,
  css_style = EXCLUDED.css_style;
`;

async function main() {
  console.log('Connecting to Supabase PostgreSQL database via pooler...');
  const client = new Client({ connectionString });
  
  try {
    await client.connect();
    console.log('✅ Connected successfully to Supabase DB!');

    console.log('Applying Schema Migration...');
    await client.query(schemaSQL);
    console.log('✅ Schema tables, constraints, and functions created successfully!');

    console.log('Seeding initial Store Items...');
    await client.query(seedStoreItemsSQL);
    console.log('✅ Store items seeded successfully!');

    console.log('\n🎉 AG Utopia Database is 100% READY!');
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
