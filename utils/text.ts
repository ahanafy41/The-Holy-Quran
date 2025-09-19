import { QuranDivision } from '../types';

/**
 * Normalizes Arabic text to make it suitable for searching.
 * - Removes all diacritics (tashkeel).
 * - Standardizes different forms of Alef (أ, إ, آ) to a plain Alef (ا).
 * - Standardizes Ta Marbuta (ة) to Ha (ه).
 * - Standardizes Alef Maksura (ى) to Ya (ي).
 * @param text The Arabic string to normalize.
 * @returns The normalized string.
 */
export const normalizeArabic = (text: string): string => {
    return text
        .replace(/[\u064B-\u0652]/g, '') // Remove Arabic diacritics
        .replace(/[أإآ]/g, 'ا')        // Normalize Alef variants to plain Alef
        .replace(/ة/g, 'ه')           // Normalize Ta Marbuta to Ha
        .replace(/ى/g, 'ي');          // Normalize Alef Maksura to Ya
};

export const findCurrentDivision = (divisions: QuranDivision[], surahNumber: number, ayahNumber: number): QuranDivision | undefined => {
  const compare = (s1: number, a1: number, s2: number, a2: number) => {
    if (s1 < s2) return -1;
    if (s1 > s2) return 1;
    if (a1 < a2) return -1;
    if (a1 > a2) return 1;
    return 0;
  };

  return divisions.find(division => {
    const { start, end } = division;
    const isAfterStart = compare(surahNumber, ayahNumber, start.surah, start.ayah) >= 0;
    const isBeforeEnd = compare(surahNumber, ayahNumber, end.surah, end.ayah) <= 0;
    return isAfterStart && isBeforeEnd;
  });
};
