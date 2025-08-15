import { Surah, SurahSimple, Reciter, TafsirInfo, Tafsir, Ayah } from '../types';

const BASE_URL = 'https://api.alquran.cloud/v1';

async function fetchWithRetry(url: string, retries = 3, backoff = 1000) {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                // Retry on 5xx server errors
                if (response.status >= 500 && i < retries - 1) {
                    await new Promise(res => setTimeout(res, backoff * (i + 1)));
                    continue;
                }
                throw new Error(`API call failed: ${response.statusText} (status: ${response.status})`);
            }
            return response.json();
        } catch (error) {
            console.error(`Fetch error for ${url} (attempt ${i + 1}/${retries}):`, error);
            if (i === retries - 1) throw error;
            // Wait before retrying
            await new Promise(res => setTimeout(res, backoff * (i + 1)));
        }
    }
    throw new Error(`Failed to fetch ${url} after ${retries} attempts.`);
}


async function fetchAPI<T,>(endpoint: string): Promise<T> {
  try {
    const data = await fetchWithRetry(`${BASE_URL}/${endpoint}`);
    if (data.status !== 'OK') {
      throw new Error(`API Error: ${data.data || 'Unknown API error'}`);
    }
    return data.data as T;
  } catch (error) {
    console.error(`Error processing API call for ${endpoint}:`, error);
    throw error;
  }
}

// Helper to add a fallback audio URL from a more reliable CDN (everyayah.com)
const addFallbackAudioSource = (ayah: Ayah, surahNumber: number, reciterIdentifier: string): Ayah => {
    // Maps API reciter identifier to the folder name on everyayah.com
    const reciterKey = reciterIdentifier.startsWith('ar.') ? reciterIdentifier.substring(3) : reciterIdentifier;
    
    const reciterFolderMap: { [key: string]: string } = {
        'alafasy': 'Alafasy_128kbps',
        'misharyrashidalafasy': 'Alafasy_128kbps',
        'mahermuaiqly': 'Maher_AlMuaiqly_64kbps',
        'husary': 'Husary_128kbps',
        'abdulbasitmurattal': 'Abdul_Basit_Murattal_128kbps',
        'sudais': 'Abdurrahmaan_As-Sudais_128kbps',
        'saoodshuraym': 'Saood_ash-Shuraym_128kbps',
        'abdullahbasfar': 'Abdullah_Basfar_128kbps',
        // Note: some reciters from alquran.cloud might not be on everyayah.com
    };

    const reciterFolder = reciterFolderMap[reciterKey.toLowerCase()];

    if (reciterFolder) {
        const surahPad = String(surahNumber).padStart(3, '0');
        const ayahPad = String(ayah.numberInSurah).padStart(3, '0');
        // This is a known reliable verse-by-verse source
        const fallbackUrl = `https://everyayah.com/data/${reciterFolder}/${surahPad}${ayahPad}.mp3`;

        if (!ayah.audioSecondarys) {
            ayah.audioSecondarys = [];
        }
        // Add the new fallback if it's not already in the list.
        // Prepending ensures it's tried first after the primary URL fails.
        if (!ayah.audioSecondarys.includes(fallbackUrl)) {
            ayah.audioSecondarys.unshift(fallbackUrl);
        }
    }
    return ayah;
};

export const getSurahList = (): Promise<SurahSimple[]> => {
  return fetchAPI<SurahSimple[]>('surah');
};

export const getSurah = async (surahNumber: number, reciterIdentifier: string): Promise<Surah> => {
  const surah = await fetchAPI<Surah>(`surah/${surahNumber}/${reciterIdentifier}`);
  
  // Create a simple surah object to attach to each ayah for context.
  const surahInfoForAyahs: SurahSimple = {
    number: surah.number,
    name: surah.name,
    englishName: surah.englishName,
    numberOfAyahs: surah.ayahs.length,
    revelationType: surah.revelationType,
  };

  // Augment each ayah with a robust fallback audio source and the parent surah info.
  // This is crucial because the /surah endpoint doesn't nest surah info inside each ayah.
  surah.ayahs = surah.ayahs.map(ayah => {
    const augmentedAyah = addFallbackAudioSource(ayah, surah.number, reciterIdentifier);
    augmentedAyah.surah = surahInfoForAyahs;
    return augmentedAyah;
  });
  
  return surah;
};

export const getAyah = async (ayahNumber: number, reciterIdentifier: string): Promise<Ayah> => {
    const ayah = await fetchAPI<Ayah>(`ayah/${ayahNumber}/${reciterIdentifier}`);
    // Augment with a robust fallback audio source if surah info is available
    if (ayah.surah) {
        return addFallbackAudioSource(ayah, ayah.surah.number, reciterIdentifier);
    }
    return ayah;
};

export const getReciters = (): Promise<Reciter[]> => {
    return fetchAPI<Reciter[]>('edition/format/audio')
        .then(reciters => reciters.filter(r => r.type === 'versebyverse'));
};

export const getTafsirInfo = (): Promise<TafsirInfo[]> => {
  return fetchAPI<TafsirInfo[]>('edition/type/tafsir');
};

export const getTafsirForAyahWithEdition = (editionIdentifier: string, surahNumber: number, ayahNumber: number): Promise<Tafsir> => {
  return fetchAPI<Tafsir>(`ayah/${surahNumber}:${ayahNumber}/${editionIdentifier}`);
};
