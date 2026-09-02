import { World, Difficulty, Profile, TrueFalseQuestion, TriviaQuestion, Character } from '../types';
import { supabase, isSupabaseConfigured } from './supabase';
import { shuffleTriviaOptions } from '../data/worlds';

export interface SynchronizedRoomQuestions {
  round1_tf: TrueFalseQuestion[];
  round2_trivia: TriviaQuestion[];
  round3_char: Character | null;
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

  const round1_tf = [...tfPool].sort(() => 0.5 - Math.random()).slice(0, 3);
  const round2_trivia = [...trPool].sort(() => 0.5 - Math.random()).slice(0, 3).map(shuffleTriviaOptions);
  const round3_char = charPool.length > 0 ? charPool[Math.floor(Math.random() * charPool.length)] : null;

  return {
    round1_tf,
    round2_trivia,
    round3_char
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
    const { data: room } = await supabase
      .from('game_rooms')
      .select('id, game_state, status')
      .eq('room_code', cleanCode)
      .maybeSingle();

    if (!room || room.status === 'finished') return;

    const now = new Date().toISOString();
    const updatedState = { ...room.game_state };

    if (isHost) {
      updatedState.host_score = score;
      updatedState.host_round = round;
      updatedState.host_last_active = now;
    } else {
      updatedState.guest_score = score;
      updatedState.guest_round = round;
      updatedState.guest_last_active = now;
    }

    await supabase
      .from('game_rooms')
      .update({ game_state: updatedState })
      .eq('id', room.id);
  } catch (_) {}
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
