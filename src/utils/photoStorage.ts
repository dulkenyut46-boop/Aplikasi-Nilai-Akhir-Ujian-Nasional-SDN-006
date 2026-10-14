/**
 * IndexedDB Persistence for Student Photos
 * Provides high-capacity, non-blocking asynchronous storage for student photos.
 * Avoids browser localStorage 5MB quota limits and prevents white-screen crashes.
 */

const DB_NAME = 'sdn006_un_photos_v2';
const DB_VERSION = 1;
const STORE_NAME = 'photos';

let dbPromise: Promise<IDBDatabase | null> | null = null;

function isIndexedDBSupported(): boolean {
  return typeof window !== 'undefined' && 'indexedDB' in window && window.indexedDB !== null;
}

export function getPhotoDB(): Promise<IDBDatabase | null> {
  if (!isIndexedDBSupported()) {
    return Promise.resolve(null);
  }

  if (!dbPromise) {
    dbPromise = new Promise((resolve) => {
      try {
        const request = window.indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          }
        };

        request.onsuccess = () => {
          resolve(request.result);
        };

        request.onerror = () => {
          console.warn('Gagal membuka IndexedDB untuk foto siswa:', request.error);
          resolve(null);
        };

        request.onblocked = () => {
          console.warn('IndexedDB diblokir oleh tab lain.');
          resolve(null);
        };
      } catch (err) {
        console.warn('Error saat menginisialisasi IndexedDB:', err);
        resolve(null);
      }
    });
  }

  return dbPromise;
}

/**
 * Save or delete a single student photo in IndexedDB
 */
export async function savePhotoToIndexedDB(studentId: string, foto: string | null): Promise<void> {
  try {
    const db = await getPhotoDB();
    if (!db) return;

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);

      if (!foto) {
        const req = store.delete(studentId);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      } else {
        const req = store.put({ id: studentId, foto, updatedAt: Date.now() });
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      }
    });
  } catch (err) {
    console.warn('Gagal menyimpan foto ke IndexedDB:', err);
  }
}

/**
 * Save multiple student photos in a single atomic transaction
 */
export async function batchSavePhotosToIndexedDB(
  updates: Array<{ id: string; foto: string }>
): Promise<void> {
  try {
    const db = await getPhotoDB();
    if (!db || updates.length === 0) return;

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);

      for (const item of updates) {
        if (item.foto) {
          store.put({ id: item.id, foto: item.foto, updatedAt: Date.now() });
        } else {
          store.delete(item.id);
        }
      }

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  } catch (err) {
    console.warn('Gagal batch simpan foto ke IndexedDB:', err);
  }
}

/**
 * Get all stored photos as a map of studentId -> fotoDataUrl
 */
export async function getAllPhotosFromIndexedDB(): Promise<Record<string, string>> {
  try {
    const db = await getPhotoDB();
    if (!db) return {};

    return new Promise((resolve) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const req = store.getAll();

      req.onsuccess = () => {
        const results = req.result as Array<{ id: string; foto: string }>;
        const map: Record<string, string> = {};
        for (const item of results) {
          if (item.id && item.foto) {
            map[item.id] = item.foto;
          }
        }
        resolve(map);
      };

      req.onerror = () => {
        console.warn('Gagal membaca foto dari IndexedDB:', req.error);
        resolve({});
      };
    });
  } catch (err) {
    console.warn('Gagal membaca semua foto dari IndexedDB:', err);
    return {};
  }
}

/**
 * Clear all student photos from IndexedDB
 */
export async function clearAllPhotosFromIndexedDB(): Promise<void> {
  try {
    const db = await getPhotoDB();
    if (!db) return;

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const req = store.clear();

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Gagal membersihkan foto di IndexedDB:', err);
  }
}
