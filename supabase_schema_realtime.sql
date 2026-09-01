-- =========================================================
-- AG UTOPIA — COMPREHENSIVE SUPABASE REALTIME SQL SCHEMA
-- Run this in your Supabase SQL Editor to enable Realtime!
-- =========================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create PROFILES Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL,
    tag TEXT NOT NULL,
    bio TEXT DEFAULT '',
    last_username_change_at TIMESTAMPTZ,
    is_guest BOOLEAN DEFAULT FALSE,
    role TEXT DEFAULT 'user',
    is_banned BOOLEAN DEFAULT FALSE,
    ban_reason TEXT DEFAULT '',
    coins BIGINT DEFAULT 1000,
    xp BIGINT DEFAULT 0,
    level INTEGER DEFAULT 1,
    avatar_url TEXT DEFAULT '',
    active_avatar_id TEXT DEFAULT 'avatar_default',
    active_frame_id TEXT DEFAULT 'frame_default',
    active_tag_id TEXT DEFAULT 'tag_rookie',
    active_title_id TEXT DEFAULT 'title_novice',
    showcase_titles JSONB DEFAULT '[]'::jsonb,
    showcase_tags JSONB DEFAULT '[]'::jsonb,
    showcase_frames JSONB DEFAULT '[]'::jsonb,
    showcase_avatars JSONB DEFAULT '[]'::jsonb,
    inventory JSONB DEFAULT '[]'::jsonb,
    redeemed_codes JSONB DEFAULT '[]'::jsonb,
    stats JSONB DEFAULT '{"totalMatches":0,"wins":0,"correctAnswers":0,"streak":0,"whoAmIWins":0,"triviaWins":0,"superChallengeWins":0}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create GAME_ROOMS Table (Live 1v1 Matches & Rooms)
CREATE TABLE IF NOT EXISTS public.game_rooms (
    id TEXT PRIMARY KEY,
    room_code TEXT UNIQUE NOT NULL,
    host_id TEXT NOT NULL,
    guest_id TEXT,
    world_id TEXT NOT NULL,
    difficulty TEXT DEFAULT 'medium',
    status TEXT DEFAULT 'waiting', -- 'waiting', 'in_progress', 'finished'
    game_state JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create USER_NOTIFICATIONS Table (Admin Broadcasts & Gifts)
CREATE TABLE IF NOT EXISTS public.notifications (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    user_id TEXT NOT NULL, -- 'ALL' for broadcasts or specific user ID
    sender_admin_id TEXT DEFAULT 'AMOX',
    title_ar TEXT NOT NULL,
    title_en TEXT DEFAULT '',
    message_ar TEXT NOT NULL,
    message_en TEXT DEFAULT '',
    gift_coins BIGINT DEFAULT 0,
    gift_item_id TEXT,
    is_claimed BOOLEAN DEFAULT FALSE,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create CHAT_MESSAGES Table (1-on-1 and In-Game Chat)
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    sender_id TEXT NOT NULL,
    receiver_id TEXT NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Create SUGGESTIONS Table (Community Ideas & Upvotes)
CREATE TABLE IF NOT EXISTS public.suggestions (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    user_id TEXT NOT NULL,
    category TEXT NOT NULL, -- 'world', 'mode', 'shop', 'feature'
    title TEXT NOT NULL,
    details TEXT NOT NULL,
    upvotes INTEGER DEFAULT 0,
    status TEXT DEFAULT 'under_review', -- 'under_review', 'planned', 'implemented', 'declined'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Create REPORTS Table (Player & Bug Reports)
CREATE TABLE IF NOT EXISTS public.reports (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    reporter_id TEXT NOT NULL,
    reported_user_id TEXT,
    type TEXT NOT NULL, -- 'player_report', 'bug_report', 'question_error'
    title TEXT NOT NULL,
    details TEXT NOT NULL,
    status TEXT DEFAULT 'open', -- 'open', 'investigating', 'resolved', 'dismissed'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Create STORE_ITEMS Table
CREATE TABLE IF NOT EXISTS public.store_items (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL, -- 'avatar', 'frame', 'tag', 'title'
    name_ar TEXT NOT NULL,
    name_en TEXT NOT NULL,
    description_ar TEXT DEFAULT '',
    description_en TEXT DEFAULT '',
    price INTEGER DEFAULT 100,
    rarity TEXT DEFAULT 'common',
    avatar_category TEXT DEFAULT 'general',
    asset_url TEXT DEFAULT '',
    frame_config JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Create PROMO_CODES Table
CREATE TABLE IF NOT EXISTS public.promo_codes (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    reward_coins INTEGER DEFAULT 0,
    reward_item_id TEXT,
    description_ar TEXT DEFAULT '',
    description_en TEXT DEFAULT '',
    expiry_type TEXT DEFAULT 'permanent',
    expires_at TIMESTAMPTZ,
    max_uses INTEGER,
    current_uses INTEGER DEFAULT 0,
    redeemed_by_users JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================================
-- ENABLE ROW LEVEL SECURITY & OPEN POLICIES FOR WEB APP
-- =========================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;

-- Allow Public Access (Anon / Authenticated)
DO $$
BEGIN
    DROP POLICY IF EXISTS "Allow public read access on profiles" ON public.profiles;
    DROP POLICY IF EXISTS "Allow public insert/update on profiles" ON public.profiles;
    CREATE POLICY "Allow public read access on profiles" ON public.profiles FOR SELECT USING (true);
    CREATE POLICY "Allow public insert/update on profiles" ON public.profiles FOR ALL USING (true);

    DROP POLICY IF EXISTS "Allow public access on game_rooms" ON public.game_rooms;
    CREATE POLICY "Allow public access on game_rooms" ON public.game_rooms FOR ALL USING (true);

    DROP POLICY IF EXISTS "Allow public access on notifications" ON public.notifications;
    CREATE POLICY "Allow public access on notifications" ON public.notifications FOR ALL USING (true);

    DROP POLICY IF EXISTS "Allow public access on chat_messages" ON public.chat_messages;
    CREATE POLICY "Allow public access on chat_messages" ON public.chat_messages FOR ALL USING (true);

    DROP POLICY IF EXISTS "Allow public access on suggestions" ON public.suggestions;
    CREATE POLICY "Allow public access on suggestions" ON public.suggestions FOR ALL USING (true);

    DROP POLICY IF EXISTS "Allow public access on reports" ON public.reports;
    CREATE POLICY "Allow public access on reports" ON public.reports FOR ALL USING (true);

    DROP POLICY IF EXISTS "Allow public access on store_items" ON public.store_items;
    CREATE POLICY "Allow public access on store_items" ON public.store_items FOR ALL USING (true);

    DROP POLICY IF EXISTS "Allow public access on promo_codes" ON public.promo_codes;
    CREATE POLICY "Allow public access on promo_codes" ON public.promo_codes FOR ALL USING (true);
END $$;

-- =========================================================
-- ENABLE SUPABASE REALTIME REPLICATION (CRITICAL STEP)
-- =========================================================

-- Set REPLICA IDENTITY FULL for complete real-time payload streaming
ALTER TABLE public.profiles REPLICA IDENTITY FULL;
ALTER TABLE public.game_rooms REPLICA IDENTITY FULL;
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER TABLE public.chat_messages REPLICA IDENTITY FULL;
ALTER TABLE public.suggestions REPLICA IDENTITY FULL;
ALTER TABLE public.reports REPLICA IDENTITY FULL;
ALTER TABLE public.store_items REPLICA IDENTITY FULL;
ALTER TABLE public.promo_codes REPLICA IDENTITY FULL;

-- Add tables to the supabase_realtime publication
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        CREATE PUBLICATION supabase_realtime;
    END IF;
END $$;

ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.suggestions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.reports;
ALTER PUBLICATION supabase_realtime ADD TABLE public.store_items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.promo_codes;

-- Confirmation Output
SELECT '🎉 Supabase Realtime is now fully activated for AG Utopia tables!' as status;
