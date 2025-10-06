
import { Surah, SurahSimple, Reciter, TafsirInfo, Tafsir, Ayah, SearchResult, ListeningReciter, RadioStation } from '../types';

const BASE_URL = 'https://api.alquran.cloud/v1';
const MP3QURAN_API_URL = 'https://www.mp3quran.net/api/v3';
const RADIO_BROWSER_API_URL = 'https://de1.api.radio-browser.info/json';


/**
 * Rewrites a URL from cdn.islamic.network to use the universal proxy path.
 * This works for both local dev (Vite proxy) and production (Netlify proxy).
 * @param {string} url The original URL.
 * @returns {string} The rewritten URL.
 */
const rewriteUrlForProxy = (url: string): string => {
  // Check if the URL is valid and for the specific CDN that needs proxying.
  if (url && url.includes('//cdn.islamic.network')) {
    try {
      const urlObject = new URL(url);
      // Always rewrite the URL to use the universal proxy path.
      return `/islamic-network-proxy${urlObject.pathname}${urlObject.search}`;
    } catch (e) {
      // If URL parsing fails, log the error and return the original URL.
      console.error(`Invalid URL for proxying: ${url}`, e);
      return url;
    }
  }
  return url;
};


// For mp3quran.net API
interface MP3QuranReciter {
    id: number;
    name: string;
    rewaya: string;
    count: string;
    suras: string;
    moshaf: Moshaf[];
}
interface Moshaf {
    id: number;
    name: string;
    server: string;
    surah_total: number;
    surah_list: string;
}

/**
 * Fetches data from a URL with a specified number of retries and exponential backoff.
 * This is useful for handling transient network errors or temporary server issues.
 * @param {string} url The URL to fetch.
 * @param {number} [retries=3] The maximum number of retries.
 * @param {number} [backoff=1000] The initial backoff delay in milliseconds.
 * @returns {Promise<any>} A promise that resolves to the JSON response.
 * @throws Will throw an error if the fetch fails after all retries.
 */
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

/**
 * A generic wrapper for fetching data from the alquran.cloud API.
 * It handles the base URL, checks the API response status, and extracts the data.
 * @template T The expected type of the data to be returned.
 * @param {string} endpoint The API endpoint to fetch (e.g., 'surah').
 * @returns {Promise<T>} A promise that resolves to the data from the API.
 * @throws Will throw an error if the API call is unsuccessful.
 */
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

/**
 * A generic wrapper for fetching data from the mp3quran.net API.
 * @template T The expected type of the data to be returned.
 * @param {string} endpoint The API endpoint to fetch (e.g., 'reciters').
 * @returns {Promise<T>} A promise that resolves to the data from the API.
 * @throws Will throw an error if the API call is unsuccessful.
 */
async function fetchMP3QuranAPI<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${MP3QURAN_API_URL}/${endpoint}`);
  if (!response.ok) {
    throw new Error(`mp3quran.net API call failed: ${response.statusText}`);
  }
  const data = await response.json();
  return data.reciters as T;
}

/**
 * Fetches and processes a list of reciters for the audio listening feature from the mp3quran.net API.
 * It creates distinct display names for reciters with multiple recording styles (e.g., Murattal, Mujawwad).
 * It also manually prepends a specific reciter (Sheikh Muhammad Rifat) who has a partial recording.
 * @returns {Promise<ListeningReciter[]>} A promise that resolves to an array of listening reciters.
 */
export const getListeningReciters = async (): Promise<ListeningReciter[]> => {
    const rawReciters = await fetchMP3QuranAPI<MP3QuranReciter[]>('reciters?language=ar');
    const listeningReciters: ListeningReciter[] = [];

    rawReciters.forEach(reciter => {
        // Find all complete recordings (moshafs) for the reciter
        const completeMoshafs = reciter.moshaf.filter(m => m.surah_total === 114);
        
        completeMoshafs.forEach(moshaf => {
            // If a reciter has more than one style (e.g., Murattal, Mujawwad),
            // or if the style name is different from the rewaya, create a unique name.
            // This prevents duplicate-looking entries in the UI.
            const hasMultipleStyles = completeMoshafs.length > 1;
            const isDescriptiveStyle = moshaf.name && moshaf.name !== reciter.rewaya;

            const displayName = (hasMultipleStyles || isDescriptiveStyle)
                ? `${reciter.name} (${moshaf.name})`
                : reciter.name;

            listeningReciters.push({
                identifier: `${reciter.id}-${moshaf.id}`,
                name: displayName,
                rewaya: reciter.rewaya,
                server: moshaf.server,
            });
        });
    });

    // Manually add Sheikh Muhammad Rifat with his partial recording
    const muhammadRifatReciter: ListeningReciter = {
        identifier: '241-241',
        name: 'محمد رفعت (مرتل)',
        rewaya: 'حفص عن عاصم',
        server: 'https://server14.mp3quran.net/refat/',
        surah_list: "1,10,11,12,17,18,19,20,48,54,55,56,69,72,73,75,76,77,78,79,81,82,83,85,86,87,88,89,96,98,100"
    };
    listeningReciters.unshift(muhammadRifatReciter);

    return listeningReciters;
};

/**
 * Fetches a list of Quran radio stations from the mp3quran.net API.
 * It also prepends a hardcoded, verified URL for the popular "Quran Radio from Cairo" station to ensure its availability and place it first in the list.
 * @returns {Promise<RadioStation[]>} A promise that resolves to an array of radio stations.
 */
export const getRadioStations = async (): Promise<RadioStation[]> => {
    let stations: RadioStation[] = [];

    // Define the Cairo station with a known good URL.
    const cairoStation: RadioStation = {
        id: 999, // Assign a unique, high ID to avoid collisions
        name: 'إذاعة القرآن الكريم من القاهرة',
        url: 'https://stream.radiojar.com/8s5u5tpdtwzuv',
    };

    try {
        // Fetch the main list of stations
        const response = await fetch(`${MP3QURAN_API_URL}/radios?language=ar`);
        if (response.ok) {
            const data = await response.json();
            // Filter out any existing Cairo station to avoid duplicates
            stations = (data.radios as RadioStation[]).filter(
                station => !station.name.includes('القرآن الكريم من القاهرة')
            );
        } else {
            console.error(`mp3quran.net radio API call failed: ${response.statusText}`);
        }
    } catch (error) {
        console.error('Failed to fetch from mp3quran.net API, will only show the hardcoded station.', error);
    }

    // Prepend the verified Cairo station to the list so it's always first.
    return [cairoStation, ...stations];
};


/**
 * A helper function to augment an Ayah object with a fallback audio URL.
 * The primary audio source from alquran.cloud can sometimes be unreliable. This function adds a secondary URL
 * from everyayah.com, which is a more stable CDN for verse-by-verse audio.
 * @param {Ayah} ayah The original Ayah object.
 * @param {number} surahNumber The number of the surah the ayah belongs to.
 * @param {string} reciterIdentifier The identifier for the reciter (e.g., 'ar.alafasy').
 * @returns {Ayah} The Ayah object augmented with a fallback audio URL in the `audioSecondarys` array.
 */
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
        'faresabbad': 'Fares_Abbad_64kbps',
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

/**
 * Fetches the list of all Surahs in the Quran.
 * @returns {Promise<SurahSimple[]>} A promise that resolves to an array of simple Surah objects.
 */
export const getSurahList = (): Promise<SurahSimple[]> => {
  return fetchAPI<SurahSimple[]>('surah');
};

/**
 * Fetches a complete Surah, including all its ayahs, for a specific reciter.
 * It then augments each ayah with a fallback audio source and attaches a reference to the parent surah object.
 * This is necessary because the API response for a surah does not include surah metadata within each ayah object.
 * @param {number} surahNumber The number of the surah to fetch (1-114).
 * @param {string} reciterIdentifier The identifier for the desired reciter.
 * @returns {Promise<Surah>} A promise that resolves to the full Surah object.
 */
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

    // Apply the universal proxy to all relevant audio URLs to bypass CORS
    augmentedAyah.audio = rewriteUrlForProxy(augmentedAyah.audio);
    if (augmentedAyah.audioSecondarys) {
      augmentedAyah.audioSecondarys = augmentedAyah.audioSecondarys.map(rewriteUrlForProxy);
    }

    return augmentedAyah;
  });
  
  return surah;
};

/**
 * Fetches a single Ayah by its absolute number in the Quran for a specific reciter.
 * It also augments the ayah with a fallback audio source.
 * @param {number} ayahNumber The absolute number of the ayah in the Quran (1-6236).
 * @param {string} reciterIdentifier The identifier for the desired reciter.
 * @returns {Promise<Ayah>} A promise that resolves to the Ayah object.
 */
export const getAyah = async (ayahNumber: number, reciterIdentifier: string): Promise<Ayah> => {
    let ayah = await fetchAPI<Ayah>(`ayah/${ayahNumber}/${reciterIdentifier}`);
    // Augment with a robust fallback audio source if surah info is available
    if (ayah.surah) {
        ayah = addFallbackAudioSource(ayah, ayah.surah.number, reciterIdentifier);
    }

    // Apply the universal proxy to all relevant audio URLs
    ayah.audio = rewriteUrlForProxy(ayah.audio);
    if (ayah.audioSecondarys) {
      ayah.audioSecondarys = ayah.audioSecondarys.map(rewriteUrlForProxy);
    }

    return ayah;
};

/**
 * Fetches a list of reciters who provide verse-by-verse audio.
 * It filters the general list of audio editions to only include 'versebyverse' types.
 * It also manually prepends Fares Abbad to the list if he is not already present, ensuring his availability.
 * @returns {Promise<Reciter[]>} A promise that resolves to an array of verse-by-verse reciter objects.
 */
export const getVerseByVerseReciters = async (): Promise<Reciter[]> => {
    const reciters = await fetchAPI<Reciter[]>('edition/format/audio');
    const filteredReciters = reciters.filter(r => r.type === 'versebyverse');
    
    const faresAbbadIdentifier = 'ar.faresabbad';
    const faresAbbadExists = filteredReciters.some(r => r.identifier === faresAbbadIdentifier);

    if (!faresAbbadExists) {
        const faresAbbadReciter: Reciter = {
            identifier: faresAbbadIdentifier,
            language: 'ar',
            name: 'فارس عباد',
            englishName: 'Fares Abbad',
            format: 'audio/mpeg',
            type: 'versebyverse',
        };
        // Prepend him to the list to make him easy to find and select by default
        return [faresAbbadReciter, ...filteredReciters];
    }
    
    return filteredReciters;
};

/**
 * Fetches the list of available Tafsir editions.
 * @returns {Promise<TafsirInfo[]>} A promise that resolves to an array of Tafsir information objects.
 */
export const getTafsirInfo = (): Promise<TafsirInfo[]> => {
  return fetchAPI<TafsirInfo[]>('edition/type/tafsir');
};

/**
 * Fetches the Tafsir for a specific ayah from a specific Tafsir edition.
 * @param {string} editionIdentifier The identifier of the Tafsir edition (e.g., 'ar.muyassar').
 * @param {number} surahNumber The number of the surah.
 * @param {number} ayahNumber The number of the ayah within the surah.
 * @returns {Promise<Tafsir>} A promise that resolves to the Tafsir object.
 */
import tafsirMuyassar from '../data/tafsir_muyassar.json';

// Local cache for tafsir data to avoid re-reading from JSON file
const localTafsirCache: { [key: string]: Tafsir } = {};


/**
 * Fetches the Tafsir for a specific ayah from a specific Tafsir edition.
 * It prioritizes loading from a local JSON file for "Tafsir Al-Muyassar"
 * to enable offline access and improve performance. For other editions,
 * it falls back to the external API.
 *
 * @param {string} editionIdentifier The identifier of the Tafsir edition (e.g., 'ar.muyassar').
 * @param {number} surahNumber The number of the surah.
 * @param {number} ayahNumber The number of the ayah within the surah.
 * @returns {Promise<Tafsir>} A promise that resolves to the Tafsir object.
 */
export const getTafsirForAyahWithEdition = async (editionIdentifier: string, surahNumber: number, ayahNumber: number): Promise<Tafsir> => {
  const cacheKey = `${editionIdentifier}-${surahNumber}-${ayahNumber}`;
  if (localTafsirCache[cacheKey]) {
    return localTafsirCache[cacheKey];
  }

  // Prioritize local data for Tafsir Al-Muyassar
  if (editionIdentifier === 'ar.muyassar') {
    try {
      const surahTafsirs = (tafsirMuyassar as any)[String(surahNumber)];
      if (surahTafsirs && surahTafsirs[String(ayahNumber)]) {
        const tafsir: Tafsir = {
          text: surahTafsirs[String(ayahNumber)],
          edition: {
            identifier: 'ar.muyassar',
            name: 'تفسير الميسر',
            language: 'ar',
            englishName: 'Al-Muyassar',
            type: 'tafsir'
          }
        };
        localTafsirCache[cacheKey] = tafsir;
        return tafsir;
      }
    } catch (e) {
      console.error("Error reading local tafsir, falling back to API.", e);
      // Fallback to API if local file is corrupt or missing
    }
  }

  // Fallback to API for other tafsirs or if local fails
  return fetchAPI<Tafsir>(`ayah/${surahNumber}:${ayahNumber}/${editionIdentifier}`);
};

// Types for API search results
interface ApiSearchMatch {
    number: number;
    text: string;
    surah: {
        number: number;
        name: string;
    };
    numberInSurah: number;
}

interface ApiSearchResult {
    count: number;
    matches: ApiSearchMatch[];
}

/**
 * Searches the Quran for a given query string.
 * It uses a specific clean text edition for more accurate search results.
 * The function handles cases where the query is empty or if the API returns no matches.
 * @param {string} query The search term.
 * @returns {Promise<SearchResult[]>} A promise that resolves to an array of search results.
 */
export const searchQuran = async (query: string): Promise<SearchResult[]> => {
  if (!query.trim()) {
    return [];
  }
  // Use a text edition that is good for searching
  const edition = 'quran-simple-clean'; 
  const encodedQuery = encodeURIComponent(query.trim());

  try {
    const data = await fetchAPI<ApiSearchResult>(`search/${encodedQuery}/all/${edition}`);
    if (!data || !data.matches) {
        return [];
    }

    return data.matches.map(match => ({
      surah: match.surah.number,
      ayah: match.numberInSurah,
      text: match.text,
      // These fields are not provided by the API but are part of the type.
      // They are not used in the search display, so empty strings are fine.
      normalizedText: '',
      normalizedTextNoSpaces: '',
    }));
  } catch (error) {
    // The API may return 404 for no matches, which fetchAPI treats as an error.
    // Gracefully handle this by returning an empty array.
    console.warn(`Search for "${query}" failed or returned no results. This is expected if there are no matches.`);
    return [];
  }
};
