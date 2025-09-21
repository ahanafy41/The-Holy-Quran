import Fuse from 'fuse.js';
import { SearchResult, QuranAyah } from '../types';
import { quranText } from '../data/quran-text';
import { normalizeArabic } from '../utils/text';

const fuseOptions = {
    includeScore: true,
    // Search in `normalizedText` of the Ayah object
    keys: ['normalizedText'],
    // A threshold of 0.3 seems to be a good balance between accuracy and fuzziness
    threshold: 0.3,
    // Do not sort by location, as we want to find matches anywhere in the text
    ignoreLocation: true,
};

// Create a single Fuse instance for the entire Quran text for performance.
const fuse = new Fuse(quranText, fuseOptions);

/**
 * Searches the Quran for a given query using a pre-processed local data source with Fuse.js.
 * @param query The user's search string.
 * @returns A promise that resolves to an array of matching ayahs.
 */
export const searchQuran = async (query: string): Promise<SearchResult[]> => {
    const normalizedQuery = normalizeArabic(query.trim());

    if (!normalizedQuery) {
        return [];
    }

    if (normalizedQuery.length < 2) {
        return [];
    }

    // Use Fuse.js to perform a fuzzy search
    const fuseResults = fuse.search(normalizedQuery);

    // Format the results to match the SearchResult type, taking the top 20 results
    return fuseResults.slice(0, 20).map(result => ({
        surah: result.item.surah,
        ayah: result.item.ayah,
        text: result.item.text,
        normalizedText: result.item.normalizedText,
        normalizedTextNoSpaces: result.item.normalizedTextNoSpaces,
        score: result.score, // Optionally include the score for ranking
    }));
};
