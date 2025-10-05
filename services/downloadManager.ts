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
 * Downloads an array of files in batches, caches them, and reports progress based on actual file sizes.
 * This function first fetches the size of all files to provide an accurate progress indicator.
 * It downloads files in small batches to avoid overwhelming the browser.
 * @param urls - The array of URLs to download.
 * @param onProgress - A callback function to report progress (0-100).
 * @returns A promise that resolves to the total size of successfully downloaded files in bytes.
 */
export async function downloadAndCacheFiles(
    urls: string[],
    onProgress: (progress: number) => void
): Promise<number> {
    const cache = await caches.open(CACHE_NAME);
    const totalFiles = urls.length;
    let totalDownloadedSize = 0;

    // 1. Fetch all file sizes to calculate the total expected size for accurate progress.
    console.log('Calculating total download size...');
    const sizePromises = urls.map(url =>
        fetch(url, { method: 'HEAD' }).then(res => {
            if (res.ok && res.headers.has('Content-Length')) {
                return parseInt(res.headers.get('Content-Length') || '0', 10);
            }
            console.warn(`Could not get content-length for ${url}.`);
            return 0; // Fallback size if header is missing
        }).catch(() => 0) // Fallback on network error for a single HEAD request
    );

    const fileSizes = await Promise.all(sizePromises);
    const totalExpectedSize = fileSizes.reduce((sum, size) => sum + size, 0);
    const useSizeBasedProgress = totalExpectedSize > 0;

    if (useSizeBasedProgress) {
        console.log(`Total download size: ${(totalExpectedSize / (1024 * 1024)).toFixed(2)} MB`);
    } else {
        console.warn('Could not determine total download size. Progress will be based on file count.');
    }

    let processedBytes = 0;
    let processedFileCount = 0;
    const batchSize = 5; // Process 5 downloads at a time

    onProgress(0); // Initialize progress at 0%

    for (let i = 0; i < totalFiles; i += batchSize) {
        const batchUrls = urls.slice(i, i + batchSize);

        const downloadPromises = batchUrls.map(async (url, indexInBatch) => {
            const urlIndex = i + indexInBatch;
            try {
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
                }

                const responseToCache = response.clone();
                await cache.put(url, responseToCache);

                const blob = await response.blob();
                totalDownloadedSize += blob.size;

            } catch (error) {
                console.error(`Skipping file due to error: ${url}`, error);
            } finally {
                // Update progress based on the number of processed files (both success and failure).
                // This ensures the progress bar always reaches 100%.
                processedFileCount++;

                let progress = 0;
                if (useSizeBasedProgress) {
                    // For size-based progress, we increment by the *expected* size of the file
                    // to ensure a smooth progression to 100%, even if some files fail.
                    processedBytes += fileSizes[urlIndex] || 0;
                    progress = Math.round((processedBytes / totalExpectedSize) * 100);
                } else {
                    // Fallback to count-based progress if sizes couldn't be determined.
                    progress = Math.round((processedFileCount / totalFiles) * 100);
                }
                onProgress(progress);
            }
        });

        await Promise.all(downloadPromises);
    }

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