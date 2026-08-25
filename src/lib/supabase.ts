import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = 'https://wlgecqqddvoamufwtwkf.supabase.co';
export const SUPABASE_ANON_KEY = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.dummy';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Helper for generating unique 4-digit User Tag (e.g., "1042")
export function generateUserTag(): string {
  const num = Math.floor(1000 + Math.random() * 9000);
  return num.toString();
}

// Helper for generating 6-character room codes (e.g. "NARUTO-88")
export function generateRoomCode(prefix: string = 'UTOPIA'): string {
  const num = Math.floor(10 + Math.random() * 90);
  return `${prefix.toUpperCase()}-${num}`;
}
