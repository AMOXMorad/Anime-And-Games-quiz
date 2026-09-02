import pg from 'pg';
const { Client } = pg;

const connectionString = 'postgresql://postgres.wlgecqqddvoamufwtwkf:LshyN5%40%21Mda%2BCe6@aws-0-eu-west-2.pooler.supabase.com:6543/postgres';

const createTableSQL = `
-- 1. Create custom_worlds Table
CREATE TABLE IF NOT EXISTS public.custom_worlds (
    id TEXT PRIMARY KEY,
    name JSONB NOT NULL,
    category TEXT DEFAULT 'anime',
    tagline JSONB NOT NULL,
    description JSONB NOT NULL,
    icon TEXT DEFAULT '⚔️',
    banner TEXT NOT NULL,
    theme_color TEXT DEFAULT '#06b6d4',
    accent_glow TEXT DEFAULT 'rgba(6,182,212,0.4)',
    characters JSONB DEFAULT '[]'::jsonb,
    trivia_questions JSONB DEFAULT '[]'::jsonb,
    true_false_questions JSONB DEFAULT '[]'::jsonb,
    is_custom BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable RLS
ALTER TABLE public.custom_worlds ENABLE ROW LEVEL SECURITY;

-- 3. Open Policy for public read & write
DO $$
BEGIN
    DROP POLICY IF EXISTS "Allow public read custom_worlds" ON public.custom_worlds;
    DROP POLICY IF EXISTS "Allow public write custom_worlds" ON public.custom_worlds;
    CREATE POLICY "Allow public read custom_worlds" ON public.custom_worlds FOR SELECT USING (true);
    CREATE POLICY "Allow public write custom_worlds" ON public.custom_worlds FOR ALL USING (true);
END $$;

-- 4. Enable Realtime for custom_worlds
DO $$
BEGIN
    EXECUTE 'ALTER TABLE public.custom_worlds REPLICA IDENTITY FULL;';
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND schemaname = 'public' 
        AND tablename = 'custom_worlds'
    ) THEN
        EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.custom_worlds;';
    END IF;
END $$;
`;

async function run() {
  const client = new Client({ connectionString, connectionTimeoutMillis: 8000 });
  try {
    console.log('Connecting to Supabase Postgres...');
    await client.connect();
    console.log('Running custom_worlds table migration...');
    await client.query(createTableSQL);
    console.log('🎉 Successfully created custom_worlds table and enabled Realtime in Supabase!');
  } catch (err) {
    console.error('Error migrating custom_worlds table:', err);
  } finally {
    await client.end();
  }
}

run();
