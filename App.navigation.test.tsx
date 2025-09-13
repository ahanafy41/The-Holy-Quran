import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import App from './App';
import React from 'react';

// Mock the entire services module to prevent real API calls during navigation tests
vi.mock('./services/quranApi', () => ({
    getSurahList: vi.fn().mockResolvedValue([{ number: 1, name: 'الفاتحة', englishName: 'Al-Fatiha', numberOfAyahs: 7 }]),
    getVerseByVerseReciters: vi.fn().mockResolvedValue([]),
    getListeningReciters: vi.fn().mockResolvedValue([
        { identifier: '1', name: 'Test Reciter', rewaya: 'Hafs', server: 'server.com' }
    ]),
    getTafsirInfo: vi.fn().mockResolvedValue([]),
    getRadioStations: vi.fn().mockResolvedValue([]),
    getSurah: vi.fn().mockResolvedValue({ ayahs: [] }),
}));

// Mock the IntersectionObserver
const mockIntersectionObserver = vi.fn();
mockIntersectionObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null,
});
window.IntersectionObserver = mockIntersectionObserver;

// Mock the matchMedia
window.matchMedia = vi.fn().mockImplementation(query => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(), // deprecated
  removeListener: vi.fn(), // deprecated
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
}));


describe('App Navigation', () => {
  it('should navigate forward and backward using browser history', async () => {
    render(<App />);

    // 1. Initially, we are on the IndexPage
    // Use `findBy` to wait for any initial async operations
    const indexHeading = await screen.findByRole('heading', { name: /فهرس القرآن/i });
    expect(indexHeading).toBeInTheDocument();

    // 2. Simulate navigating to the "Listen" page
    const listenButton = screen.getByRole('button', { name: /الاستماع/i });
    fireEvent.click(listenButton);

    // 3. Verify we are on the ListenPage
    await waitFor(() => {
        const listenHeading = screen.getByRole('heading', { name: /اختر القارئ/i });
        expect(listenHeading).toBeInTheDocument();
    });

    // 4. Simulate the user pressing the back button
    fireEvent.popState(window, {
        state: { view: 'index', params: {} }
    });

    // 5. Verify we are back on the IndexPage
    const indexHeadingAfterBack = await screen.findByRole('heading', { name: /فهرس القرآن/i });
    expect(indexHeadingAfterBack).toBeInTheDocument();
  });
});
