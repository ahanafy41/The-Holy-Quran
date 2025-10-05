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
 * Downloads an array of files, caching them and reporting progress based on streamed data size.
 * This function uses ReadableStream to handle large files efficiently without high memory usage.
 * @param urls - The array of URLs to download.
 * @param onProgress - A callback function to report progress (0-100).
 * @returns A promise that resolves to the total size of successfully downloaded files in bytes.
 */
export async function downloadAndCacheFiles(
    urls: string[],
    onProgress: (progress: number) => void
): Promise<number> {
    const cache = await caches.open(CACHE_NAME);
    let totalDownloadedSize = 0;
    let totalExpectedSize = 0;

    // Use Promise.all to fetch all headers concurrently first to get total size.
    const sizePromises = urls.map(url =>
        fetch(url, { method: 'HEAD' }).then(res => {
            if (res.ok && res.headers.has('Content-Length')) {
                return parseInt(res.headers.get('Content-Length') || '0', 10);
            }
            return 0;
        }).catch(() => 0)
    );

    const fileSizes = await Promise.all(sizePromises);
    totalExpectedSize = fileSizes.reduce((sum, size) => sum + size, 0);

    let cumulativeDownloaded = 0;

    for (let i = 0; i < urls.length; i++) {
        const url = urls[i];
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Failed to fetch ${url}`);
            if (!response.body) throw new Error('Response body is null');

            const reader = response.body.getReader();
            const chunks: Uint8Array[] = [];
            let receivedLength = 0;

            // eslint-disable-next-line no-constant-condition
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                chunks.push(value);
                receivedLength += value.length;

                if (totalExpectedSize > 0) {
                    const currentProgress = ((cumulativeDownloaded + receivedLength) / totalExpectedSize) * 100;
                    onProgress(Math.min(100, Math.round(currentProgress)));
                }
            }

            const blob = new Blob(chunks);
            totalDownloadedSize += blob.size;
            cumulativeDownloaded += fileSizes[i] || blob.size; // Use pre-fetched size for more stable progress

            const blobResponse = new Response(blob, {
                headers: response.headers,
            });

            await cache.put(url, blobResponse);
        } catch (error) {
            console.error(`Failed to download or cache ${url}:`, error);
            // Re-throw the error to ensure the calling component (SmartDownloadButton)
            // is aware of the failure and can update its state accordingly.
            throw error;
        }
    }

    onProgress(100); // Ensure it completes at 100%
    return totalDownloadedSize;
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