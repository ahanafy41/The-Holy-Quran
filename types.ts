
/** Represents a full Surah object, including all its ayahs. */
export interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  revelationType: 'Meccan' | 'Medinan';
  ayahs: Ayah[];
}

/** Represents a simplified Surah object, used in lists. */
export interface SurahSimple {
  number: number;
  name: string;
  englishName: string;
  numberOfAyahs: number;
  revelationType: 'Meccan' | 'Medinan';
}

/** Represents a single Ayah (verse) of the Quran. */
export interface Ayah {
  number: number;
  audio: string;
  audioSecondarys: string[];
  text: string;
  numberInSurah: number;
  juz: number;
  manzil: number;
  page: number;
  ruku: number;
  hizbQuarter: number;
  sajda: boolean | { id: number; recommended: boolean; obligatory: boolean };
  surah?: SurahSimple;
}

/** Represents a verse-by-verse reciter from the alquran.cloud API. */
export interface Reciter {
  identifier: string;
  language: string;
  name: string;
  englishName: string;
  format: 'audio/mpeg';
  type: 'surah' | 'versebyverse';
}

/** Represents a full-surah reciter from the mp3quran.net API. */
export interface ListeningReciter {
  identifier: string; // combination of id and moshaf id
  name: string;
  rewaya: string;
  server: string; // The base URL for audio files
  surah_list?: string; // Optional: comma-separated list of available surah numbers
}

/** Represents a single radio station. */
export interface RadioStation {
  id: number;
  name: string;
  url: string;
}

/** Represents a single Tafsir text for an ayah. */
export interface Tafsir {
  id: number;
  name: string;
  language: string;
  author: string;
  text: string;
}

/** Represents information about an available Tafsir edition. */
export interface TafsirInfo {
  identifier: string;
  language: string;
  name: string;
  englishName: string;
}

/** Represents the application's user-configurable settings. */
export interface AppSettings {
  darkMode: boolean;
  memorizationReciter: string; // for verse-by-verse
  tafsir: string; 
    liveAssistantVoice: string;
}

/** Represents a user-defined section of the Quran for memorization. */
export interface SavedSection {
  id: string;
  name: string;
  surahNumber: number;
  startAyah: number;
  endAyah: number;
}

/** Represents a structural division of the Quran (e.g., Juz, Hizb, Page). */
export interface QuranDivision {
  number: number;
  start: { surah: number; ayah: number };
  end: { surah: number; ayah: number };
  startSurahName?: string;
}

/** Represents a single ayah used in the local search index. */
export interface QuranAyah {
  surah: number;
  ayah: number;
  text: string;
  normalizedText: string;
  normalizedTextNoSpaces: string;
}

/** Represents the result of a search query. */
export type SearchResult = QuranAyah;

/** Represents a single dhikr (remembrance) from the Hisn al-Muslim collection. */
export interface HisnDhikr {
  id: number;
  text: string;
  count: number;
  audio: string;
  filename: string;
}

/** Represents a category of dhikr from the Hisn al-Muslim collection. */
export interface HisnCategory {
  id: number;
  category: string;
  audio: string;
  filename: string;
  array: HisnDhikr[];
}

/** Represents a single Hadith. */
export interface Hadith {
  id: number;
  idInBook: number;
  chapterId: number;
  bookId: number;
  arabic: string;
  english: {
    narrator: string;
    text: string;
  };
}

/** Represents a chapter within a Hadith book. */
export interface HadithChapter {
  id: number;
  bookId: number;
  arabic: string;
  english: string;
}

/** Represents a single Hadith book. */
export interface HadithBook {
  id: string;
  arabic: string;
  english: string;
}

/** Represents a full collection of Hadiths for a single book. */
export interface HadithCollection {
  chapters: HadithBook[];
  hadiths: Hadith[];
}

/** Represents the user's last-read position in the Quran. */
export interface LastReadPosition {
  surahNumber: number;
  ayahNumber: number;
  timestamp: number;
}

/** Represents a user-created bookmark. */
export interface Bookmark {
  id: string;
  name: string;
  surahNumber: number;
  ayahNumber: number;
  timestamp: number;
}
