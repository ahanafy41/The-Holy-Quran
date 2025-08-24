export type Page = 'home' | 'index' | 'listen' | 'radio' | 'memorization_and_sections' | 'adhkar';

export interface Ayah {
    number: number;
    text: string;
    numberInSurah: number;
    juz: number;
    manzil: number;
    page: number;
    ruku: number;
    hizbQuarter: number;
    sajda: boolean | {
        id: number;
        recommended: boolean;
        obligatory: boolean;
    };
    audio?: string;
    audioSecondary?: string[];
}

export interface Surah {
    number: number;
    name: string;
    englishName: string;
    englishNameTranslation: string;
    revelationType: string;
    numberOfAyahs: number;
    ayahs: Ayah[];
}

export interface QuranData {
    surahs: Surah[];
}

export interface Tafsir {
    tafsir_id: number;
    tafsir_name: string;
    ayah_url: string;
    ayah_number: number;
    text: string;
}

export interface Section {
    id: string;
    name: string;
    startSurah: number;
    startAyah: number;
    endSurah: number;
    endAyah: number;
}

export interface QuranicDivision {
    type: 'juz' | 'hizb' | 'ruku';
    number: number;
    name: string;
    surah: number;
    ayah: number;
}