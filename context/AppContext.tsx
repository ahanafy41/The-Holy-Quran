import { createContext, useContext, ReactNode, useState, useEffect } from "react";
import { Ayah, SurahSimple, ListeningReciter, SavedSection, Reciter } from "../types";
import { quran } from "../data/quran-text";

interface AppContextType {
  showTafsirModal: boolean;
  setShowTafsirModal: (show: boolean) => void;
  showSettingsModal: boolean;
  setShowSettingsModal: (show: boolean) => void;
  showQuickAccessMenu: boolean;
  setShowQuickAccessMenu: (show: boolean) => void;
  showAIAssistantModal: boolean;
  setShowAIAssistantModal: (show: boolean) => void;
  selectedAyah: Ayah | null;
  setSelectedAyah: (ayah: Ayah | null) => void;
  quran: any; 
  surahsSimple: SurahSimple[];
  reciters: ListeningReciter[];
  selectedReciter: ListeningReciter;
  setSelectedReciter: (reciter: ListeningReciter) => void;
  savedSections: SavedSection[];
  addSavedSection: (section: Omit<SavedSection, 'id' | 'ayahs'>) => void;
  deleteSavedSection: (id: string) => void;
  currentTheme: "light" | "dark";
  setCurrentTheme: (theme: "light" | "dark") => void;
  selectedSurah: SurahSimple | null;
  setSelectedSurah: (surah: SurahSimple | null) => void;
  selectedRadio: any; 
  setSelectedRadio: (radio: any) => void;
  isRadioPlaying: boolean;
  setIsRadioPlaying: (playing: boolean) => void;
  selectedRecitersForOffline: Reciter[];
  setSelectedRecitersForOffline: (reciters: Reciter[]) => void;
  downloadedSurahs: any;
  setDownloadedSurahs: (surahs: any) => void;
  selectedSavedSection: SavedSection | null;
  setSelectedSavedSection: (section: SavedSection | null) => void;
  fontSize: number;
  setFontSize: (size: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
    const [showTafsirModal, setShowTafsirModal] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [showQuickAccessMenu, setShowQuickAccessMenu] = useState(false);
    const [showAIAssistantModal, setShowAIAssistantModal] = useState(false);
    const [selectedAyah, setSelectedAyah] = useState<Ayah | null>(null);
    const [surahsSimple, setSurahsSimple] = useState<SurahSimple[]>([]);
    const [reciters] = useState<ListeningReciter[]>([]);
    const [selectedReciter, setSelectedReciter] = useState<ListeningReciter>({ id: 7, name: "Mishary Rashid Alafasy", server: "https://server7.mp3quran.net/afs/" });
    const [savedSections, setSavedSections] = useState<SavedSection[]>([]);
    const [currentTheme, setCurrentTheme] = useState<"light" | "dark">("light");
    const [selectedSurah, setSelectedSurah] = useState<SurahSimple | null>(null);
    const [selectedRadio, setSelectedRadio] = useState(null);
    const [isRadioPlaying, setIsRadioPlaying] = useState(false);
    const [selectedRecitersForOffline, setSelectedRecitersForOffline] = useState<Reciter[]>([]);
    const [downloadedSurahs, setDownloadedSurahs] = useState({});
    const [selectedSavedSection, setSelectedSavedSection] = useState<SavedSection | null>(null);
    const [fontSize, setFontSize] = useState(20);

    useEffect(() => {
        const surahs = quran.surahs.map((s: any) => ({
            number: s.number,
            name: s.name,
            englishName: s.englishName,
            englishNameTranslation: s.englishNameTranslation,
            numberOfAyahs: s.verses.length,
            revelationType: s.revelationType,
        }));
        setSurahsSimple(surahs);
    }, []);

    const addSavedSection = (section: Omit<SavedSection, 'id' | 'ayahs'>) => {
        console.log('Adding section', section);
    };
    const deleteSavedSection = (id: string) => {
        console.log('Deleting section', id);
    };

    const value = {
        showTafsirModal,
        setShowTafsirModal,
        showSettingsModal,
        setShowSettingsModal,
        showQuickAccessMenu,
        setShowQuickAccessMenu,
        showAIAssistantModal,
        setShowAIAssistantModal,
        selectedAyah,
        setSelectedAyah,
        quran,
        surahsSimple,
        reciters,
        selectedReciter,
        setSelectedReciter,
        savedSections,
        addSavedSection,
        deleteSavedSection,
        currentTheme,
        setCurrentTheme,
        selectedSurah,
        setSelectedSurah,
        selectedRadio,
        setSelectedRadio,
        isRadioPlaying,
        setIsRadioPlaying,
        selectedRecitersForOffline,
        setSelectedRecitersForOffline,
        downloadedSurahs,
        setDownloadedSurahs,
        selectedSavedSection,
        setSelectedSavedSection,
        fontSize,
        setFontSize,
    };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};