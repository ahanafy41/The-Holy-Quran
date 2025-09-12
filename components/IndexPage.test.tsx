import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { IndexPage } from './IndexPage';
import { AppContext } from '../context/AppContext';
import React from 'react';

// Mock the context provider
const mockContext = {
  surahList: Array.from({ length: 114 }, (_, i) => ({ number: i + 1, name: `Surah ${i + 1}` })),
  navigateTo: vi.fn(),
  savedSections: [],
  // Add any other required context properties with mock values
  settings: { darkMode: false, memorizationReciter: 'ar.alafasy', tafsir: 'ar.muyassar' },
  updateSettings: vi.fn(),
  memorizationReciters: [],
  listeningReciters: [],
  radioStations: [],
  tafsirInfoList: [],
  currentSurah: null,
  loadSurah: vi.fn(),
  isLoading: false,
  error: null,
  setError: vi.fn(),
  setSuccessMessage: vi.fn(),
  activeAyah: null,
  targetAyah: null,
  setTargetAyah: vi.fn(),
  playAyah: vi.fn(),
  pauseAyah: vi.fn(),
  isPlaying: false,
  showTafsir: vi.fn(),
  showAIAssistant: vi.fn(),
  showSearch: vi.fn(),
  showSettings: vi.fn(),
  view: 'index',
  scrollToTop: vi.fn(),
  addSavedSection: vi.fn(),
  removeSavedSection: vi.fn(),
  apiKey: null,
  updateApiKey: vi.fn(),
  isStandalone: false,
  canInstall: false,
  triggerInstall: vi.fn(),
  lastReadPosition: null,
  updateLastReadPosition: vi.fn(),
  bookmarks: [],
  addBookmark: vi.fn(),
  removeBookmark: vi.fn(),
};

describe('IndexPage Component', () => {
  it('should render the main heading', () => {
    render(
      <AppContext.Provider value={mockContext as any}>
        <IndexPage />
      </AppContext.Provider>
    );

    // Check if the main title "فهرس القرآن" is rendered
    const heading = screen.getByRole('heading', { name: /فهرس القرآن/i });
    expect(heading).toBeInTheDocument();

    // Check if the subtitle is rendered
    const subtitle = screen.getByText(/تصفح حسب السور، الأجزاء، الصفحات، والمزيد/i);
    expect(subtitle).toBeInTheDocument();
  });
});
