// =================================================================
// Download Manager
//
// This service will handle all logic related to downloading,
// storing, and managing offline content using IndexedDB and the Cache API.
// =================================================================

const DB_NAME = 'QuranAppDB';
const DB_VERSION = 1;
const STORE_NAME = 'downloads';
const CACHE_NAME = 'quran-app-offline-cache';

export interface DownloadedItem {
  id: string; // e.g., "surah-1", "reciter-alafasy", "hadith-bukhari"
  type: 'surah' | 'full_reciter' | 'hadith_book' | 'hisn_category' | 'memorization_section';
  name: string; // e.g., "سورة الفاتحة", "مشاري راشد العفاسي"
  urls: string[]; // List of all URLs associated with this item
  size: number; // Total size in bytes
  timestamp: number;
}

const isBrowser = typeof window !== 'undefined' && !!window.indexedDB && !!window.caches;

let db: IDBDatabase;

/**
 * Opens and initializes the IndexedDB database.
 * Creates the object store if it doesn't exist.
 */
function openDB(): Promise<IDBDatabase> {
  if (!isBrowser) {
    return Promise.reject(new Error('IndexedDB not supported in this environment.'));
  }
  return new Promise((resolve, reject) => {
    if (db) {
      return resolve(db);
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('IndexedDB error:', request.error);
      reject(new Error('Failed to open IndexedDB.'));
    };

    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const dbInstance = (event.target as IDBOpenDBRequest).result;
      if (!dbInstance.objectStoreNames.contains(STORE_NAME)) {
        dbInstance.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
}

/**
 * A simple function to test that the manager is initialized.
 */
/**
 * Adds a record of a downloaded item to IndexedDB.
 * @param item - The metadata of the item to add.
 */
export async function addDownloadedItem(item: DownloadedItem): Promise<void> {
  if (!isBrowser) return Promise.resolve();
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(item);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}

/**
 * Downloads an array of files, caches them, and reports progress.
 * @param urls - The array of URLs to download.
 * @param onProgress - A callback function to report progress (0-100).
 * @returns A promise that resolves to the total size of the downloaded files in bytes.
 */
export async function downloadAndCacheFiles(
  urls: string[],
  onProgress: (progress: number) => void
): Promise<number> {
  const cache = await caches.open(CACHE_NAME);
  let totalSize = 0;
  let downloadedCount = 0;

  // Use Promise.all to download files in parallel for better performance
  const downloadPromises = urls.map(async (url) => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
      }

      // Clone the response because it can only be consumed once.
      // One consumption for caching, one for getting the size.
      const responseToCache = response.clone();
      await cache.put(url, responseToCache);

      const blob = await response.blob();
      totalSize += blob.size;
    } catch (error) {
      console.error(`Skipping file due to error: ${url}`, error);
      // Re-throw to let the caller know a file failed, or handle it gracefully.
      // For now, we'll let it fail the entire batch if one file fails.
      throw error;
    } finally {
      downloadedCount++;
      const progress = Math.round((downloadedCount / urls.length) * 100);
      onProgress(progress);
    }
  });

  await Promise.all(downloadPromises);

  return totalSize;
}

/**
 * Retrieves the metadata for a single downloaded item from IndexedDB.
 * @param id - The unique ID of the item to retrieve.
 */
export async function getDownloadedItem(id: string): Promise<DownloadedItem | undefined> {
    if (!isBrowser) return Promise.resolve(undefined);
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(id);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

/**
 * Retrieves all downloaded items from IndexedDB.
 * @returns A promise that resolves to an array of all downloaded items.
 */
export async function getAllDownloadedItems(): Promise<DownloadedItem[]> {
    if (!isBrowser) return Promise.resolve([]);
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}


/**
 * Deletes an item's files from the Cache and its metadata from IndexedDB.
 * @param id - The unique ID of the item to delete.
 */
export async function removeDownloadedItem(id: string): Promise<void> {
  if (!isBrowser) return Promise.resolve();
  const db = await openDB();
  const item = await getDownloadedItem(id);

  // 1. Delete files from Cache
  if (item && item.urls.length > 0) {
    const cache = await caches.open(CACHE_NAME);
    for (const url of item.urls) {
      await cache.delete(url);
    }
  }

  // 2. Delete metadata from IndexedDB
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}


/**
 * A simple function to test that the manager is initialized.
 */
export async function initializeDownloadManager() {
    // IndexedDB is not available in SSR or test environments like JSDOM
    if (typeof window === 'undefined' || !window.indexedDB) {
        console.log('Skipping IndexedDB initialization in non-browser environment.');
        return;
    }
    try {
        await openDB();
        console.log('Download Manager Initialized: IndexedDB and Cache are ready.');
    } catch (error) {
        console.error('Failed to initialize Download Manager:', error);
    }
}

// Initialize the DB as soon as the module loads.
initializeDownloadManager();