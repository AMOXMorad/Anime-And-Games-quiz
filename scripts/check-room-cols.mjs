import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://wlgecqqddvoamufwtwkf.supabase.co';
const SUPABASE_KEY = 'sb_publishable_CdOZXNxUUo88HQszdA9sgw_Myb9EowU';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkColumns() {
  const minimal = {
    room_code: 'TEST12',
    host_id: 'user_test',
    world_id: 'ag_utopia_world_naruto',
    difficulty: 'medium',
    created_at: new Date().toISOString()
  };

  const { data, error } = await supabase.from('game_rooms').insert(minimal).select();
  if (error) {
    console.log('Error minimal:', error);
  } else {
    console.log('Columns on game_rooms:', Object.keys(data[0]));
    console.log('Sample row:', data[0]);
    await supabase.from('game_rooms').delete().eq('room_code', 'TEST12');
  }
}

checkColumns();
