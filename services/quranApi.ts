
import { Surah, SurahSimple, Reciter, TafsirInfo, Tafsir, Ayah, SearchResult, ListeningReciter, RadioStation } from '../types';

const BASE_URL = 'https://api.alquran.cloud/v1';
const MP3QURAN_API_URL = 'https://www.mp3quran.net/api/v3';
const RADIO_BROWSER_API_URL = 'https://de1.api.radio-browser.info/json';


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

async function fetchMP3QuranAPI<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${MP3QURAN_API_URL}/${endpoint}`);
  if (!response.ok) {
    throw new Error(`mp3quran.net API call failed: ${response.statusText}`);
  }
  const data = await response.json();
  return data.reciters as T;
}

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

export const getRadioStations = async (): Promise<RadioStation[]> => {
    let stations: RadioStation[] = [];

    // Define the Cairo station with a known good URL.
    const cairoStation: RadioStation = {
        id: 999, // Assign a unique, high ID to avoid collisions
        name: 'إذاعة القرآن الكريم من القاهرة',
        url: 'http://n0e.radiojar.com/quran.mp3',
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

export const getTafsirInfo = (): Promise<TafsirInfo[]> => {
  return fetchAPI<TafsirInfo[]>('edition/type/tafsir');
};

export const getTafsirForAyahWithEdition = (editionIdentifier: string, surahNumber: number, ayahNumber: number): Promise<Tafsir> => {
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
