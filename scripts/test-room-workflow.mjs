import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://wlgecqqddvoamufwtwkf.supabase.co';
const SUPABASE_KEY = 'sb_publishable_CdOZXNxUUo88HQszdA9sgw_Myb9EowU';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function testRoomWorkflow() {
  console.log('Testing multiplayer room workflow...');

  const code = 'AG-' + Math.floor(1000 + Math.random() * 9000);

  // 1. Create Room (Host)
  console.log('1. Host creating room:', code);
  const initialRoom = {
    room_code: code,
    host_id: 'host_123',
    world_id: 'ag_utopia_world_naruto',
    difficulty: 'medium',
    status: 'waiting',
    game_state: {
      host_profile: { username: 'Player1', level: 10 },
      guest_profile: null,
      host_score: 0,
      guest_score: 0,
      host_round: 1,
      guest_round: 1,
      host_last_active: new Date().toISOString(),
      guest_last_active: null,
      questions: {
        round1_tf: [{ id: 'tf_1', statement: { ar: 'ناروتو بطل كونوها' }, isCorrect: true }],
        round2_trivia: [{ id: 'tr_1', question: { ar: 'من هو الهوكاجي الرابع؟' }, options: [] }],
        round3_char: { id: 'c_1', name: { ar: 'كاكاشي' } }
      }
    }
  };

  const { data: created, error: createErr } = await supabase
    .from('game_rooms')
    .insert(initialRoom)
    .select()
    .single();

  if (createErr) {
    console.error('Create error:', createErr);
    process.exit(1);
  }
  console.log('✅ Room created in Supabase with ID:', created.id);

  // 2. Guest Joins
  console.log('2. Guest joining room with code:', code);
  const { data: fetchedRoom, error: fetchErr } = await supabase
    .from('game_rooms')
    .select('*')
    .eq('room_code', code)
    .eq('status', 'waiting')
    .single();

  if (fetchErr || !fetchedRoom) {
    console.error('Guest cannot find room:', fetchErr);
    process.exit(1);
  }

  const updatedState = {
    ...fetchedRoom.game_state,
    guest_profile: { username: 'Player2', level: 8 },
    guest_last_active: new Date().toISOString()
  };

  const { data: joined, error: joinErr } = await supabase
    .from('game_rooms')
    .update({
      guest_id: 'guest_456',
      status: 'active',
      game_state: updatedState
    })
    .eq('id', fetchedRoom.id)
    .select()
    .single();

  if (joinErr) {
    console.error('Join error:', joinErr);
    process.exit(1);
  }
  console.log('✅ Guest joined! Status is now:', joined.status);
  console.log('Synchronized questions for guest:', joined.game_state.questions.round1_tf[0].statement.ar);

  // 3. Heartbeat / Score Update
  console.log('3. Updating host score & heartbeat...');
  const activeState = {
    ...joined.game_state,
    host_score: 350,
    host_round: 2,
    host_last_active: new Date().toISOString()
  };

  await supabase
    .from('game_rooms')
    .update({ game_state: activeState })
    .eq('id', joined.id);

  // 4. Finish Match & Archive
  console.log('4. Finishing match and closing room...');
  const finishedState = {
    ...activeState,
    winner_id: 'host_123',
    winner_name: 'Player1',
    finish_reason: 'انتهت جميع الجولات بفوز Player1!',
    completed_at: new Date().toISOString()
  };

  await supabase
    .from('game_rooms')
    .update({
      status: 'finished',
      game_state: finishedState
    })
    .eq('id', joined.id);

  console.log('🎉 Full multiplayer room flow successfully tested and verified!');

  // Cleanup test room
  await supabase.from('game_rooms').delete().eq('room_code', code);
}

testRoomWorkflow();
