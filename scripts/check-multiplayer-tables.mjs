import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://wlgecqqddvoamufwtwkf.supabase.co';
const SUPABASE_KEY = 'sb_publishable_CdOZXNxUUo88HQszdA9sgw_Myb9EowU';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkTables() {
  console.log('Checking game_rooms table in Supabase...');
  const { data, error } = await supabase.from('game_rooms').select('count').limit(1);
  if (error) {
    console.log('game_rooms table does not exist or error:', error.message);
  } else {
    console.log('✅ game_rooms table exists!');
  }

  console.log('Checking match_history table in Supabase...');
  const { data: histData, error: histError } = await supabase.from('match_history').select('count').limit(1);
  if (histError) {
    console.log('match_history table does not exist or error:', histError.message);
  } else {
    console.log('✅ match_history table exists!');
  }
}

checkTables();
