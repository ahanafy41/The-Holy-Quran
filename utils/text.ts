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
