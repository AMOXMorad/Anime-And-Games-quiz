import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://wlgecqqddvoamufwtwkf.supabase.co';
const SUPABASE_KEY = 'sb_publishable_CdOZXNxUUo88HQszdA9sgw_Myb9EowU';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function testInsertRoom() {
  const testPayload = {
    id: 'TEST-ROOM-1',
    world_id: 'ag_utopia_world_naruto',
    difficulty: 'medium',
    mode: 'super_challenge',
    status: 'waiting',
    host_id: 'user_1',
    host_profile: { username: 'HostPlayer', level: 10 },
    guest_id: null,
    guest_profile: null,
    host_score: 0,
    guest_score: 0,
    host_round: 1,
    guest_round: 1,
    questions: {
      round1_tf: [{ id: 'q1', statement: { ar: 'test' }, isCorrect: true }],
      round2_trivia: [{ id: 'q2', question: { ar: 'test' }, options: [] }],
      round3_char: { id: 'c1', name: { ar: 'Naruto' } }
    },
    winner_id: null,
    winner_name: null,
    finish_reason: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabase.from('game_rooms').upsert(testPayload).select();
  if (error) {
    console.log('Upsert error:', error.message);
  } else {
    console.log('✅ Successfully inserted/verified game_rooms columns! Data:', data);
    // clean up test
    await supabase.from('game_rooms').delete().eq('id', 'TEST-ROOM-1');
  }
}

testInsertRoom();
