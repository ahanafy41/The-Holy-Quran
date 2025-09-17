
export interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  revelationType: 'Meccan' | 'Medinan';
  ayahs: Ayah[];
}

export interface SurahSimple {
  number: number;
  name: string;
  englishName: string;
  numberOfAyahs: number;
  revelationType: 'Meccan' | 'Medinan';
}

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

export interface Reciter {
  identifier: string;
  language: string;
  name: string;
  englishName: string;
  format: 'audio/mpeg';
  type: 'surah' | 'versebyverse';
}

// From mp3quran.net API
export interface ListeningReciter {
  identifier: string; // combination of id and moshaf id
  name: string;
  rewaya: string;
  server: string; // The base URL for audio files
  surah_list?: string; // Optional: comma-separated list of available surah numbers
}

export interface RadioStation {
  id: number;
  name: string;
  url: string;
}

export interface Tafsir {
  id: number;
  name: string;
  language: string;
  author: string;
  text: string;
}

export interface TafsirInfo {
  identifier: string;
  language: string;
  name: string;
  englishName: string;
}

export interface AppSettings {
  darkMode: boolean;
  memorizationReciter: string; // for verse-by-verse
  tafsir: string; 
}

export interface SavedSection {
  id: string;
  name: string;
  surahNumber: number;
  startAyah: number;
  endAyah: number;
}

export interface QuranDivision {
  number: number;
  start: { surah: number; ayah: number };
  end: { surah: number; ayah: number };
  startSurahName?: string;
}

export interface QuranAyah {
  surah: number;
  ayah: number;
  text: string;
  normalizedText: string;
  normalizedTextNoSpaces: string;
}

export type SearchResult = QuranAyah;

export interface HisnDhikr {
  id: number;
  text: string;
  count: number;
  audio: string;
  filename: string;
}

export interface HisnCategory {
  id: number;
  category: string;
  audio: string;
  filename: string;
  array: HisnDhikr[];
}

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

export interface HadithChapter {
  id: number;
  bookId: number;
  arabic: string;
  english: string;
}

export interface HadithBook {
  id: string;
  arabic: string;
  english: string;
}

export interface HadithCollection {
  chapters: HadithBook[];
  hadiths: Hadith[];
}

export interface LastReadPosition {
  surahNumber: number;
  ayahNumber: number;
  timestamp: number;
}

export interface Bookmark {
  id: string;
  name: string;
  surahNumber: number;
  ayahNumber: number;
  timestamp: number;
}

export interface WordMeaning {
  verse: string;
  word: string;
  meaning:string;
}
