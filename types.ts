
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
  reciter: string;
  tafsir: string; // Storing tafsir identifier e.g., 'ar.muyassar'
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