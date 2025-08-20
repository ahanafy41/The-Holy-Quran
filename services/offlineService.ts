import * as api from './quranApi';
import { Reciter } from '../types';

const AUDIO_CACHE_PREFIX = 'quran-audio-';
const QURAN_DATA_CACHE_NAME = 'quran-app-data-v1';

export const getReciterCacheName = (reciterIdentifier: string) => `${AUDIO_CACHE_PREFIX}${reciterIdentifier}`;

export async function getDownloadedReciters(): Promise<string[]> {
    const keys = await caches.keys();
    return keys
        .filter(key => key.startsWith(AUDIO_CACHE_PREFIX))
        .map(key => key.replace(AUDIO_CACHE_PREFIX, ''));
}

export async function isQuranDataDownloaded(): Promise<boolean> {
    return caches.has(QURAN_DATA_CACHE_NAME);
}

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

export async function deleteQuranData(): Promise<boolean> {
    return caches.delete(QURAN_DATA_CACHE_NAME);
}

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

export async function deleteReciter(reciterIdentifier: string): Promise<boolean> {
    const cacheName = getReciterCacheName(reciterIdentifier);
    return caches.delete(cacheName);
}