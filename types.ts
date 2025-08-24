export interface Ayah {
  number: number;
  text: string;
  numberInSurah: number;
  juz: number;
  manzil: number;
  page: number;
  ruku: number;
  hizbQuarter: number;
  sajda: boolean;
  audio: string;
  audioSecondary: string[];
  surahId: number;
}

export interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  revelationType: string;
  verses: Ayah[];
}

export interface QuranData {
  surahs: Surah[];
}

export interface SurahSimple {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
}

export interface SavedSection {
  id: string;
  name: string;
  startSurah: number;
  startAyah: number;
  endSurah: number;
  endAyah: number;
  ayahs: Ayah[];
}

export interface QuranDivision {
  id: number;
  name: string;
  type: "juz" | "hizb" | "ruku";
  start: number;
  end: number;
}

export interface ListeningReciter {
  id: number;
  name: string;
  server: string;
}

export interface Reciter extends ListeningReciter {}

export interface AdhkarCategory {
    id: string;
    category: string;
    sections: {
        id: string;
        section: string;
        content: {
            text: string;
            count: number | string;
        }[];
    }[];
}