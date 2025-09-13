import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { getRadioStations, _clearRadioServerCache } from './quranApi';

// Mock the global fetch function
global.fetch = vi.fn();

describe('getRadioStations with Resilient API Logic', () => {

    beforeEach(() => {
        vi.resetAllMocks();
        _clearRadioServerCache();
    });

    const mockServers = [ { name: 'server1.com' }, { name: 'server2.com' } ];
    const mockStations = [
        { stationuuid: '1', name: 'Other Quran Radio', url: 'http://other.com', url_resolved: 'http://other.com/resolved' },
        { stationuuid: '2', name: 'إذاعة القرآن الكريم من القاهرة', url: 'http://cairo.com', url_resolved: 'http://cairo.com/resolved' },
    ];

    it('should fetch servers and then stations successfully on the first try', async () => {
        (fetch as any).mockImplementation((url: string) => {
            if (url.includes('servers')) {
                return Promise.resolve({ ok: true, json: () => Promise.resolve(mockServers) });
            }
            if (url.includes('stations')) {
                return Promise.resolve({ ok: true, json: () => Promise.resolve(mockStations) });
            }
            return Promise.reject(new Error('Unknown fetch call'));
        });

        const stations = await getRadioStations();
        expect(fetch).toHaveBeenCalledTimes(2);
        expect(stations.length).toBe(2);
        expect(stations[0].name).toBe('إذاعة القرآن الكريم من القاهرة');
    });

    it('should try the next server if the first one fails', async () => {
        let serverCallCount = 0;
        (fetch as any).mockImplementation((url: string) => {
            if (url.includes('servers')) {
                return Promise.resolve({ ok: true, json: () => Promise.resolve(mockServers) });
            }
            if (url.includes('stations')) {
                serverCallCount++;
                if (serverCallCount === 1) {
                    return Promise.reject(new Error('First server failed'));
                }
                return Promise.resolve({ ok: true, json: () => Promise.resolve(mockStations) });
            }
            return Promise.reject(new Error('Unknown fetch call'));
        });

        const stations = await getRadioStations();
        expect(fetch).toHaveBeenCalledTimes(3); // 1 for servers, 2 for stations
        expect(stations.length).toBe(2);
    });

    it('should return an empty array if all servers fail', async () => {
        (fetch as any).mockImplementation((url: string) => {
            if (url.includes('servers')) {
                return Promise.resolve({ ok: true, json: () => Promise.resolve(mockServers) });
            }
            return Promise.reject(new Error('All servers failed'));
        });

        const stations = await getRadioStations();
        expect(fetch).toHaveBeenCalledTimes(3); // 1 for servers, 2 for stations
        expect(stations).toEqual([]);
    });

    it('should use the fallback server if the server list API fails', async () => {
        (fetch as any).mockImplementation((url: string) => {
            if (url.includes('servers')) {
                return Promise.reject(new Error('Server list API down'));
            }
            if (url.includes('stations')) {
                return Promise.resolve({ ok: true, json: () => Promise.resolve(mockStations) });
            }
            return Promise.reject(new Error('Unknown fetch call'));
        });

        const stations = await getRadioStations();
        expect(fetch).toHaveBeenCalledTimes(2);
        expect(fetch).toHaveBeenCalledWith('https://de1.api.radio-browser.info/json/stations/search?tag=quran&hidebroken=true&limit=500');
        expect(stations.length).toBe(2);
    });
});
