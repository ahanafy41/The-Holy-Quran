import * as api from './quranApi';
import { Reciter } from '../types';

/**
 * @constant {string}
 * @description The prefix used for naming caches that store audio files for different reciters.
 */
const AUDIO_CACHE_PREFIX = 'quran-audio-';

/**
 * @constant {string}
 * @description The name of the cache used for storing core Quran text data.
 */
const QURAN_DATA_CACHE_NAME = 'quran-app-data-v1';

/**
 * Generates a unique cache name for a given reciter.
 * @param {string} reciterIdentifier - The unique identifier for the reciter (e.g., 'ar.alafasy').
 * @returns {string} The full cache name (e.g., 'quran-audio-ar.alafasy').
 */
export const getReciterCacheName = (reciterIdentifier: string) => `${AUDIO_CACHE_PREFIX}${reciterIdentifier}`;

/**
 * Retrieves a list of reciter identifiers for whom audio data has been downloaded and cached.
 * It inspects the available cache names and filters for those matching the audio cache prefix.
 * @returns {Promise<string[]>} A promise that resolves to an array of reciter identifiers.
 */
export async function getDownloadedReciters(): Promise<string[]> {
    const keys = await caches.keys();
    return keys
        .filter(key => key.startsWith(AUDIO_CACHE_PREFIX))
        .map(key => key.replace(AUDIO_CACHE_PREFIX, ''));
}

/**
 * Checks if the core Quran text data has been downloaded and is available in the cache.
 * @returns {Promise<boolean>} A promise that resolves to `true` if the data is cached, `false` otherwise.
 */
export async function isQuranDataDownloaded(): Promise<boolean> {
    return caches.has(QURAN_DATA_CACHE_NAME);
}

/**
 * Downloads and caches the core Quran text data for all 114 Surahs.
 * This includes the list of surahs and the text for each surah from a simple, clean edition.
 * If the download fails at any point, it cleans up by deleting the cache to avoid partial data.
 * @param {(progress: number) => void} onProgress - A callback function that is invoked with the download progress (a value from 0 to 1).
 * @returns {Promise<void>} A promise that resolves when the download is complete.
 * @throws Will throw an error if any of the network requests fail.
 */
export async function downloadQuranData(onProgress: (progress: number) => void): Promise<void> {
    const cache = await caches.open(QURAN_DATA_CACHE_NAME);
    const totalSurahsToFetch = 114;
    const textEdition = 'quran-simple'; // A clean, text-only version

    try {
        // First, cache the list of surahs itself for offline index access
        const surahListUrl = 'https://api.alquran.cloud/v1/surah';
        const surahListRes = await fetch(surahListUrl);
        if (!surahListRes.ok) throw new Error('Failed to fetch surah list');
        await cache.put(new Request(surahListUrl), surahListRes);

        // Then, cache the text for all 114 surahs
        for (let i = 1; i <= totalSurahsToFetch; i++) {
            // Using a direct fetch request to be explicit about what we're caching
            const surahUrl = `https://api.alquran.cloud/v1/surah/${i}/${textEdition}`;
            const surahRes = await fetch(surahUrl);
            if (!surahRes.ok) throw new Error(`Failed to fetch Surah ${i}`);
            await cache.put(new Request(surahUrl), surahRes);
            onProgress(i / totalSurahsToFetch);
        }
    } catch (e) {
        console.error('Failed during Quran data download', e);
        // Clean up partial download by deleting the cache on failure
        await caches.delete(QURAN_DATA_CACHE_NAME);
        throw new Error('Failed to download Quran data.');
    }
}

/**
 * Deletes the cached Quran text data.
 * @returns {Promise<boolean>} A promise that resolves to `true` if the cache was successfully deleted.
 */
export async function deleteQuranData(): Promise<boolean> {
    return caches.delete(QURAN_DATA_CACHE_NAME);
}

/**
 * Downloads and caches all audio files for a specific reciter for all 114 Surahs.
 * It fetches the audio URLs for each ayah (including primary and secondary sources) and caches them.
 * @param {Reciter} reciter - The reciter object for whom to download the audio.
 * @param {(progress: number) => void} onProgress - A callback function that is invoked with the download progress (a value from 0 to 1).
 * @returns {Promise<void>} A promise that resolves when the download is complete.
 * @throws Will throw an error if fetching a surah's data fails during the process.
 */
export async function downloadReciter(reciter: Reciter, onProgress: (progress: number) => void): Promise<void> {
    const cacheName = getReciterCacheName(reciter.identifier);
    const cache = await caches.open(cacheName);
    
    const totalSurahsToFetch = 114;
    let fetchedCount = 0;

    for (let i = 1; i <= totalSurahsToFetch; i++) {
        try {
            const surah = await api.getSurah(i, reciter.identifier);
            const urls = surah.ayahs.flatMap(ayah => [ayah.audio, ...(ayah.audioSecondarys || [])]).filter(Boolean);
            const uniqueUrls = [...new Set(urls)].map(url => new Request(url, { mode: 'no-cors' })); // Use no-cors for opaque responses
            await cache.addAll(uniqueUrls);
        } catch (e) {
            console.error(`Failed to download and cache Surah ${i} for reciter ${reciter.identifier}`, e);
            throw new Error(`Failed during download of Surah ${i}.`);
        }
        fetchedCount++;
        onProgress(fetchedCount / totalSurahsToFetch);
    }
}

/**
 * Deletes the cached audio data for a specific reciter.
 * @param {string} reciterIdentifier - The identifier of the reciter whose cache should be deleted.
 * @returns {Promise<boolean>} A promise that resolves to `true` if the cache was successfully deleted.
 */
export async function deleteReciter(reciterIdentifier: string): Promise<boolean> {
    const cacheName = getReciterCacheName(reciterIdentifier);
    return caches.delete(cacheName);
}