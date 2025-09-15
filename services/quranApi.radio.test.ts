import { describe, it, expect, vi, afterEach } from 'vitest';
import { getRadioStations } from './quranApi';

// Mock the global fetch function
global.fetch = vi.fn();

describe('getRadioStations', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should always prepend the Cairo Quran Radio station to the list', async () => {
    // Mock a successful API response from mp3quran.net
    const mockStations = {
      radios: [
        { id: 1, name: 'Test Radio 1', url: 'http://test1.com' },
        { id: 2, name: 'Test Radio 2', url: 'http://test2.com' },
      ],
    };

    (fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockStations),
    });

    const stations = await getRadioStations();

    // 1. Check that the list is not empty and has the correct total number of stations
    expect(stations.length).toBe(3);

    // 2. Check that the first station is always the Cairo Quran Radio
    expect(stations[0].name).toBe('إذاعة القرآن الكريم من القاهرة');
    expect(stations[0].url).toBe('https://stream.radiojar.com/8s5u5tpdtwzuv');
    expect(stations[0].id).toBe(999);

    // 3. Check that the other stations are still present
    expect(stations[1].name).toBe('Test Radio 1');
  });

  it('should still return the Cairo station even if the fetch fails', async () => {
    // Mock a failed API response
    (fetch as any).mockRejectedValue(new Error('API is down'));

    const stations = await getRadioStations();

    // 1. Check that the list contains only the hardcoded Cairo station
    expect(stations.length).toBe(1);

    // 2. Check that the station is the Cairo Quran Radio
    expect(stations[0].name).toBe('إذاعة القرآن الكريم من القاهرة');
    expect(stations[0].url).toBe('https://stream.radiojar.com/8s5u5tpdtwzuv');
  });
});
