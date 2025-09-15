import { SearchResult, QuranAyah } from '../types';
import { quranText } from '../data/quran-text';
import { normalizeArabic } from '../utils/text';

// Memoize the processed text for faster subsequent searches
const processedQuranText = new Map<string, QuranAyah[]>();

const getProcessedQuranText = (): QuranAyah[] => {
    const key = 'quran-text';
    if (processedQuranText.has(key)) {
        return processedQuranText.get(key)!;
    }
    // The pre-processing is already done in quran-text.ts, so we can just use it.
    processedQuranText.set(key, quranText);
    return quranText;
};


/**
 * Searches the Quran for a given query using a pre-processed local data source.
 * @param query The user's search string.
 * @returns A promise that resolves to an array of matching ayahs.
 */
export const searchQuran = async (query: string): Promise<SearchResult[]> => {
    const processedText = getProcessedQuranText();
    const normalizedQuery = normalizeArabic(query.trim());

    if (!normalizedQuery) {
        return [];
    }

    // For performance, filter out queries that are too short
    if (normalizedQuery.length < 2) {
        return [];
    }

    // Using a simple `filter` and `includes` for broad matching.
    // This is significantly faster than any API call.
    const searchResults = processedText.filter(ayah =>
        ayah.normalizedText.includes(normalizedQuery)
    );

    // Format the results to match the SearchResult type
    return searchResults.map(ayah => ({
        surah: ayah.surah,
        ayah: ayah.ayah,
        text: ayah.text,
        // The following fields are not strictly necessary for display but are part of the type.
        // We can leave them empty or fill them if needed later.
        normalizedText: ayah.normalizedText,
        normalizedTextNoSpaces: ayah.normalizedTextNoSpaces
    }));
};
