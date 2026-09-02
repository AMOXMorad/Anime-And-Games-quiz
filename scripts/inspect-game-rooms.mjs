import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://wlgecqqddvoamufwtwkf.supabase.co';
const SUPABASE_KEY = 'sb_publishable_CdOZXNxUUo88HQszdA9sgw_Myb9EowU';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function inspectGameRooms() {
  const { data, error } = await supabase.from('game_rooms').select('*').limit(1);
  if (error) {
    console.log('Error querying game_rooms:', error.message);
  } else {
    console.log('game_rooms sample / columns:', data);
  }
}

inspectGameRooms();
