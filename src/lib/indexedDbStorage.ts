import { World } from '../types';

const DB_NAME = 'AG_UTOPIA_DB';
const DB_VERSION = 1;
const STORE_WORLDS = 'custom_worlds';

let inMemoryCustomWorlds: World[] = [];
let isInitialized = false;

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

/**
 * Initialize storage: load from IndexedDB into memory, with migration from localStorage
 */
export async function initCustomWorldsStorage(): Promise<World[]> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_WORLDS, 'readonly');
    const store = tx.objectStore(STORE_WORLDS);
    const request = store.getAll();

    return new Promise((resolve) => {
      request.onsuccess = async () => {
        let worlds: World[] = request.result || [];

        // Check if there are legacy worlds in localStorage to migrate
        try {
          const localSaved = localStorage.getItem('ag_utopia_custom_worlds');
          if (localSaved) {
            const parsed: World[] = JSON.parse(localSaved);
            if (Array.isArray(parsed) && parsed.length > 0) {
              for (const w of parsed) {
                if (!worlds.some(existing => existing.id === w.id)) {
                  worlds.push(w);
                  await saveCustomWorldToDb(w);
                }
              }
            }
          }
        } catch (_) {}

        inMemoryCustomWorlds = worlds;
        isInitialized = true;
        
        // Notify app
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('ag_utopia_worlds_updated'));
        }

        resolve(inMemoryCustomWorlds);
      };

      request.onerror = () => {
        console.error('Failed to read custom worlds from IndexedDB', request.error);
        resolve(getFallbackFromLocalStorage());
      };
    });
  } catch (e) {
    console.error('IndexedDB init error:', e);
    return getFallbackFromLocalStorage();
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
 * Save a custom world to IndexedDB and update cache
 */
export async function saveCustomWorldToDb(world: World): Promise<void> {
  const worldToSave = {
    ...world,
    isCustom: true,
    created_at: world.created_at || new Date().toISOString()
  };

  // Update memory cache immediately
  const filtered = inMemoryCustomWorlds.filter(w => w.id !== world.id);
  inMemoryCustomWorlds = [...filtered, worldToSave];

  // Try saving to localStorage as extra fallback (safely ignore quota error)
  try {
    localStorage.setItem('ag_utopia_custom_worlds', JSON.stringify(inMemoryCustomWorlds));
  } catch (_) {}

  // Save to IndexedDB
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
    console.error('Failed to save world in IndexedDB', e);
  }

  // Trigger reactive updates across UI
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('ag_utopia_worlds_updated'));
  }
}

/**
 * Delete a custom world from IndexedDB and cache
 */
export async function deleteCustomWorldFromDb(worldId: string): Promise<void> {
  inMemoryCustomWorlds = inMemoryCustomWorlds.filter(w => w.id !== worldId);

  try {
    localStorage.setItem('ag_utopia_custom_worlds', JSON.stringify(inMemoryCustomWorlds));
  } catch (_) {}

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
    console.error('Failed to delete world from IndexedDB', e);
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('ag_utopia_worlds_updated'));
  }
}

// Auto-initialize on module load
if (typeof window !== 'undefined') {
  initCustomWorldsStorage().catch(console.error);
}
