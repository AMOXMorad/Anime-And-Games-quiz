import { World, Difficulty, Profile, TrueFalseQuestion, TriviaQuestion, Character } from '../types';
import { supabase, isSupabaseConfigured } from './supabase';
import { shuffleTriviaOptions } from '../data/worlds';

export interface SynchronizedRoomQuestions {
  round1_tf: TrueFalseQuestion[];
  round2_trivia: TriviaQuestion[];
  // Real "Who Am I": each player must guess THEIR OWN secret character;
  // the opponent's character is shown to them as a reference (classic party-game twist).
  round3_char_host: Character | null;
  round3_char_guest: Character | null;
}

export interface MultiplayerGameState {
  host_profile: Profile;
  guest_profile: Profile | null;
  host_score: number;
  guest_score: number;
  host_round: number;
  guest_round: number;
  host_last_active: string;
  guest_last_active: string | null;
  questions: SynchronizedRoomQuestions;
  winner_id?: string | null;
  winner_name?: string | null;
  finish_reason?: string | null;
  completed_at?: string | null;
}

export interface MultiplayerRoom {
  id: string;
  room_code: string;
  host_id: string;
  guest_id: string | null;
  world_id: string;
  difficulty: Difficulty;
  status: 'waiting' | 'active' | 'finished' | 'abandoned';
  game_state: MultiplayerGameState;
  created_at: string;
}

/**
 * Generate synchronized questions for a room
 */
export function generateSynchronizedQuestions(world: World): SynchronizedRoomQuestions {
  const tfPool = world.trueFalseQuestions.length > 0 ? world.trueFalseQuestions : [];
  const trPool = world.triviaQuestions.length > 0 ? world.triviaQuestions : [];
  const charPool = world.characters.length > 0 ? world.characters : [];

  const round1_tf = [...tfPool].sort(() => 0.5 - Math.random()).slice(0, 5);
  const round2_trivia = [...trPool].sort(() => 0.5 - Math.random()).slice(0, 5).map(shuffleTriviaOptions);

  // Pick two DIFFERENT characters when possible — one is the host's secret
  // identity (visible to the guest), the other is the guest's (visible to the host).
  const shuffledChars = [...charPool].sort(() => 0.5 - Math.random());
  const round3_char_host = shuffledChars[0] || null;
  const round3_char_guest = (shuffledChars.length > 1 ? shuffledChars[1] : shuffledChars[0]) || null;

  return {
    round1_tf,
    round2_trivia,
    round3_char_host,
    round3_char_guest
  };
}

/**
 * Host creates a new multiplayer room with a unique code and synchronized questions
 */
export async function createMultiplayerRoom(
  world: World,
  difficulty: Difficulty,
  hostProfile: Profile
): Promise<{ success: boolean; roomCode: string; room?: MultiplayerRoom; error?: string }> {
  const prefix = world.id.toUpperCase().slice(0, 4).replace(/[^A-Z0-9]/g, '') || 'UTOPIA';
  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  const roomCode = `${prefix}-${randomDigits}`;

  const questions = generateSynchronizedQuestions(world);
  const now = new Date().toISOString();

  const initialGameState: MultiplayerGameState = {
    host_profile: hostProfile,
    guest_profile: null,
    host_score: 0,
    guest_score: 0,
    host_round: 1,
    guest_round: 1,
    host_last_active: now,
    guest_last_active: null,
    questions
  };

  try {
    if (!isSupabaseConfigured()) {
      return { success: true, roomCode };
    }

    // Clean any old finished rooms before creating a new one to keep DB lightweight
    cleanStaleRooms().catch(() => {});

    const { data, error } = await supabase
      .from('game_rooms')
      .insert({
        room_code: roomCode,
        host_id: hostProfile.id,
        world_id: world.id,
        difficulty,
        status: 'waiting',
        game_state: initialGameState
      })
      .select()
      .single();

    if (error) {
      console.warn('Failed creating room in Supabase (falling back locally):', error.message);
      return { success: true, roomCode };
    }

    return { success: true, roomCode, room: data as MultiplayerRoom };
  } catch (e: any) {
    console.error('Error creating room:', e);
    return { success: true, roomCode };
  }
}

/**
 * Guest joins an existing room by code
 */
export async function joinMultiplayerRoom(
  roomCode: string,
  guestProfile: Profile
): Promise<{ success: boolean; message: string; room?: MultiplayerRoom }> {
  const cleanCode = roomCode.trim().toUpperCase();

  if (!isSupabaseConfigured()) {
    return {
      success: true,
      message: 'تم الانضمام إلى الغرفة بنجاح!'
    };
  }

  try {
    const { data: room, error } = await supabase
      .from('game_rooms')
      .select('*')
      .eq('room_code', cleanCode)
      .maybeSingle();

    if (error || !room) {
      return {
        success: false,
        message: 'كود الغرفة غير موجود. يرجى التأكد من الكود والمحاولة مجدداً.'
      };
    }

    if (room.status === 'finished') {
      return {
        success: false,
        message: 'هذه المباراة انتهت بالفعل وتم إغلاق الغرفة.'
      };
    }

    if (room.status === 'active' && room.guest_id && room.guest_id !== guestProfile.id) {
      return {
        success: false,
        message: 'الغرفة ممتلئة بالفعل بلاعبين اثنين!'
      };
    }

    const now = new Date().toISOString();
    const updatedGameState: MultiplayerGameState = {
      ...room.game_state,
      guest_profile: guestProfile,
      guest_last_active: now
    };

    const { data: updatedRoom, error: updateErr } = await supabase
      .from('game_rooms')
      .update({
        guest_id: guestProfile.id,
        status: 'active',
        game_state: updatedGameState
      })
      .eq('id', room.id)
      .select()
      .single();

    if (updateErr) {
      return {
        success: false,
        message: 'فشل الانضمام إلى الغرفة: ' + updateErr.message
      };
    }

    return {
      success: true,
      message: 'تم الانضمام للغرفة بنجاح!',
      room: updatedRoom as MultiplayerRoom
    };
  } catch (e: any) {
    return {
      success: false,
      message: 'حدث خطأ أثناء الانضمام للغرفة: ' + (e.message || 'خطأ غير معروف')
    };
  }
}

/**
 * Subscribes to real-time changes of a room
 */
export function subscribeToRoomUpdates(
  roomCode: string,
  onUpdate: (room: MultiplayerRoom) => void
): () => void {
  if (!isSupabaseConfigured()) return () => {};

  const cleanCode = roomCode.trim().toUpperCase();

  const channel = supabase
    .channel(`room_${cleanCode}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'game_rooms',
        filter: `room_code=eq.${cleanCode}`
      },
      (payload) => {
        if (payload.new) {
          onUpdate(payload.new as MultiplayerRoom);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Sends real-time heartbeat, current round, and score for a player
 */
export async function sendPlayerHeartbeatAndScore(
  roomCode: string,
  isHost: boolean,
  score: number,
  round: number
): Promise<void> {
  if (!isSupabaseConfigured()) return;

  const cleanCode = roomCode.trim().toUpperCase();

  try {
    // Use atomic partial update to avoid race conditions between host and guest.
    // Each player only writes their own fields using Supabase's jsonb concatenation operator.
    const now = new Date().toISOString();
    
    const partialState = isHost
      ? { host_score: score, host_round: round, host_last_active: now }
      : { guest_score: score, guest_round: round, guest_last_active: now };

    // First get the room id
    const { data: room } = await supabase
      .from('game_rooms')
      .select('id, status')
      .eq('room_code', cleanCode)
      .maybeSingle();

    if (!room || room.status === 'finished') return;

    // Use rpc to atomically merge partial JSON into game_state
    // Fallback: if rpc not available, do a targeted update
    const { error } = await supabase.rpc('merge_game_state', {
      p_room_id: room.id,
      p_partial_state: partialState
    });

    // If RPC doesn't exist, fallback to read-then-write (less safe but still works)
    if (error) {
      const { data: fullRoom } = await supabase
        .from('game_rooms')
        .select('id, game_state')
        .eq('id', room.id)
        .maybeSingle();

      if (!fullRoom) return;

      const updatedState = { ...fullRoom.game_state, ...partialState };
      await supabase
        .from('game_rooms')
        .update({ game_state: updatedState })
        .eq('id', room.id);
    }
  } catch (e) {
    console.warn('Heartbeat sync warning:', e);
  }
}

/**
 * Closes room, records the winner, and archives the match
 */
export async function closeAndArchiveRoom(
  roomCode: string,
  winnerId: string,
  winnerName: string,
  reason: string,
  finalHostScore: number,
  finalGuestScore: number
): Promise<void> {
  if (!isSupabaseConfigured()) return;

  const cleanCode = roomCode.trim().toUpperCase();

  try {
    const { data: room } = await supabase
      .from('game_rooms')
      .select('id, game_state')
      .eq('room_code', cleanCode)
      .maybeSingle();

    if (!room) return;

    const finishedState: MultiplayerGameState = {
      ...room.game_state,
      host_score: finalHostScore,
      guest_score: finalGuestScore,
      winner_id: winnerId,
      winner_name: winnerName,
      finish_reason: reason,
      completed_at: new Date().toISOString()
    };

    await supabase
      .from('game_rooms')
      .update({
        status: 'finished',
        game_state: finishedState
      })
      .eq('id', room.id);
  } catch (e) {
    console.warn('Failed to close and archive room:', e);
  }
}

/**
 * Fetches the current state of a room by its code (used for reconnect-after-refresh
 * and as a polling safety net if the realtime channel silently fails to deliver events)
 */
export async function getRoomByCode(roomCode: string): Promise<MultiplayerRoom | null> {
  if (!isSupabaseConfigured()) return null;
  const cleanCode = roomCode.trim().toUpperCase();

  try {
    const { data, error } = await supabase
      .from('game_rooms')
      .select('*')
      .eq('room_code', cleanCode)
      .maybeSingle();

    if (error || !data) return null;
    return data as MultiplayerRoom;
  } catch (e) {
    console.warn('getRoomByCode warning:', e);
    return null;
  }
}

/**
 * Cleans up stale rooms (older than 2 hours or completed) to minimize database load
 */
export async function cleanStaleRooms(): Promise<void> {
  if (!isSupabaseConfigured()) return;

  try {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    await supabase
      .from('game_rooms')
      .delete()
      .or(`status.eq.finished,created_at.lt.${twoHoursAgo}`);
  } catch (_) {}
}

// =========================================================
// REAL RANDOM MATCHMAKING (matchmaking_queue table)
// Replaces the old "fake 2-second timer then invent a bot" behavior.
// =========================================================

export interface QueueEntry {
  id: string;
  user_id: string;
  profile: Profile;
  world_id: string;
  mode: string;
  difficulty: Difficulty;
  status: 'waiting' | 'matched' | 'cancelled';
  room_code: string | null;
  matched_as: 'host' | 'guest' | null;
  created_at: string;
}

export type RandomMatchResult =
  | { status: 'matched'; roomCode: string; isHost: boolean; room: MultiplayerRoom }
  | { status: 'waiting'; queueId: string }
  | { status: 'error'; message: string };

/**
 * Tries to find a real, already-waiting opponent for the same world/mode/difficulty.
 * - If someone is already waiting -> immediately create the room, pair both up, return 'matched'.
 * - If nobody is waiting -> add myself to the queue and return 'waiting' so the caller
 *   can subscribe to my queue row until someone else matches me.
 */
export async function findRandomMatch(
  world: World,
  mode: GameModeType_ForQueue,
  difficulty: Difficulty,
  myProfile: Profile
): Promise<RandomMatchResult> {
  if (!isSupabaseConfigured()) {
    return { status: 'error', message: 'الخدمة غير متاحة حالياً (Supabase غير مهيأ).' };
  }

  try {
    // Look for someone else already waiting for the exact same world/mode/difficulty
    const { data: waitingRows, error: findErr } = await supabase
      .from('matchmaking_queue')
      .select('*')
      .eq('world_id', world.id)
      .eq('mode', mode)
      .eq('difficulty', difficulty)
      .eq('status', 'waiting')
      .neq('user_id', myProfile.id)
      .order('created_at', { ascending: true })
      .limit(1);

    if (findErr) {
      console.warn('findRandomMatch lookup warning:', findErr.message);
    }

    const opponentEntry = (waitingRows && waitingRows[0]) as QueueEntry | undefined;

    if (opponentEntry) {
      // Someone is already waiting — pair up immediately. They become the host
      // (they were there first), I become the guest.
      const hostProfile = opponentEntry.profile;
      const roomRes = await createMultiplayerRoom(world, difficulty, hostProfile);
      if (!roomRes.success || !roomRes.room) {
        return { status: 'error', message: 'تعذر إنشاء غرفة المباراة.' };
      }

      const joinRes = await joinMultiplayerRoom(roomRes.roomCode, myProfile);
      if (!joinRes.success || !joinRes.room) {
        return { status: 'error', message: joinRes.message };
      }

      // Mark both queue rows as matched so nobody else grabs them
      await supabase
        .from('matchmaking_queue')
        .update({ status: 'matched', room_code: roomRes.roomCode, matched_as: 'host' })
        .eq('id', opponentEntry.id);

      return { status: 'matched', roomCode: roomRes.roomCode, isHost: false, room: joinRes.room };
    }

    // Nobody waiting — add myself to the queue
    const { data: myEntry, error: insertErr } = await supabase
      .from('matchmaking_queue')
      .insert({
        user_id: myProfile.id,
        profile: myProfile,
        world_id: world.id,
        mode,
        difficulty,
        status: 'waiting'
      })
      .select()
      .single();

    if (insertErr || !myEntry) {
      return { status: 'error', message: 'تعذر الانضمام لقائمة الانتظار.' };
    }

    return { status: 'waiting', queueId: myEntry.id };
  } catch (e: any) {
    return { status: 'error', message: e?.message || 'خطأ غير معروف أثناء المطابقة العشوائية' };
  }
}

/**
 * Subscribes to MY OWN queue row so I find out the moment someone else matches me.
 * Also returns a manual `checkNow()` you can poll on an interval as a safety net,
 * in case the realtime event never arrives.
 */
export function subscribeToQueueEntry(
  queueId: string,
  onMatched: (roomCode: string) => void
): { unsubscribe: () => void; checkNow: () => Promise<void> } {
  const checkNow = async () => {
    if (!isSupabaseConfigured()) return;
    const { data } = await supabase
      .from('matchmaking_queue')
      .select('*')
      .eq('id', queueId)
      .maybeSingle();
    if (data && data.status === 'matched' && data.room_code) {
      onMatched(data.room_code);
    }
  };

  if (!isSupabaseConfigured()) {
    return { unsubscribe: () => {}, checkNow };
  }

  const channel = supabase
    .channel(`queue_${queueId}`)
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'matchmaking_queue', filter: `id=eq.${queueId}` },
      (payload) => {
        const row = payload.new as QueueEntry;
        if (row.status === 'matched' && row.room_code) {
          onMatched(row.room_code);
        }
      }
    )
    .subscribe();

  return {
    unsubscribe: () => supabase.removeChannel(channel),
    checkNow
  };
}

/**
 * Removes my entry from the matchmaking queue (search cancelled)
 */
export async function leaveMatchmakingQueue(queueId: string): Promise<void> {
  if (!isSupabaseConfigured() || !queueId) return;
  try {
    await supabase.from('matchmaking_queue').delete().eq('id', queueId);
  } catch (_) {}
}

// Kept generic so this file doesn't need to import GameModeType directly
type GameModeType_ForQueue = string;
