import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { Ayah, Surah, SurahSimple, Reciter, Tafsir, AppSettings, TafsirInfo, SavedSection, ListeningReciter, RadioStation, LastReadPosition, Bookmark } from './types';
import * as api from './services/quranApi';
import { IndexPage } from './components/IndexPage';
import { QuranView } from './components/QuranView';
import { ListenPage } from './components/ListenPage';
import { RadioPage } from './components/RadioPage';
import { MemorizationAndSectionsPage } from './components/MemorizationAndSectionsPage';
import { HisnAlMuslimPage } from './components/HisnAlMuslimPage';
import { HadithPage } from './components/HadithPage';
import { BookmarksPage } from './components/BookmarksPage';
import { DivisionView } from './components/DivisionView';
import MorePage from './components/MorePage';
import { WordMeaningsPage } from './components/WordMeaningsPage';
import { AIAssistantModal } from './components/AIAssistantModal';
import { SearchModal } from './components/SearchModal';
import { ErrorToast } from './components/ErrorToast';
import { SuccessToast } from './components/SuccessToast';
import { SettingsModal } from './components/SettingsModal';
import { TafsirModal } from './components/TafsirModal';
import { GlobalPlayer } from './components/GlobalPlayer';
import { BottomNavBar } from './components/BottomNavBar';
import { AppContext, useApp, View, DivisionInfo } from './context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';

const App: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('quranAppSettings');
    const defaultSettings: AppSettings = {
      darkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
      memorizationReciter: 'ar.faresabbad',
      tafsir: 'ar.muyassar',
    };
     if (saved) {
        const parsed = JSON.parse(saved);
        if(parsed.reciter && !parsed.memorizationReciter) {
            parsed.memorizationReciter = parsed.reciter;
            delete parsed.reciter;
        }
        return { ...defaultSettings, ...parsed };
    }
    return defaultSettings;
  });
  
  const [apiKey, setApiKey] = useState<string | null>(() => localStorage.getItem('quranUserApiKey'));
  const [memorizationReciters, setMemorizationReciters] = useState<Reciter[]>([]);
  const [listeningReciters, setListeningReciters] = useState<ListeningReciter[]>([]);
  const [radioStations, setRadioStations] = useState<RadioStation[]>([]);
  const [tafsirInfoList, setTafsirInfoList] = useState<TafsirInfo[]>([]);
  const [surahList, setSurahList] = useState<SurahSimple[]>([]);
  const [currentSurah, setCurrentSurah] = useState<Surah | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const [view, setView] = useState<View>('index');
  const [currentDivision, setCurrentDivision] = useState<DivisionInfo | null>(null);
  const [activeAyah, setActiveAyah] = useState<Ayah | null>(null);
  
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const wavesurferContainerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const activeAyahRef = useRef<Ayah | null>(null);
  const audioSourcesRef = useRef<{ sources: string[], index: number }>({ sources: [], index: 0 });

  // Global Player State
  const [playlist, setPlaylist] = useState<Ayah[]>([]);
  const [currentPlaylistItem, setCurrentPlaylistItem] = useState<Ayah | null>(null);
  const [isGlobalPlayerPlaying, setIsGlobalPlayerPlaying] = useState(false);
  const [globalPlayer, setGlobalPlayer] = useState<{show: boolean}>({show: false});
  const globalWavesurferRef = useRef<WaveSurfer | null>(null);
  const globalWavesurferContainerRef = useRef<HTMLDivElement>(null);
  
  const [targetAyah, setTargetAyah] = useState<number | null>(null);
  
  const [savedSections, setSavedSections] = useState<SavedSection[]>(() => {
    const saved = localStorage.getItem('quranAppSavedSections');
    return saved ? JSON.parse(saved) : [];
  });

  const [lastReadPosition, setLastReadPosition] = useState<LastReadPosition | null>(() => {
    const saved = localStorage.getItem('quranAppLastRead');
    return saved ? JSON.parse(saved) : null;
  });

  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() => {
    const saved = localStorage.getItem('quranAppBookmarks');
    return saved ? JSON.parse(saved) : [];
  });

  const surahCache = useRef(new Map<number, Surah>());

  const getAyahsForDivision = useCallback(async (division: QuranDivision): Promise<Ayah[]> => {
    const ayahs: Ayah[] = [];
    const requiredSurahs: number[] = [];
    for (let i = division.start.surah; i <= division.end.surah; i++) {
        requiredSurahs.push(i);
    }

    // Fetch surahs that are not in the cache
    const surahsToFetch = requiredSurahs.filter(sNum => !surahCache.current.has(sNum));
    if (surahsToFetch.length > 0) {
        await Promise.all(surahsToFetch.map(async (sNum) => {
            const surahData = await api.getSurah(sNum, settings.memorizationReciter);
            surahCache.current.set(sNum, surahData);
        }));
    }

    // Assemble the ayahs from the cached surahs
    for (const sNum of requiredSurahs) {
        const surah = surahCache.current.get(sNum);
        if (!surah) continue;

        const startAyah = (sNum === division.start.surah) ? division.start.ayah : 1;
        const endAyah = (sNum === division.end.surah) ? division.end.ayah : surah.ayahs.length;

        for (let a = startAyah; a <= endAyah; a++) {
            const ayah = surah.ayahs.find(ayah => ayah.numberInSurah === a);
            if(ayah) ayahs.push(ayah);
        }
    }

    return ayahs;

  }, [settings.memorizationReciter]);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isTafsirOpen, setIsTafsirOpen] = useState(false);
  const [tafsirContent, setTafsirContent] = useState<{ayah: Ayah, tafsir: Tafsir | null, surahNumber: number, surahName: string, tafsirName?: string, isLoading: boolean, error?: string} | null>(null);
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const [aiAssistantAyah, setAIAssistantAyah] = useState<Ayah | null>(null);
  
  const [installPromptEvent, setInstallPromptEvent] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(window.matchMedia('(display-mode: standalone)').matches);

  const mainContentRef = useRef<HTMLDivElement>(null);

  const { offlineReady: [offlineReady, setOfflineReady], needRefresh: [needRefresh, setNeedRefresh], updateServiceWorker } = useRegisterSW();

  const closeNeedRefresh = () => {
    setNeedRefresh(false);
  };

  useEffect(() => {
    if (!wavesurferContainerRef.current) return;
    const ws = WaveSurfer.create({
        container: wavesurferContainerRef.current,
        height: 0,
        mediaControls: false,
    });
    wavesurferRef.current = ws;

    const onReady = () => {
        ws.play();
    };

    const onError = (err: Error) => {
        audioSourcesRef.current.index++;
        const { sources, index } = audioSourcesRef.current;
        if (index < sources.length) {
            ws.load(sources[index]);
        } else {
            const errorMsg = `فشل تحميل الصوت للآية ${activeAyahRef.current?.numberInSurah} من جميع المصادر.`;
            setError(errorMsg);
            setActiveAyah(null);
            setIsPlaying(false);
        }
    };

    ws.on('ready', onReady);
    ws.on('error', onError);
    ws.on('play', () => setIsPlaying(true));
    ws.on('pause', () => setIsPlaying(false));
    ws.on('finish', () => {
        setIsPlaying(false);
        setActiveAyah(null);
    });

    return () => {
        ws.destroy();
    };
  }, []);

  // Initialize Global Player Wavesurfer
  useEffect(() => {
    if (!globalWavesurferContainerRef.current) return;
    const ws = WaveSurfer.create({
        container: globalWavesurferContainerRef.current,
        height: 0,
        mediaControls: false,
    });
    globalWavesurferRef.current = ws;

    const onReady = () => ws.play();
    const onError = (err: Error) => {
        // For simplicity, just skip to next on error
        playNextInPlaylist();
    };

    ws.on('ready', onReady);
    ws.on('error', onError);
    ws.on('play', () => setIsGlobalPlayerPlaying(true));
    ws.on('pause', () => setIsGlobalPlayerPlaying(false));
    ws.on('finish', () => {
        playNextInPlaylist();
    });

    return () => {
        ws.destroy();
    };
  }, []);

  const playNextInPlaylist = useCallback(() => {
    if (!playlist.length) return;
    const currentIndex = playlist.findIndex(item => item.number === currentPlaylistItem?.number);
    const nextIndex = currentIndex + 1;
    if (nextIndex < playlist.length) {
        setCurrentPlaylistItem(playlist[nextIndex]);
    } else {
        // End of playlist
        setIsGlobalPlayerPlaying(false);
        setGlobalPlayer({ show: false });
        setPlaylist([]);
        setCurrentPlaylistItem(null);
    }
  }, [playlist, currentPlaylistItem]);

  // Effect to load audio when currentPlaylistItem changes
  useEffect(() => {
      if (currentPlaylistItem && globalWavesurferRef.current) {
          // Pause other players
          window.dispatchEvent(new CustomEvent('global-player-stop'));
          wavesurferRef.current?.pause();

          const sources = [currentPlaylistItem.audio, ...(currentPlaylistItem.audioSecondarys || [])].filter(Boolean);
          if (sources.length > 0) {
            globalWavesurferRef.current.load(sources[0]);
          } else {
            // If Ayah has no audio, skip to next
            setTimeout(playNextInPlaylist, 100);
          }
      }
  }, [currentPlaylistItem, playNextInPlaylist]);


  const loadPlaylist = useCallback((ayahs: Ayah[], startPlaying = true) => {
    if (ayahs.length === 0) return;
    setPlaylist(ayahs);
    setCurrentPlaylistItem(ayahs[0]);
    setGlobalPlayer({ show: true });
    if (startPlaying) {
        setIsGlobalPlayerPlaying(true);
    } else {
        setIsGlobalPlayerPlaying(false);
        globalWavesurferRef.current?.pause();
    }
  }, []);

  const toggleGlobalPlayer = useCallback(() => {
    globalWavesurferRef.current?.playPause();
  }, []);

  const playPrevInPlaylist = useCallback(() => {
    if (!playlist.length) return;
    const currentIndex = playlist.findIndex(item => item.number === currentPlaylistItem?.number);
    const prevIndex = currentIndex - 1;
    if (prevIndex >= 0) {
        setCurrentPlaylistItem(playlist[prevIndex]);
    }
    // If it's the first track, do nothing or maybe restart it
  }, [playlist, currentPlaylistItem]);

  const closeGlobalPlayer = useCallback(() => {
      globalWavesurferRef.current?.stop();
      setGlobalPlayer({ show: false });
      setPlaylist([]);
      setCurrentPlaylistItem(null);
      setIsGlobalPlayerPlaying(false);
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
    if (lastReadPosition) {
      localStorage.setItem('quranAppLastRead', JSON.stringify(lastReadPosition));
    }
  }, [lastReadPosition]);

  useEffect(() => {
    localStorage.setItem('quranAppBookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
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
          setIsStandalone(true);
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

  const updateLastReadPosition = useCallback((surahNumber: number, ayahNumber: number) => {
    setLastReadPosition({ surahNumber, ayahNumber, timestamp: Date.now() });
  }, []);

  const addBookmark = useCallback((bookmark: Omit<Bookmark, 'id' | 'timestamp'>) => {
    const newBookmark: Bookmark = {
        ...bookmark,
        id: `bookmark-${Date.now()}`,
        timestamp: Date.now()
    };
    setBookmarks(prev => [...prev, newBookmark]);
    setSuccessMessage('تم إضافة العلامة المرجعية بنجاح.');
  }, []);

  const removeBookmark = useCallback((bookmarkId: string) => {
      setBookmarks(prev => prev.filter(b => b.id !== bookmarkId));
  }, []);
  
  const loadSurah = useCallback(async (surahNumber: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const surahData = await api.getSurah(surahNumber, settings.memorizationReciter);
      setCurrentSurah(surahData);
      updateLastReadPosition(surahNumber, 1);
      document.title = `${surahData.name} - Quran Study App`;
    } catch (e) {
      setError(`فشل تحميل السورة ${surahNumber}.`);
    } finally {
      setIsLoading(false);
    }
  }, [settings.memorizationReciter, updateLastReadPosition]);
  
  const navigateTo = useCallback(async (targetView: View, params?: { surahNumber?: number; ayahNumber?: number, division?: DivisionInfo }) => {
    const state = { view: targetView, params };
    // Only push state if it's different from the current one to avoid duplicate entries
    if (window.history.state?.view !== targetView || JSON.stringify(window.history.state?.params) !== JSON.stringify(params)) {
      window.history.pushState(state, '', `/${targetView}`);
    }

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
    mainContentRef.current?.scrollTo(0, 0);
  }, [loadSurah, currentSurah]);

  useEffect(() => {
    const handlePopState = async (event: PopStateEvent) => {
      if (event.state) {
        const { view: targetView, params } = event.state;
        setTargetAyah(params?.ayahNumber ?? null);
        if (targetView === 'reader' && params?.surahNumber) {
          if (currentSurah?.number !== params.surahNumber) {
            await loadSurah(params.surahNumber);
          }
        } else if (targetView === 'division' && params?.division) {
          setCurrentDivision(params.division);
        }
        setView(targetView);
      } else {
        // Initial state, go to index
        setView('index');
      }
    };

    window.addEventListener('popstate', handlePopState);
    // Set the initial state
    window.history.replaceState({ view: 'index', params: {} }, '', '/index');

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [loadSurah, currentSurah]);
  
  const scrollToTop = useCallback(() => {
      mainContentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const initApp = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [sList, vReciters, lReciters, tList, rStations] = await Promise.all([
        api.getSurahList(), 
        api.getVerseByVerseReciters(),
        api.getListeningReciters(),
        api.getTafsirInfo(),
        api.getRadioStations(),
      ]);
      setSurahList(sList);
      setMemorizationReciters(vReciters);
      setListeningReciters(lReciters);
      setRadioStations(rStations);
      setTafsirInfoList(tList.filter(t => t.language === 'ar'));
      
    } catch (e) {
      setError('فشل تحميل البيانات الأولية. يرجى التحقق من اتصالك بالإنترنت.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    initApp();
  }, [initApp]);
  
  useEffect(() => {
    // This effect handles reloading the surah if the reciter is changed
    // while the reader view is open.
    if (view === 'reader' && currentSurah) {
      loadSurah(currentSurah.number);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.memorizationReciter]);


  const playAyah = useCallback((ayah: Ayah) => {
    const wavesurfer = wavesurferRef.current;
    if (!wavesurfer) return;

    window.dispatchEvent(new CustomEvent('global-player-stop'));

    setActiveAyah(ayah);
    activeAyahRef.current = ayah;

    const sources = [ayah.audio, ...(ayah.audioSecondarys || [])].filter(Boolean);
    if (sources.length === 0) {
        const errorMsg = `لا توجد مصادر صوتية للآية ${ayah.numberInSurah}.`;
        setError(errorMsg);
        return;
    }

    audioSourcesRef.current = { sources: sources, index: 0 };
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
    settings, updateSettings, memorizationReciters, listeningReciters, radioStations, tafsirInfoList, surahList, currentSurah, loadSurah,
    isLoading, error, setError, setSuccessMessage, activeAyah, targetAyah, setTargetAyah, playAyah, pauseAyah,
    isPlaying, navigateTo, showTafsir, showAIAssistant, showSearch, showSettings, view, scrollToTop,
    savedSections, addSavedSection, removeSavedSection, apiKey, updateApiKey,
    isStandalone, canInstall, triggerInstall,
    lastReadPosition, updateLastReadPosition,
    bookmarks, addBookmark, removeBookmark,
    // Global Player
    playlist, currentPlaylistItem, isGlobalPlayerPlaying, globalPlayer,
    loadPlaylist, toggleGlobalPlayer, playNextInPlaylist, playPrevInPlaylist, closeGlobalPlayer,
    getAyahsForDivision,
  }), [
    settings, memorizationReciters, listeningReciters, radioStations, tafsirInfoList, surahList, currentSurah, loadSurah, isLoading, error, activeAyah, targetAyah, isPlaying, view, savedSections, addSavedSection, removeSavedSection, apiKey, updateSettings, setError, setSuccessMessage, setTargetAyah, playAyah, pauseAyah, navigateTo, updateApiKey, isStandalone, canInstall, triggerInstall, scrollToTop, lastReadPosition, updateLastReadPosition, bookmarks, addBookmark, removeBookmark,
    // Global Player Deps
    playlist, currentPlaylistItem, isGlobalPlayerPlaying, globalPlayer, loadPlaylist, toggleGlobalPlayer, playNextInPlaylist, playPrevInPlaylist, closeGlobalPlayer,
    getAyahsForDivision,
  ]);

  const renderView = () => {
    switch (view) {
        case 'index': return <IndexPage />;
        case 'reader': return <QuranView />;
        case 'listen': return <ListenPage />;
        case 'radio': return <RadioPage />;
        case 'memorization': return <MemorizationAndSectionsPage />;
        case 'hisn-al-muslim': return <HisnAlMuslimPage />;
        case 'hadith': return <HadithPage />;
        case 'division': return currentDivision ? <DivisionView division={currentDivision} /> : <IndexPage />;
        case 'bookmarks': return <BookmarksPage />;
        case 'more': return <MorePage />;
        case 'word-meanings': return <WordMeaningsPage />;
        default: return <IndexPage />;
    }
  };

  return (
    <AppContext.Provider value={appContextValue}>
      <div ref={wavesurferContainerRef} className="h-0 w-0 overflow-hidden" />
      <div ref={globalWavesurferContainerRef} className="h-0 w-0 overflow-hidden" />
      <AnimatePresence>
        {successMessage && <SuccessToast message={successMessage} onClose={() => setSuccessMessage(null)} />}
        {error && <ErrorToast message={error} onClose={() => setError(null)} />}
        {needRefresh && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="fixed bottom-24 right-4 z-50"
          >
            <div className="p-4 bg-gray-800 text-white rounded-lg shadow-lg flex items-center space-x-4 space-x-reverse">
              <span>يوجد تحديث جديد متوفر!</span>
              <button
                className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded"
                onClick={() => updateServiceWorker(true)}
              >
                تحديث
              </button>
              <button
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded"
                onClick={closeNeedRefresh}
              >
                إغلاق
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isSettingsOpen && <SettingsModal onClose={() => setIsSettingsOpen(false)} />}
        {isSearchOpen && <SearchModal onClose={() => setIsSearchOpen(false)} />}
        {isTafsirOpen && tafsirContent && <TafsirModal content={tafsirContent} onClose={() => { setIsTafsirOpen(false); setTafsirContent(null); }} />}
        {isAIAssistantOpen && aiAssistantAyah && <AIAssistantModal ayah={aiAssistantAyah} onClose={() => { setIsAIAssistantOpen(false); setAIAssistantAyah(null); }} />}
      </AnimatePresence>

      <div ref={mainContentRef} className="h-screen w-screen overflow-y-auto pb-20">
        <main tabIndex={-1} className="p-4 md:p-6 lg:p-8 focus:outline-none">
          {renderView()}
        </main>
      </div>

      <AnimatePresence>
        <GlobalPlayer />
      </AnimatePresence>

      <AnimatePresence>
        {['index', 'listen', 'hadith', 'hisn-al-muslim', 'bookmarks', 'radio', 'memorization', 'more'].includes(view) && (
          <BottomNavBar />
        )}
      </AnimatePresence>
    </AppContext.Provider>
  );
};

export default App;