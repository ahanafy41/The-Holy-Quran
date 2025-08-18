import { SearchResult } from '../types';
import * as api from './quranApi';

/**
 * Searches the Quran for a given query using the alquran.cloud API.
 * @param query The user's search string.
 * @returns A promise that resolves to an array of matching ayahs.
 */
export const searchQuran = async (query: string): Promise<SearchResult[]> => {
    return api.searchQuran(query);
};
