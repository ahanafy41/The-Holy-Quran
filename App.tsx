
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { Ayah, Surah, SurahSimple, Reciter, Tafsir, AppSettings, TafsirInfo, SavedSection } from './types';
import * as api from './services/quranApi';
import { HomePage } from './components/HomePage';
import { IndexPage } from './components/IndexPage';
import { QuranView } from './components/QuranView';
import { ListenPage } from './components/ListenPage';
import { MemorizationAndSectionsPage } from './components/MemorizationAndSectionsPage';
import { DivisionView } from './components/DivisionView';
import { AIAssistantModal } from './components/AIAssistantModal';
import { SearchModal } from './components/SearchModal';
import { ErrorToast } from './components/ErrorToast';
import { SuccessToast } from './components/SuccessToast';
import { SettingsModal } from './components/SettingsModal';
import { TafsirModal } from './components/TafsirModal';
import { AppContext, useApp, View, DivisionInfo } from './context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';

// ======== MAIN APP COMPONENT ======== //
const App: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('quranAppSettings');
    const defaultSettings: AppSettings = {
      darkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
      reciter: 'ar.alafasy',
      tafsir: 'ar.muyassar',
    };
     if (saved) {
        const parsed = JSON.parse(saved);
        return { ...defaultSettings, ...parsed };
    }
    return defaultSettings;
  });
  
  const [apiKey, setApiKey] = useState<string | null>(() => localStorage.getItem('quranUserApiKey'));
  const [reciters, setReciters] = useState<Reciter[]>([]);
  const [tafsirInfoList, setTafsirInfoList] = useState<TafsirInfo[]>([]);
  const [surahList, setSurahList] = useState<SurahSimple[]>([]);
  const [currentSurah, setCurrentSurah] = useState<Surah | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const [view, setView] = useState<View>('home');
  const [currentDivision, setCurrentDivision] = useState<DivisionInfo | null>(null);
  const [activeAyah, setActiveAyah] = useState<Ayah | null>(null);
  
  // Wavesurfer state for simple, global playback
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const wavesurferContainerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const activeAyahRef = useRef<Ayah | null>(null);
  const audioSourcesRef = useRef<{ sources: string[], index: number }>({ sources: [], index: 0 });
  
  const [targetAyah, setTargetAyah] = useState<number | null>(null);
  
  const [savedSections, setSavedSections] = useState<SavedSection[]>(() => {
    const saved = localStorage.getItem('quranAppSavedSections');
    return saved ? JSON.parse(saved) : [];
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isTafsirOpen, setIsTafsirOpen] = useState(false);
  const [tafsirContent, setTafsirContent] = useState<{ayah: Ayah, tafsir: Tafsir | null, surahNumber: number, surahName: string, tafsirName?: string, isLoading: boolean, error?: string} | null>(null);
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const [aiAssistantAyah, setAIAssistantAyah] = useState<Ayah | null>(null);
  
  const [installPromptEvent, setInstallPromptEvent] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(window.matchMedia('(display-mode: standalone)').matches);


  const mainContentRef = useRef<HTMLDivElement>(null);

  // Initialize headless Wavesurfer instance
  useEffect(() => {
    if (!wavesurferContainerRef.current) return;
    console.log('[Global Player DEBUG] Initializing headless WaveSurfer instance.');
    const ws = WaveSurfer.create({
        container: wavesurferContainerRef.current,
        height: 0, // Visually hidden
        mediaControls: false,
    });
    wavesurferRef.current = ws;

    const onReady = () => {
        console.log('[Global Player DEBUG] Event: ready. Playing audio.');
        ws.play();
    };

    const onError = (err: Error) => {
        console.error(`[Global Player DEBUG] Event: error on source index ${audioSourcesRef.current.index}:`, err);
        audioSourcesRef.current.index++;
        const { sources, index } = audioSourcesRef.current;
        if (index < sources.length) {
            console.log(`[Global Player DEBUG] Trying next source ${index + 1}/${sources.length}: ${sources[index]}`);
            ws.load(sources[index]);
        } else {
            const errorMsg = `فشل تحميل الصوت للآية ${activeAyahRef.current?.numberInSurah} من جميع المصادر.`;
            console.error(`[Global Player DEBUG] ${errorMsg}`);
            setError(errorMsg);
            setActiveAyah(null);
            setIsPlaying(false);
        }
    };

    ws.on('ready', onReady);
    ws.on('error', onError);
    ws.on('play', () => {
        console.log('[Global Player DEBUG] Event: play');
        setIsPlaying(true);
    });
    ws.on('pause', () => {
        console.log('[Global Player DEBUG] Event: pause');
        setIsPlaying(false);
    });
    ws.on('finish', () => {
        console.log('[Global Player DEBUG] Event: finish');
        setIsPlaying(false);
        setActiveAyah(null);
    });

    return () => {
        console.log('[Global Player DEBUG] Destroying headless WaveSurfer instance.');
        ws.destroy();
    };
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', settings.darkMode);
    document.documentElement.dir = 'rtl';
    localStorage.setItem('quranAppSettings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('quranAppSavedSections', JSON.stringify(savedSections));
  }, [savedSections]);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then(registration => {
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
          })
          .catch(err => {
            console.log('ServiceWorker registration failed: ', err);
          });
      });
    }
  }, []);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
        console.log('`beforeinstallprompt` event fired, offering PWA installation.');
        event.preventDefault();
        setInstallPromptEvent(event);
    };
    
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);
  
  const triggerInstall = useCallback(async () => {
      if (!installPromptEvent) return;
      installPromptEvent.prompt();
      const { outcome } = await installPromptEvent.userChoice;
      if (outcome === 'accepted') {
          console.log('User accepted the install prompt');
          setIsStandalone(true);
      } else {
          console.log('User dismissed the install prompt');
      }
      setInstallPromptEvent(null);
  }, [installPromptEvent]);

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const updateApiKey = useCallback((key: string) => {
    const trimmedKey = key.trim();
    if (apiKey === trimmedKey) return; 

    if (trimmedKey) {
        setApiKey(trimmedKey);
        localStorage.setItem('quranUserApiKey', trimmedKey);
        setSuccessMessage('تم حفظ مفتاح API بنجاح.');
    } else {
        setApiKey(null);
        localStorage.removeItem('quranUserApiKey');
    }
  }, [apiKey]);

  const addSavedSection = useCallback((section: Omit<SavedSection, 'id'>) => {
    const newSection: SavedSection = {
        ...section,
        id: `section-${Date.now()}`
    };
    setSavedSections(prev => [...prev, newSection]);
  }, []);

  const removeSavedSection = useCallback((sectionId: string) => {
      setSavedSections(prev => prev.filter(s => s.id !== sectionId));
  }, []);
  
  const loadSurah = useCallback(async (surahNumber: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const surahData = await api.getSurah(surahNumber, settings.reciter);
      setCurrentSurah(surahData);
      localStorage.setItem('lastReadSurah', String(surahNumber));
      document.title = `${surahData.name} - Quran Study App`;
    } catch (e) {
      setError(`فشل تحميل السورة ${surahNumber}.`);
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [settings.reciter]);
  
  const navigateTo = useCallback(async (targetView: View, params?: { surahNumber?: number; ayahNumber?: number, division?: DivisionInfo }) => {
    setTargetAyah(params?.ayahNumber ?? null);
    if (targetView === 'reader' && params?.surahNumber) {
        if (currentSurah?.number !== params.surahNumber) {
            await loadSurah(params.surahNumber);
        }
    } else if (targetView === 'division' && params?.division) {
        setCurrentDivision(params.division);
        document.title = `${params.division.title} - Quran Study App`;
    }
    setView(targetView);
    mainContentRef.current?.scrollTo(0,0);
  }, [loadSurah, currentSurah]);

  const initApp = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [sList, rList, tList] = await Promise.all([
        api.getSurahList(), 
        api.getReciters(),
        api.getTafsirInfo(),
      ]);
      setSurahList(sList);
      setReciters(rList);
      setTafsirInfoList(tList.filter(t => t.language === 'ar'));
      
    } catch (e) {
      setError('فشل تحميل البيانات الأولية. يرجى التحقق من اتصالك بالإنترنت.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    initApp();
  }, [initApp]);
  
  useEffect(() => {
    if (view === 'reader' && currentSurah) {
      loadSurah(currentSurah.number);
    }
  }, [view, currentSurah, settings.reciter, loadSurah]);


  const playAyah = useCallback((ayah: Ayah) => {
    const wavesurfer = wavesurferRef.current;
    if (!wavesurfer) return;
    console.log(`[Global Player DEBUG] playAyah called for ayah ${ayah.surah?.name} ${ayah.numberInSurah}`, ayah);

    // Stop any other complex players if they are active
    console.log('[Global Player DEBUG] Dispatching global-player-stop event.');
    window.dispatchEvent(new CustomEvent('global-player-stop'));

    setActiveAyah(ayah);
    activeAyahRef.current = ayah;

    const sources = [ayah.audio, ...(ayah.audioSecondarys || [])].filter(Boolean);
    console.log('[Global Player DEBUG] Audio sources:', sources);
    if (sources.length === 0) {
        const errorMsg = `لا توجد مصادر صوتية للآية ${ayah.numberInSurah}.`;
        console.error(`[Global Player DEBUG] ${errorMsg}`);
        setError(errorMsg);
        return;
    }

    audioSourcesRef.current = { sources: sources, index: 0 };
    console.log(`[Global Player DEBUG] Loading source 1/${sources.length}: ${sources[0]}`);
    wavesurfer.load(sources[0]);
  }, [setError]);

  const pauseAyah = useCallback(() => {
    wavesurferRef.current?.pause();
  }, []);

  const showTafsir = async (ayah: Ayah) => {
      if (!ayah.surah) return;
      const tafsirInfo = tafsirInfoList.find(t => t.identifier === settings.tafsir);
      setIsTafsirOpen(true);
      setTafsirContent({ 
          ayah, tafsir: null, surahNumber: ayah.surah.number, surahName: ayah.surah.englishName, 
          tafsirName: tafsirInfo?.name, isLoading: true
      });

      try {
          const tafsirData = await api.getTafsirForAyahWithEdition(settings.tafsir, ayah.surah.number, ayah.numberInSurah);
          setTafsirContent(prev => prev ? {...prev, tafsir: tafsirData, isLoading: false} : null);
      } catch(e) {
          setTafsirContent(prev => prev ? {...prev, isLoading: false, error: "فشل تحميل التفسير."} : null);
      }
  };

  const showSettings = () => setIsSettingsOpen(true);

  const showAIAssistant = (ayah: Ayah) => {
      if (!apiKey) {
          setError("مفتاح API مطلوب لاستخدام مساعد الذكاء الاصطناعي. يرجى إضافته في الإعدادات.");
          showSettings();
          return;
      }
      setAIAssistantAyah(ayah);
      setIsAIAssistantOpen(true);
  };

  const showSearch = () => setIsSearchOpen(true);
  
  const canInstall = !!installPromptEvent && !isStandalone;

  const appContextValue = useMemo(() => ({
    settings, updateSettings, reciters, tafsirInfoList, surahList, currentSurah, loadSurah,
    isLoading, error, setError, setSuccessMessage, activeAyah, targetAyah, setTargetAyah, playAyah, pauseAyah,
    isPlaying, navigateTo, showTafsir, showAIAssistant, showSearch, showSettings, view,
    savedSections, addSavedSection, removeSavedSection, apiKey, updateApiKey,
    isStandalone, canInstall, triggerInstall,
  }), [settings, reciters, tafsirInfoList, surahList, currentSurah, loadSurah, isLoading, error, activeAyah, targetAyah, isPlaying, view, savedSections, addSavedSection, removeSavedSection, apiKey, updateSettings, setError, setSuccessMessage, setTargetAyah, playAyah, pauseAyah, navigateTo, updateApiKey, isStandalone, canInstall, triggerInstall]);

  const renderView = () => {
    switch (view) {
        case 'home': return <HomePage />;
        case 'index': return <IndexPage />;
        case 'reader': return <QuranView />;
        case 'listen': return <ListenPage />;
        case 'memorization': return <MemorizationAndSectionsPage />;
        case 'division': return currentDivision ? <DivisionView division={currentDivision} /> : <IndexPage />;
        default: return <HomePage />;
    }
  };

  return (
    <AppContext.Provider value={appContextValue}>
      <div ref={wavesurferContainerRef} className="h-0 w-0 overflow-hidden" />
      <AnimatePresence>
        {successMessage && <SuccessToast message={successMessage} onClose={() => setSuccessMessage(null)} />}
        {error && <ErrorToast message={error} onClose={() => setError(null)} />}
      </AnimatePresence>
      <AnimatePresence>
        {isSettingsOpen && <SettingsModal onClose={() => setIsSettingsOpen(false)} />}
        {isSearchOpen && <SearchModal onClose={() => setIsSearchOpen(false)} />}
        {isTafsirOpen && tafsirContent && <TafsirModal content={tafsirContent} onClose={() => { setIsTafsirOpen(false); setTafsirContent(null); }} />}
        {isAIAssistantOpen && aiAssistantAyah && <AIAssistantModal ayah={aiAssistantAyah} onClose={() => { setIsAIAssistantOpen(false); setAIAssistantAyah(null); }} />}
      </AnimatePresence>

      <div ref={mainContentRef} className="h-screen w-screen overflow-y-auto">
        <main tabIndex={-1} className="p-4 md:p-6 lg:p-8 focus:outline-none">
          {renderView()}
        </main>
      </div>
    </AppContext.Provider>
  );
};

export default App;
