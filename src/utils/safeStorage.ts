import { KopSuratConfig, SchoolProfile, Student } from '../types';
import { getPresetLogoDataUrl } from './kopSuratLogos';

const KV_DB_NAME = 'sdn006_un_app_kv_v1';
const KV_DB_VERSION = 1;
const KV_STORE_NAME = 'kv';

export const IDB_PHOTO_TOKEN = '__IDB_PHOTO__';
export const IDB_LOGO_KIRI_TOKEN = '__IDB_LOGO_KIRI__';
export const IDB_LOGO_KANAN_TOKEN = '__IDB_LOGO_KANAN__';

let kvDbPromise: Promise<IDBDatabase | null> | null = null;

function isIndexedDBAvailable(): boolean {
  return typeof window !== 'undefined' && 'indexedDB' in window && window.indexedDB !== null;
}

export function getKvDB(): Promise<IDBDatabase | null> {
  if (!isIndexedDBAvailable()) {
    return Promise.resolve(null);
  }
  if (!kvDbPromise) {
    kvDbPromise = new Promise((resolve) => {
      try {
        const req = window.indexedDB.open(KV_DB_NAME, KV_DB_VERSION);
        req.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains(KV_STORE_NAME)) {
            db.createObjectStore(KV_STORE_NAME, { keyPath: 'key' });
          }
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => {
          console.warn('Gagal membuka IndexedDB KV:', req.error);
          resolve(null);
        };
        req.onblocked = () => {
          console.warn('IndexedDB KV diblokir oleh tab lain.');
          resolve(null);
        };
      } catch (err) {
        console.warn('Error inisialisasi IndexedDB KV:', err);
        resolve(null);
      }
    });
  }
  return kvDbPromise;
}

export async function idbGet<T = unknown>(key: string): Promise<T | null> {
  try {
    const db = await getKvDB();
    if (!db) return null;
    return await new Promise<T | null>((resolve) => {
      try {
        const tx = db.transaction([KV_STORE_NAME], 'readonly');
        const store = tx.objectStore(KV_STORE_NAME);
        const req = store.get(key);
        req.onsuccess = () => {
          const record = req.result as { key: string; value: T } | undefined;
          resolve(record ? record.value : null);
        };
        req.onerror = () => resolve(null);
      } catch {
        resolve(null);
      }
    });
  } catch {
    return null;
  }
}

export async function idbSet<T = unknown>(key: string, value: T): Promise<boolean> {
  try {
    const db = await getKvDB();
    if (!db) return false;
    return await new Promise<boolean>((resolve) => {
      try {
        const tx = db.transaction([KV_STORE_NAME], 'readwrite');
        const store = tx.objectStore(KV_STORE_NAME);
        const req = store.put({ key, value, updatedAt: Date.now() });
        req.onsuccess = () => resolve(true);
        req.onerror = () => resolve(false);
      } catch {
        resolve(false);
      }
    });
  } catch {
    return false;
  }
}

export async function idbDelete(key: string): Promise<void> {
  try {
    const db = await getKvDB();
    if (!db) return;
    await new Promise<void>((resolve) => {
      try {
        const tx = db.transaction([KV_STORE_NAME], 'readwrite');
        const store = tx.objectStore(KV_STORE_NAME);
        const req = store.delete(key);
        req.onsuccess = () => resolve();
        req.onerror = () => resolve();
      } catch {
        resolve();
      }
    });
  } catch {
    // ignore
  }
}

export function safeLocalStorageGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function safeLocalStorageRemove(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

export function safeLocalStorageSet(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (err) {
    // QuotaExceededError: attempt automatic compaction of heavy cached TP snapshots, then retry once
    compactLocalStorageForQuota();
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (retryErr) {
      console.warn(`localStorage quota penuh untuk key "${key}", data disimpan ke IndexedDB:`, retryErr);
      return false;
    }
  }
}

export function isHeavyDataUrl(value?: string | null, maxLen = 40000): boolean {
  return typeof value === 'string' && value.length > maxLen && value.startsWith('data:');
}

export function isIdbToken(value?: string | null): boolean {
  return typeof value === 'string' && value.startsWith('__IDB_');
}

export function sanitizeLoadedKopSurat(kop?: KopSuratConfig): KopSuratConfig | undefined {
  if (!kop) return kop;
  const next = { ...kop };
  if (isIdbToken(next.logoKiri)) {
    const fallbackPreset =
      next.logoKiriPreset && next.logoKiriPreset !== 'custom'
        ? next.logoKiriPreset
        : 'pemda_kuansing';
    next.logoKiri = getPresetLogoDataUrl(fallbackPreset);
  }
  if (isIdbToken(next.logoKanan)) {
    const fallbackPreset =
      next.logoKananPreset && next.logoKananPreset !== 'custom'
        ? next.logoKananPreset
        : 'tutwuri';
    next.logoKanan = getPresetLogoDataUrl(fallbackPreset);
  }
  return next;
}

export function stripHeavySchoolLogosForLocalStorage(profile: SchoolProfile): SchoolProfile {
  if (!profile.kopSurat) return profile;
  const kop = { ...profile.kopSurat };
  if (isHeavyDataUrl(kop.logoKiri, 45000)) {
    kop.logoKiri = IDB_LOGO_KIRI_TOKEN;
  }
  if (isHeavyDataUrl(kop.logoKanan, 45000)) {
    kop.logoKanan = IDB_LOGO_KANAN_TOKEN;
  }
  return {
    ...profile,
    kopSurat: kop,
  };
}

export function stripHeavyStudentPhotosForLocalStorage(students: Student[]): Student[] {
  return students.map((s) => {
    if (isHeavyDataUrl(s.foto, 15000)) {
      return { ...s, foto: IDB_PHOTO_TOKEN };
    }
    return s;
  });
}

/**
 * Strips heavy duplicated blobs (like raster photos) from localStorage TP archive snapshots
 * whose full copies live in IndexedDB, freeing megabytes of localStorage quota safely.
 */
export function compactLocalStorageForQuota(): void {
  try {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k) keys.push(k);
    }

    for (const k of keys) {
      if (k.startsWith('sdn006_un_tp_data_v1__')) {
        const raw = localStorage.getItem(k);
        if (!raw || raw.length < 100000) continue;
        try {
          const snap = JSON.parse(raw);
          if (snap && Array.isArray(snap.students)) {
            // Preserve full copy into IndexedDB before shrinking localStorage copy
            void idbSet(k, snap);
            const compacted = {
              ...snap,
              students: stripHeavyStudentPhotosForLocalStorage(snap.students),
            };
            const compactedStr = JSON.stringify(compacted);
            if (compactedStr.length < raw.length) {
              localStorage.setItem(k, compactedStr);
            }
          }
        } catch {
          // ignore unparseable entry
        }
      }
    }

    // Also compact main students key if it's still oversized
    const mainStudentsRaw = localStorage.getItem('sdn006_un_students_v1');
    if (mainStudentsRaw && mainStudentsRaw.length > 500000) {
      try {
        const parsed = JSON.parse(mainStudentsRaw);
        if (Array.isArray(parsed)) {
          void idbSet('sdn006_un_students_v1', parsed);
          const compactedStr = JSON.stringify(stripHeavyStudentPhotosForLocalStorage(parsed));
          if (compactedStr.length < mainStudentsRaw.length) {
            localStorage.setItem('sdn006_un_students_v1', compactedStr);
          }
        }
      } catch {
        // ignore
      }
    }
  } catch {
    // ignore
  }
}

/**
 * Saves SchoolProfile to IndexedDB (full fidelity) and localStorage (with graceful quota offloading).
 * Never throws QuotaExceededError.
 */
export function persistSchoolProfileSafe(storageKey: string, profile: SchoolProfile): void {
  // Always persist complete profile (including custom high-res logos) in IndexedDB
  void idbSet(storageKey, profile);

  const rawFull = JSON.stringify(profile);
  // Keep localStorage copy lightweight if logos are large (>250KB total) or if setItem hits quota
  if (rawFull.length <= 250000) {
    try {
      localStorage.setItem(storageKey, rawFull);
      return;
    } catch {
      // Fall through to compact + quota cleanup
    }
  }

  const compactProfile = stripHeavySchoolLogosForLocalStorage(profile);
  safeLocalStorageSet(storageKey, JSON.stringify(compactProfile));
}

/**
 * Saves students array to IndexedDB (full fidelity with photos) and localStorage (compact if large).
 * Never throws QuotaExceededError.
 */
export function persistStudentsSafe(storageKey: string, students: Student[]): void {
  void idbSet(storageKey, students);

  const rawFull = JSON.stringify(students);
  if (rawFull.length <= 450000) {
    try {
      localStorage.setItem(storageKey, rawFull);
      return;
    } catch {
      // Fall through to stripped version
    }
  }

  const compactStudents = stripHeavyStudentPhotosForLocalStorage(students);
  safeLocalStorageSet(storageKey, JSON.stringify(compactStudents));
}
