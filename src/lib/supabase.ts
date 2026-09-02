import { createClient, SupabaseClient } from '@supabase/supabase-js';

export const SUPABASE_URL = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://wlgecqqddvoamufwtwkf.supabase.co';
export const DEFAULT_SUPABASE_PUBLIC_KEY = 'sb_publishable_CdOZXNxUUo88HQszdA9sgw_Myb9EowU';

export function getSupabaseAnonKey(): string {
  if (typeof window !== 'undefined') {
    const customKey = localStorage.getItem('ag_utopia_supabase_anon_key');
    if (customKey && customKey.trim().length > 15) {
      return customKey.trim();
    }
  }
  return (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_PUBLIC_KEY;
}

export const SUPABASE_ANON_KEY = getSupabaseAnonKey();

export function isSupabaseConfigured(): boolean {
  const key = getSupabaseAnonKey();
  return Boolean(
    key && 
    !key.includes('dummy') && 
    (key.startsWith('sb_') || key.startsWith('eyJ'))
  );
}

export let supabase: SupabaseClient = createClient(SUPABASE_URL, getSupabaseAnonKey(), {
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

export function setCustomSupabaseKey(newKey: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('ag_utopia_supabase_anon_key', newKey.trim());
    supabase = createClient(SUPABASE_URL, newKey.trim(), {
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
    window.dispatchEvent(new Event('ag_utopia_supabase_key_updated'));
  }
}

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
