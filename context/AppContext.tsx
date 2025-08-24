import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { Surah, Ayah, Division, RadioStation, Tafsir, Reciter, AppSettings, Section } from '../types';
import { getSurah } from '../services/quranApi';
import { getOfflineStatus, downloadSurah, deleteSurahAudio } from '../services/offlineService';
import { quranicDivisions } from '../data/quranicDivisions';

export type Tab = 'quran' | 'index' | 'adhkar' | 'listen' | 'radio' | 'settings' | 'memorization' | 'hisn-al-muslim';

interface AppContextType {
  surahs: Surah[];
  setSurahs: React.Dispatch<React.SetStateAction<Surah[]>>;
  currentSurah: Surah | null;
  setCurrentSurah: (surah: Surah | null) => void;
  currentAyah: Ayah | null;
  setCurrentAyah: (ayah: Ayah | null) => void;
  divisions: Division[];
  setDivisions: React.Dispatch<React.SetStateAction<Division[]>>;
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  isOfflineAvailable: boolean;
  offlineStatus: { [key: number]: boolean };
  downloadSurahAudio: (surahNumber: number) => Promise<void>;
  deleteSurahAudio: (surahNumber: number) => Promise<void>;
  isDownloading: { [key: number]: boolean };
  showSettingsModal: boolean;
  setShowSettingsModal: (show: boolean) => void;
  showTafsirModal: boolean;
  setShowTafsirModal: (show: boolean) => void;
  selectedAyahForTafsir: Ayah | null;
  setSelectedAyahForTafsir: (ayah: Ayah | null) => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [currentSurah, setCurrentSurahState] = useState<Surah | null>(null);
  const [currentAyah, setCurrentAyah] = useState<Ayah | null>(null);
  const [divisions, setDivisions] = useState<Division[]>(quranicDivisions);
  const [activeTab, setActiveTab] = useState<Tab>('quran');
  const [settings, setSettings] = useState<AppSettings>({
    theme: 'light',
    qari: 'ar.alafasy',
    translation: 'en.sahih',
    fontSize: 18,
  });
  const [isOfflineAvailable, setIsOfflineAvailable] = useState(false);
  const [offlineStatus, setOfflineStatus] = useState<{ [key: number]: boolean }>({});
  const [isDownloading, setIsDownloading] = useState<{ [key: number]: boolean }>({});
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showTafsirModal, setShowTafsirModal] = useState(false);
  const [selectedAyahForTafsir, setSelectedAyahForTafsir] = useState<Ayah | null>(null);


  useEffect(() => {
    const fetchSurahs = async () => {
      const allSurahs = [];
      for (let i = 1; i <= 114; i++) {
        // In a real app, you might lazy load this, but for simplicity we fetch all.
        const surah = await getSurah(i, settings.translation);
        allSurahs.push(surah);
      }
      setSurahs(allSurahs);
      const lastReadSurah = localStorage.getItem('lastReadSurah');
      if (lastReadSurah) {
        setCurrentSurah(allSurahs[parseInt(lastReadSurah) - 1]);
      } else {
        setCurrentSurah(allSurahs[0]);
      }
    };
    fetchSurahs();
    
    setIsOfflineAvailable('serviceWorker' in navigator);

    const savedSettings = localStorage.getItem('quranAppSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  useEffect(() => {
    if (isOfflineAvailable) {
      const checkAllStatus = async () => {
        const statuses: { [key: number]: boolean } = {};
        for (let i = 1; i <= 114; i++) {
          statuses[i] = await getOfflineStatus(i);
        }
        setOfflineStatus(statuses);
      };
      checkAllStatus();
    }
  }, [isOfflineAvailable]);
  
  const setCurrentSurah = (surah: Surah | null) => {
    setCurrentSurahState(surah);
    if (surah) {
        localStorage.setItem('lastReadSurah', surah.number.toString());
    }
  };

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => {
      const updatedSettings = { ...prev, ...newSettings };
      localStorage.setItem('quranAppSettings', JSON.stringify(updatedSettings));
      return updatedSettings;
    });
  };
  
  const handleDownload = async (surahNumber: number) => {
    setIsDownloading(prev => ({...prev, [surahNumber]: true}));
    await downloadSurah(surahNumber, settings.qari);
    setOfflineStatus(prev => ({...prev, [surahNumber]: true}));
    setIsDownloading(prev => ({...prev, [surahNumber]: false}));
  };
  
  const handleDelete = async (surahNumber: number) => {
    await deleteSurahAudio(surahNumber);
    setOfflineStatus(prev => ({...prev, [surahNumber]: false}));
  };

  return (
    <AppContext.Provider
      value={{
        surahs,
        setSurahs,
        currentSurah,
        setCurrentSurah,
        currentAyah,
        setCurrentAyah,
        divisions,
        setDivisions,
        activeTab,
        setActiveTab,
        settings,
        updateSettings,
        isOfflineAvailable,
        offlineStatus,
        downloadSurahAudio: handleDownload,
        deleteSurahAudio: handleDelete,
        isDownloading,
        showSettingsModal,
        setShowSettingsModal,
        showTafsirModal,
        setShowTafsirModal,
        selectedAyahForTafsir,
        setSelectedAyahForTafsir,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};