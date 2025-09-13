import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { getRadioStations } from './quranApi';

// Mock the global fetch function
global.fetch = vi.fn();

describe('getRadioStations with Radio Browser API', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    it('should fetch stations, map them correctly, and prioritize the Cairo station', async () => {
        const mockApiResponse = [
            { stationuuid: '1', name: 'Other Quran Radio', url: 'http://other.com', url_resolved: 'http://other.com/resolved' },
            { stationuuid: '2', name: 'إذاعة القرآن الكريم من القاهرة', url: 'http://cairo.com', url_resolved: 'http://cairo.com/resolved' },
            { stationuuid: '3', name: 'Another Quran Station', url: 'http://another.com', url_resolved: 'http://another.com/resolved' },
        ];

        (fetch as any).mockResolvedValue({
            ok: true,
            json: () => Promise.resolve(mockApiResponse),
        });

        const stations = await getRadioStations();

        // 1. Should return the correct number of stations
        expect(stations.length).toBe(3);

        // 2. The Cairo station should be first
        expect(stations[0].name).toBe('إذاعة القرآن الكريم من القاهرة');
        expect(stations[0].id).toBe('2');

        // 3. Check if mapping is correct
        expect(stations[1].id).toBe('1');
        expect(stations[1].name).toBe('Other Quran Radio');
        expect(stations[1].url).toBe('http://other.com/resolved'); // Should prefer url_resolved
    });

    it('should return an empty array if the API call fails', async () => {
        // Mock a failed API response
        (fetch as any).mockRejectedValue(new Error('API is down'));

        const stations = await getRadioStations();

        expect(stations).toEqual([]);
    });

    it('should handle an empty response from the API', async () => {
        (fetch as any).mockResolvedValue({
            ok: true,
            json: () => Promise.resolve([]),
        });

        const stations = await getRadioStations();
        expect(stations).toEqual([]);
    });

    it('should correctly handle the case where the Cairo station is not in the list', async () => {
        const mockApiResponse = [
            { stationuuid: '1', name: 'Other Quran Radio', url: 'http://other.com', url_resolved: '' },
            { stationuuid: '3', name: 'Another Quran Station', url: 'http://another.com', url_resolved: 'http://another.com/resolved' },
        ];

        (fetch as any).mockResolvedValue({
            ok: true,
            json: () => Promise.resolve(mockApiResponse),
        });

        const stations = await getRadioStations();

        expect(stations.length).toBe(2);
        expect(stations[0].name).not.toBe('إذاعة القرآن الكريم من القاهرة');
        // Check that it uses url when url_resolved is empty
        expect(stations[0].url).toBe('http://other.com');
    });
});
