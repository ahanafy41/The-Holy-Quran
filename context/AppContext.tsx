
import { createContext, useContext } from 'react';
import { Ayah, Surah, SurahSimple, Reciter, Tafsir, AppSettings, TafsirInfo, QuranDivision, SavedSection, ListeningReciter, RadioStation } from '../types';

export interface DivisionInfo extends QuranDivision {
    title: string;
}

export type View = 'home' | 'index' | 'reader' | 'listen' | 'division' | 'memorization' | 'radio' | 'hisn-al-muslim' | 'hadith' | 'bookmarks' | 'more';

export interface AppContextType {
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  memorizationReciters: Reciter[];
  listeningReciters: ListeningReciter[];
  radioStations: RadioStation[];
  tafsirInfoList: TafsirInfo[];
  surahList: SurahSimple[];
  currentSurah: Surah | null;
  loadSurah: (surahNumber: number) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  setError: (message: string | null) => void;
  setSuccessMessage: (message: string | null) => void;
  activeAyah: Ayah | null;
  targetAyah: number | null;
  setTargetAyah: (ayah: number | null) => void;
  playAyah: (ayah: Ayah) => void;
  pauseAyah: () => void;
  isPlaying: boolean;
  navigateTo: (view: View, params?: { surahNumber?: number; ayahNumber?: number, division?: DivisionInfo }) => void;
  showTafsir: (ayah: Ayah) => void;
  showAIAssistant: (ayah: Ayah) => void;
  showSearch: () => void;
  showSettings: () => void;
  scrollToTop: () => void;
  apiKey: string | null;
  updateApiKey: (key: string) => void;
  view: View;
  savedSections: SavedSection[];
  addSavedSection: (section: Omit<SavedSection, 'id'>) => void;
  removeSavedSection: (sectionId: string) => void;
  isStandalone: boolean;
  canInstall: boolean;
  triggerInstall: () => void;
}

export const AppContext = createContext<AppContextType | null>(null);

export const useApp = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
};