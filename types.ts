import { ReactNode } from 'react';

export type QuranPage = {
  id: number;
  text: string;
  ayahs: Ayah[];
};

export type Surah = {
  id: number;
  name: string;
  startPage: number;
  endPage: number;
  ayahCount: number;
  type: 'makki' | 'madani';
};

export type Ayah = {
  id: number;
  surahId: number;
  ayahNum: number;
  page: number;
  line: number;
  text: string;
  juz: number;
  hizb: number;
  manzil: number;
  ruku: number;
  sajda: boolean;
  verseKey: string;
  textClean: string;
};

export type SearchResult = {
  surahName: string;
  surahId: number;
  ayahNum: number;
  text: string;
  page: number;
};

export type AppContextType = {
  activePage: number;
  setActivePage: (page: number) => void;
  fontSize: number;
  setFontSize: (size: number) => void;
  lineHeight: number;
  setLineHeight: (height: number) => void;
  tafsirModalOpen: boolean;
  setTafsirModalOpen: (open: boolean) => void;
  selectedAyahForTafsir: Ayah | null;
  setSelectedAyahForTafsir: (ayah: Ayah | null) => void;
  settingsModalOpen: boolean;
  setSettingsModalOpen: (open: boolean) => void;
  offlineMode: boolean;
  setOfflineMode: (mode: boolean) => void;
  showToast: (message: string, type: 'success' | 'error') => void;
  quickAccessMenuOpen: boolean;
  setQuickAccessMenuOpen: (open: boolean) => void;
  showOfflineInstallPrompt: boolean;
  setShowOfflineInstallPrompt: (show: boolean) => void;
  isInstallingOffline: boolean;
  setIsInstallingOffline: (installing: boolean) => void;
  offlineInstallProgress: number;
  setOfflineInstallProgress: (progress: number) => void;
  aiAssistantModalOpen: boolean;
  setAIAssistantModalOpen: (open: boolean) => void;
  samiaSessionModalOpen: boolean;
  setSamiaSessionModalOpen: (open: boolean) => void;
  currentPlayingAyah: Ayah | null;
  setCurrentPlayingAyah: (ayah: Ayah | null) => void;
  isPlayingAudio: boolean;
  setIsPlayingAudio: (playing: boolean) => void;
  currentAudioSurah: number | null;
  setCurrentAudioSurah: (surah: number | null) => void;
  currentAudioReciter: string | null;
  setCurrentAudioReciter: (reciter: string | null) => void;
  currentMemorizationSection: MemorizationSection | null;
  setCurrentMemorizationSection: (section: MemorizationSection | null) => void;
  memorizationPlayerOpen: boolean;
  setMemorizationPlayerOpen: (open: boolean) => void;
  selectedAyahAction: Ayah | null;
  setSelectedAyahAction: (ayah: Ayah | null) => void;
  ayahActionModalOpen: boolean;
  setAyahActionModalOpen: (open: boolean) => void;
  createSectionModalOpen: boolean;
  setCreateSectionModalOpen: (open: boolean) => void;
  activeTab: 'quran' | 'memorization' | 'listen' | 'radio' | 'adhkar' | 'hisn' | 'search' | 'index' | 'settings' | 'home';
  setActiveTab: (tab: AppContextType['activeTab']) => void;
};

export type MemorizationSection = {
  id: string;
  name: string;
  startAyah: Ayah;
  endAyah: Ayah;
  progress?: number; // 0-100
  repeatCount: number; // how many times to repeat each ayah
  repetitionDelay: number; // delay between repetitions in ms
  playbackSpeed: number; // 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2
};

export type SettingOption = {
  value: string;
  label: string | ReactNode;
};

export type RadioStation = {
  id: string;
  name: string;
  url: string;
  thumbnail: string;
};

// New types for Adhkar
export interface AdhkarItem {
  id: string;
  text: string;
  count?: number; // عدد مرات التكرار، اختياري
  reference?: string; // المرجع، اختياري
  explanation?: string; // الشرح، اختياري
}

export interface AdhkarCategory {
  id: string;
  category: string; // اسم الفئة (مثلاً: أذكار الصباح، أذكار المساء)
  sections: AdhkarItem[];
}
