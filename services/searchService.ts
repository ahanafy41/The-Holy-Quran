import Fuse from 'fuse.js';
import { SearchResult, QuranAyah } from '../types';
import { quranText } from '../data/quran-text';
import { normalizeArabic } from '../utils/text';

/**
 * @constant
 * @type {Fuse.IFuseOptions<QuranAyah>}
 * @description Configuration options for Fuse.js search.
 * - `includeScore`: Includes the search score in the results.
 * - `keys`: Specifies the properties to search within each object (searching in the pre-normalized Arabic text).
 * - `threshold`: Sets the tolerance for fuzzy searching (0.0 for perfect match, 1.0 for any match). A value of 0.3 provides a good balance.
 * - `ignoreLocation`: Allows matches to be found anywhere in the string, not just at the beginning.
 */
const fuseOptions = {
    includeScore: true,
    // Search in `normalizedText` of the Ayah object
    keys: ['normalizedText'],
    // A threshold of 0.3 seems to be a good balance between accuracy and fuzziness
    threshold: 0.3,
    // Do not sort by location, as we want to find matches anywhere in the text
    ignoreLocation: true,
};

/**
 * @constant
 * @type {Fuse<QuranAyah>}
 * @description A pre-initialized Fuse.js instance for performing searches on the entire Quran text.
 * This is created once to avoid the performance overhead of re-indexing on every search.
 */
const fuse = new Fuse(quranText, fuseOptions);

/**
 * Searches the Quran for a given query using a pre-processed local data source with Fuse.js.
 * This provides a fast, client-side fuzzy search capability. The search is performed on normalized Arabic text
 * to ensure that variations in diacritics or letter forms do not affect the search results.
 *
 * @param {string} query The user's search string. It will be normalized before being used in the search.
 * @returns {Promise<SearchResult[]>} A promise that resolves to an array of the top 20 matching ayahs,
 * formatted as `SearchResult` objects. Returns an empty array if the query is too short (less than 2 characters)
 * or if no matches are found.
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
