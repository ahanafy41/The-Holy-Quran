
import { createContext, useContext } from 'react';
import { Ayah, Surah, SurahSimple, Reciter, Tafsir, AppSettings, TafsirInfo, QuranDivision, SavedSection, ListeningReciter, RadioStation } from '../types';

/**
 * @interface DivisionInfo
 * @extends QuranDivision
 * @description Represents information about a specific division of the Quran (e.g., Juz, Hizb), including a display title.
 * @property {string} title - The display title for the division (e.g., "Juz' 1", "Hizb 1").
 */
export interface DivisionInfo extends QuranDivision {
    title: string;
}

/**
 * @typedef {string} View
 * @description A type representing the different primary views or pages within the application.
 * This is used for navigation state management.
 */
export type View = 'home' | 'index' | 'reader' | 'listen' | 'division' | 'memorization' | 'radio' | 'hisn-al-muslim' | 'hadith' | 'bookmarks' | 'more' | 'word-meanings';

/**
 * @interface AppContextType
 * @description Defines the shape of the global application context. This context provides state and actions
 * to all components wrapped within the `AppProvider`.
 */
export interface AppContextType {
  /** The current application settings. */
  settings: AppSettings;
  /** Function to update one or more application settings. */
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  /** A list of available reciters for the memorization feature. */
  memorizationReciters: Reciter[];
  /** A list of available reciters for the general listening feature. */
  listeningReciters: ListeningReciter[];
  /** A list of available Quran radio stations. */
  radioStations: RadioStation[];
  /** A list of available Tafsir editions. */
  tafsirInfoList: TafsirInfo[];
  /** A simplified list of all Surahs in the Quran. */
  surahList: SurahSimple[];
  /** The currently loaded Surah object, including all its ayahs. */
  currentSurah: Surah | null;
  /** Asynchronously loads a surah's data into the `currentSurah` state. */
  loadSurah: (surahNumber: number) => Promise<void>;
  /** A boolean flag indicating if a primary data loading operation is in progress. */
  isLoading: boolean;
  /** A string containing the current error message, if any. */
  error: string | null;
  /** Function to set or clear the global error message. */
  setError: (message: string | null) => void;
  /** Function to set a temporary success message. */
  setSuccessMessage: (message: string | null) => void;
  /** The currently active Ayah, typically for audio playback. */
  activeAyah: Ayah | null;
  /** The Ayah number that the reader view should scroll to. */
  targetAyah: number | null;
  /** Function to set the target Ayah for scrolling. */
  setTargetAyah: (ayah: number | null) => void;
  /** Initiates playback for a specific Ayah. */
  playAyah: (ayah: Ayah) => void;
  /** Pauses the currently playing Ayah. */
  pauseAyah: () => void;
  /** A boolean flag indicating if audio is currently playing. */
  isPlaying: boolean;
  /** A centralized function to handle navigation between different application views. */
  navigateTo: (view: View, params?: { surahNumber?: number; ayahNumber?: number, division?: DivisionInfo }) => void;
  /** Opens the Tafsir modal for a given Ayah. */
  showTafsir: (ayah: Ayah) => void;
  /** Opens the AI Assistant modal for a given Ayah. */
  showAIAssistant: (ayah: Ayah) => void;
  /** Opens the search modal. */
  showSearch: () => void;
  /** Opens the settings modal. */
  showSettings: () => void;
  /** A function to trigger a scroll-to-top action in the current view. */
  scrollToTop: () => void;
  /** The user's Google AI API key. */
  apiKey: string | null;
  /** Function to update and persist the user's Google AI API key. */
  updateApiKey: (key: string) => void;
  /** The current active view of the application. */
  view: View;
  /** A string providing context for navigation, e.g., the name of a division. */
  navigationContext: string | null;
  /** Function to set the navigation context string. */
  setNavigationContext: (context: string | null) => void;
  /** An array of user-saved sections for memorization. */
  savedSections: SavedSection[];
  /** Adds a new section to the user's saved sections. */
  addSavedSection: (section: Omit<SavedSection, 'id'>) => void;
  /** Removes a section from the user's saved sections by its ID. */
  removeSavedSection: (sectionId: string) => void;
  /** A boolean flag indicating if the app is running in standalone (PWA) mode. */
  isStandalone: boolean;
  /** A boolean flag indicating if the PWA installation prompt is available. */
  canInstall: boolean;
  /** A function to trigger the PWA installation prompt. */
  triggerInstall: () => void;
}

/**
 * @constant AppContext
 * @description The React Context object for the application. It is initialized with `null` and
 * its value is provided by the `AppProvider` component.
 */
export const AppContext = createContext<AppContextType | null>(null);

/**
 * A custom hook for consuming the `AppContext`.
 * This is the preferred way for components to access the global application state and actions.
 * It ensures that the hook is used within a component tree that is a descendant of `AppProvider`.
 *
 * @returns {AppContextType} The global application context value.
 * @throws {Error} If the hook is used outside of an `AppProvider`.
 */
export const useApp = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
};