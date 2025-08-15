import { quranText as allQuranAyahs } from '../data/quran-text';
import { SearchResult } from '../types';
import { normalizeArabic } from '../utils/text';

/**
 * Searches the local Quran text data for a given query.
 * The search is multi-tiered for relevance:
 * 1. Exact phrase match.
 * 2. Match where all query words appear in the verse.
 * 3. Match where the query (with spaces removed) appears in the verse (with spaces removed).
 * @param query The user's search string.
 * @returns An array of matching ayahs, sorted by their position in the Quran.
 */
export const searchQuran = (query: string): SearchResult[] => {
    const trimmedQuery = query.trim();
    if (trimmedQuery.length === 0) {
        return [];
    }
    
    const normQuery = normalizeArabic(trimmedQuery);
    const normQueryNoSpaces = normQuery.replace(/\s+/g, '');
    const queryTokens = normQuery.split(' ').filter(t => t.length > 0);

    const matchedAyahKeys = new Set<string>();
    let results: SearchResult[] = [];

    // Tier 1: Exact Phrase Match
    const tier1Results = allQuranAyahs.filter(ayah => {
        if (ayah.normalizedText.includes(normQuery)) {
            const key = `${ayah.surah}:${ayah.ayah}`;
            if (!matchedAyahKeys.has(key)) {
                matchedAyahKeys.add(key);
                return true;
            }
        }
        return false;
    });
    results = [...results, ...tier1Results];

    // Tier 2: Token-based match (all words exist)
    if (queryTokens.length > 1) {
        const tier2Results = allQuranAyahs.filter(ayah => {
            const key = `${ayah.surah}:${ayah.ayah}`;
            if (matchedAyahKeys.has(key)) return false;

            for (const token of queryTokens) {
                if (!ayah.normalizedText.includes(token)) {
                    return false;
                }
            }
            
            matchedAyahKeys.add(key);
            return true;
        });
        results = [...results, ...tier2Results];
    }
    
    // Tier 3: Split-word match (e.g. "كل هو" matches "كلهو")
    if (normQueryNoSpaces.length > 2) {
         const tier3Results = allQuranAyahs.filter(ayah => {
            const key = `${ayah.surah}:${ayah.ayah}`;
            if (matchedAyahKeys.has(key)) return false;

            if (ayah.normalizedTextNoSpaces.includes(normQueryNoSpaces)) {
                matchedAyahKeys.add(key);
                return true;
            }
            return false;
        });
        results = [...results, ...tier3Results];
    }

    // Since results are added in tiers, they are already somewhat sorted by relevance.
    // Now sort by position in Quran for final display.
    results.sort((a, b) => {
        if (a.surah !== b.surah) return a.surah - b.surah;
        return a.ayah - b.ayah;
    });

    return results.slice(0, 50); // Limit results
};
