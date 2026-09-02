import { World } from '../types';
import { supabase, isSupabaseConfigured } from './supabase';

const DB_NAME = 'AG_UTOPIA_DB';
const DB_VERSION = 1;
const STORE_WORLDS = 'custom_worlds';

let inMemoryCustomWorlds: World[] = [];
let isInitialized = false;
let realtimeChannelSubscribed = false;

// Helper to open IndexedDB
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this environment'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_WORLDS)) {
        db.createObjectStore(STORE_WORLDS, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function mapDbToWorld(row: any): World {
  return {
    id: row.id,
    name: typeof row.name === 'string' ? JSON.parse(row.name) : row.name,
    category: row.category || 'anime',
    tagline: typeof row.tagline === 'string' ? JSON.parse(row.tagline) : row.tagline,
    description: typeof row.description === 'string' ? JSON.parse(row.description) : row.description,
    icon: row.icon || '⚔️',
    banner: row.banner || 'https://cdn.myanimelist.net/images/anime/13/17405.jpg',
    themeColor: row.theme_color || row.themeColor || '#06b6d4',
    accentGlow: row.accent_glow || row.accentGlow || 'rgba(6,182,212,0.4)',
    characters: Array.isArray(row.characters) ? row.characters : (typeof row.characters === 'string' ? JSON.parse(row.characters) : []),
    triviaQuestions: Array.isArray(row.trivia_questions) ? row.trivia_questions : (row.triviaQuestions || []),
    trueFalseQuestions: Array.isArray(row.true_false_questions) ? row.true_false_questions : (row.trueFalseQuestions || []),
    isCustom: true,
    created_at: row.created_at || new Date().toISOString()
  };
}

function mapWorldToDb(world: World): any {
  return {
    id: world.id,
    name: world.name,
    category: world.category,
    tagline: world.tagline,
    description: world.description,
    icon: world.icon,
    banner: world.banner,
    theme_color: world.themeColor,
    accent_glow: world.accentGlow,
    characters: world.characters,
    trivia_questions: world.triviaQuestions,
    true_false_questions: world.trueFalseQuestions,
    is_custom: true,
    updated_at: new Date().toISOString()
  };
}

/**
 * Initialize storage: load from IndexedDB into memory, then sync from Supabase Cloud DB
 */
export async function initCustomWorldsStorage(): Promise<World[]> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_WORLDS, 'readonly');
    const store = tx.objectStore(STORE_WORLDS);
    const request = store.getAll();

    await new Promise<void>((resolve) => {
      request.onsuccess = () => {
        inMemoryCustomWorlds = request.result || [];
        isInitialized = true;
        resolve();
      };
      request.onerror = () => {
        getFallbackFromLocalStorage();
        resolve();
      };
    });
  } catch (e) {
    console.warn('Local IndexedDB load warning:', e);
    getFallbackFromLocalStorage();
  }

  // Trigger initial UI render with cached local worlds
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('ag_utopia_worlds_updated'));
  }

  // Fetch all worlds from Supabase Cloud Database for universal sync if configured
  if (isSupabaseConfigured()) {
    syncFromSupabaseCloud().catch(console.warn);
    setupSupabaseRealtimeSync();
  }

  return inMemoryCustomWorlds;
}

/**
 * Syncs worlds between Local IndexedDB and Supabase Cloud
 */
export async function syncFromSupabaseCloud(): Promise<void> {
  if (!isSupabaseConfigured()) return;

  try {
    const { data: cloudWorlds, error } = await supabase
      .from('custom_worlds')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase fetch custom_worlds warning:', error.message);
      return;
    }

    if (Array.isArray(cloudWorlds) && cloudWorlds.length > 0) {
      const parsedCloudWorlds = cloudWorlds.map(mapDbToWorld);

      // Merge Cloud Worlds into Local Cache & IndexedDB
      const mergedMap = new Map<string, World>();

      // 1. Add current local worlds first
      inMemoryCustomWorlds.forEach(w => mergedMap.set(w.id, w));

      // 2. Override with Cloud Worlds
      parsedCloudWorlds.forEach(w => mergedMap.set(w.id, w));

      inMemoryCustomWorlds = Array.from(mergedMap.values());

      // Save all merged worlds to local IndexedDB
      try {
        const db = await openDB();
        const tx = db.transaction(STORE_WORLDS, 'readwrite');
        const store = tx.objectStore(STORE_WORLDS);
        for (const world of inMemoryCustomWorlds) {
          store.put(world);
        }
      } catch (_) {}

      // 3. Push any local worlds NOT yet in cloud
      for (const localWorld of inMemoryCustomWorlds) {
        if (!cloudWorlds.some(cw => cw.id === localWorld.id)) {
          supabase.from('custom_worlds').upsert(mapWorldToDb(localWorld)).then(({ error: upsertErr }) => {
            if (upsertErr) console.warn('Sync local world to cloud warning:', upsertErr.message);
          });
        }
      }

      // Notify UI
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('ag_utopia_worlds_updated'));
      }
    }
  } catch (err: any) {
    console.warn('Failed syncing worlds from Supabase (using local data):', err.message);
  }
}

/**
 * Setup Realtime channel to receive new/updated/deleted worlds live
 */
function setupSupabaseRealtimeSync() {
  if (realtimeChannelSubscribed || typeof window === 'undefined' || !isSupabaseConfigured()) return;
  realtimeChannelSubscribed = true;

  try {
    supabase
      .channel('custom_worlds_realtime_sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'custom_worlds' },
        async (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const updatedWorld = mapDbToWorld(payload.new);
            const filtered = inMemoryCustomWorlds.filter(w => w.id !== updatedWorld.id);
            inMemoryCustomWorlds = [updatedWorld, ...filtered];

            try {
              const db = await openDB();
              const tx = db.transaction(STORE_WORLDS, 'readwrite');
              tx.objectStore(STORE_WORLDS).put(updatedWorld);
            } catch (_) {}

            window.dispatchEvent(new Event('ag_utopia_worlds_updated'));
          } else if (payload.eventType === 'DELETE') {
            const deletedId = (payload.old as any)?.id;
            if (deletedId) {
              inMemoryCustomWorlds = inMemoryCustomWorlds.filter(w => w.id !== deletedId);

              try {
                const db = await openDB();
                const tx = db.transaction(STORE_WORLDS, 'readwrite');
                tx.objectStore(STORE_WORLDS).delete(deletedId);
              } catch (_) {}

              window.dispatchEvent(new Event('ag_utopia_worlds_updated'));
            }
          }
        }
      )
      .subscribe();
  } catch (e) {
    console.warn('Realtime subscription warning:', e);
  }
}

function getFallbackFromLocalStorage(): World[] {
  try {
    const saved = localStorage.getItem('ag_utopia_custom_worlds');
    inMemoryCustomWorlds = saved ? JSON.parse(saved) : [];
  } catch (_) {
    inMemoryCustomWorlds = [];
  }
  isInitialized = true;
  return inMemoryCustomWorlds;
}

/**
 * Synchronous getter from in-memory cache
 */
export function getLoadedCustomWorlds(): World[] {
  if (!isInitialized) {
    getFallbackFromLocalStorage();
  }
  return inMemoryCustomWorlds;
}

/**
 * Save a custom world to Local IndexedDB & Cache + Cloud Database (Supabase) if available
 */
export async function saveCustomWorldToDb(world: World): Promise<void> {
  const worldToSave = {
    ...world,
    isCustom: true,
    created_at: world.created_at || new Date().toISOString()
  };

  // 1. Update memory cache immediately
  const filtered = inMemoryCustomWorlds.filter(w => w.id !== world.id);
  inMemoryCustomWorlds = [worldToSave, ...filtered];

  // 2. Save to local IndexedDB (always succeeds regardless of network)
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_WORLDS, 'readwrite');
    const store = tx.objectStore(STORE_WORLDS);
    await new Promise<void>((resolve, reject) => {
      const req = store.put(worldToSave);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    console.warn('Failed to save world in local IndexedDB', e);
  }

  // 3. Push to Supabase Cloud Database (if key is configured)
  if (isSupabaseConfigured()) {
    try {
      const dbPayload = mapWorldToDb(worldToSave);
      const { error } = await supabase.from('custom_worlds').upsert(dbPayload);
      if (error) {
        console.warn('Supabase cloud push warning (saved locally):', error.message);
      }
    } catch (e: any) {
      console.warn('Failed pushing world to Supabase cloud (saved locally):', e);
    }
  }

  // 4. Trigger local UI update
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('ag_utopia_worlds_updated'));
  }
}

/**
 * Delete a custom world from Local IndexedDB & Cache + Cloud Database
 */
export async function deleteCustomWorldFromDb(worldId: string): Promise<void> {
  inMemoryCustomWorlds = inMemoryCustomWorlds.filter(w => w.id !== worldId);

  // 1. Delete from local IndexedDB
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_WORLDS, 'readwrite');
    const store = tx.objectStore(STORE_WORLDS);
    await new Promise<void>((resolve, reject) => {
      const req = store.delete(worldId);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    console.warn('Failed to delete world from local IndexedDB', e);
  }

  // 2. Delete from Supabase Cloud Database
  if (isSupabaseConfigured()) {
    try {
      await supabase.from('custom_worlds').delete().eq('id', worldId);
    } catch (e) {
      console.warn('Failed deleting world from Supabase cloud:', e);
    }
  }

  // 3. Trigger local UI update
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('ag_utopia_worlds_updated'));
  }
}

// Listen to custom key updates
if (typeof window !== 'undefined') {
  window.addEventListener('ag_utopia_supabase_key_updated', () => {
    syncFromSupabaseCloud().catch(console.warn);
    setupSupabaseRealtimeSync();
  });
}

// Auto-initialize on module load
if (typeof window !== 'undefined') {
  initCustomWorldsStorage().catch(console.warn);
}
