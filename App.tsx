


import React, { useState, useEffect, useCallback, useMemo, createContext, useContext, useRef } from 'react';
import { Howl } from 'howler';
import { Ayah, Surah, SurahSimple, Reciter, Tafsir, AppSettings, TafsirInfo, QuranDivision, SearchResult, SavedSection } from './types';
import * as api from './services/quranApi';
import { XMarkIcon } from './components/Icons';
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
import { motion, AnimatePresence } from 'framer-motion';


// ======== APP CONTEXT ======== //

export type View = 'home' | 'index' | 'reader' | 'listen' | 'division' | 'memorization';

interface DivisionInfo extends QuranDivision {
    title: string;
}

interface AppContextType {
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  reciters: Reciter[];
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
  apiKey: string | null;
  updateApiKey: (key: string) => void;
  view: View;
  savedSections: SavedSection[];
  addSavedSection: (section: Omit<SavedSection, 'id'>) => void;
  removeSavedSection: (sectionId: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);
export const useApp = () => useContext(AppContext)!;


// ======== MAIN APP COMPONENT ======== //
const App: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('quranAppSettings');
    const defaultSettings = {
      darkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
      reciter: 'ar.alafasy',
      tafsir: 'ar.muyassar',
      memorization: { repetitions: 3, delay: 3, playbackRate: 1 },
    };
     if (saved) {
        const parsed = JSON.parse(saved);
        // Ensure memorization settings are fully populated
        parsed.memorization = { ...defaultSettings.memorization, ...parsed.memorization };
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
  const [howlInstance, setHowlInstance] = useState<Howl | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
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

  const mainContentRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    document.documentElement.classList.toggle('dark', settings.darkMode);
    document.documentElement.dir = 'rtl';
    localStorage.setItem('quranAppSettings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('quranAppSavedSections', JSON.stringify(savedSections));
  }, [savedSections]);

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings, memorization: {...prev.memorization, ...newSettings.memorization} }));
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
    (howlInstance as any)?.stop();
    setActiveAyah(ayah);
    const sources = [ayah.audio, ...(ayah.audioSecondarys || [])].filter(Boolean);

    const newHowl = new Howl({
      src: sources, html5: true,
      onplay: () => setIsPlaying(true),
      onpause: () => setIsPlaying(false),
      onend: () => { setIsPlaying(false); setActiveAyah(null); },
      onstop: () => setIsPlaying(false),
      onloaderror: () => setError(`فشل تحميل الصوت للآية ${ayah.numberInSurah}.`),
      onplayerror: () => setError(`فشل تشغيل الصوت للآية ${ayah.numberInSurah}.`)
    });
    (newHowl as any).play();
    setHowlInstance(newHowl);
  }, [howlInstance, setError]);

  const pauseAyah = useCallback(() => {
    (howlInstance as any)?.pause();
  }, [howlInstance]);

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

  const appContextValue = useMemo(() => ({
    settings, updateSettings, reciters, tafsirInfoList, surahList, currentSurah, loadSurah,
    isLoading, error, setError, setSuccessMessage, activeAyah, targetAyah, setTargetAyah, playAyah, pauseAyah,
    isPlaying, navigateTo, showTafsir, showAIAssistant, showSearch, showSettings, view,
    savedSections, addSavedSection, removeSavedSection, apiKey, updateApiKey,
  }), [settings, reciters, tafsirInfoList, surahList, currentSurah, loadSurah, isLoading, error, activeAyah, targetAyah, isPlaying, view, savedSections, addSavedSection, removeSavedSection, apiKey, updateSettings, setError, setSuccessMessage, setTargetAyah, playAyah, pauseAyah, navigateTo, updateApiKey]);

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

// ======== MODAL COMPONENTS ======== //

const SettingsModal: React.FC<{onClose: () => void}> = ({ onClose }) => {
    const { settings, updateSettings, reciters, tafsirInfoList, apiKey, updateApiKey } = useApp();
    const modalRef = useRef<HTMLDivElement>(null);
    const [localApiKey, setLocalApiKey] = useState(apiKey || '');

    const handleSaveAndClose = () => {
        updateApiKey(localApiKey);
        onClose();
    };
    
    useFocusTrap(modalRef, handleSaveAndClose);
    
    const handlePlaybackRateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        updateSettings({
            memorization: { ...settings.memorization, playbackRate: parseFloat(e.target.value) }
        });
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={handleSaveAndClose}>
            <motion.div ref={modalRef} initial={{scale: 0.95, opacity: 0}} animate={{scale: 1, opacity: 1}} exit={{scale: 0.95, opacity: 0}}
             onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] flex flex-col" role="dialog" aria-modal="true" aria-labelledby="settings-title">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                    <h3 id="settings-title" className="font-bold text-lg">الإعدادات</h3>
                    <button onClick={handleSaveAndClose} aria-label="Close settings" className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"><XMarkIcon className="w-5 h-5" /></button>
                </div>
                <div className="p-6 space-y-6 overflow-y-auto text-right">
                     <SettingSelect id="reciter" label="القارئ" value={settings.reciter} onChange={(e) => updateSettings({ reciter: e.target.value })}>
                        {reciters.map(r => <option key={r.identifier} value={r.identifier}>{r.name}</option>)}
                     </SettingSelect>
                     <SettingSelect id="tafsir" label="التفسير" value={settings.tafsir} onChange={(e) => updateSettings({ tafsir: e.target.value })}>
                        {tafsirInfoList.map(t => <option key={t.identifier} value={t.identifier}>{t.name}</option>)}
                     </SettingSelect>
                     <div>
                        <h4 className="font-medium mb-3">إعدادات الاستماع والحفظ</h4>
                        <div className="space-y-4">
                            <SettingSelect 
                                id="repetitions"
                                label="عدد تكرار كل آية"
                                value={String(settings.memorization.repetitions)}
                                onChange={(e) => updateSettings({ memorization: { ...settings.memorization, repetitions: parseInt(e.target.value, 10) }})}
                            >
                                {Array.from({ length: 20 }, (_, i) => i + 1).map(num => {
                                    let unit;
                                    if (num === 1) unit = 'مرة واحدة';
                                    else if (num === 2) unit = 'مرتان';
                                    else if (num >= 3 && num <= 10) unit = 'مرات';
                                    else unit = 'مرة';
                                    return (
                                        <option key={num} value={num}>{`${num} ${unit}`}</option>
                                    );
                                })}
                            </SettingSelect>
                            <SettingSelect id="playbackRate" label="سرعة القراءة" value={String(settings.memorization.playbackRate)} onChange={handlePlaybackRateChange}>
                                <option value="0.75">بطيئة (0.75x)</option>
                                <option value="1">عادية (1x)</option>
                                <option value="1.25">سريعة (1.25x)</option>
                                <option value="1.5">سريعة جداً (1.5x)</option>
                             </SettingSelect>
                             <SettingSelect 
                                id="delay"
                                label="التأخير بين الآيات"
                                value={String(settings.memorization.delay)}
                                onChange={(e) => updateSettings({ memorization: { ...settings.memorization, delay: parseInt(e.target.value, 10) }})}
                            >
                                {Array.from({ length: 11 }, (_, i) => i).map(num => {
                                    let unit;
                                    if (num === 0) unit = 'بلا تأخير';
                                    else if (num === 1) unit = 'ثانية';
                                    else if (num === 2) unit = 'ثانيتان';
                                    else unit = 'ثوان';
                                    
                                    return (
                                        <option key={num} value={num}>
                                            {num === 0 ? unit : `${num} ${unit}`}
                                        </option>
                                    )
                                })}
                            </SettingSelect>
                        </div>
                    </div>
                     <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
                        <h4 className="font-medium mb-3">إعدادات الذكاء الاصطناعي</h4>
                        <div className="space-y-2">
                            <label htmlFor="apiKey" className="block text-sm font-medium">مفتاح Gemini API</label>
                            <input
                                type="password"
                                id="apiKey"
                                value={localApiKey}
                                onChange={(e) => setLocalApiKey(e.target.value)}
                                placeholder="أدخل مفتاحك هنا"
                                className="w-full p-2.5 rounded-md bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-green-500 ltr-input"
                                dir="ltr"
                            />
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                مفتاح API الخاص بك يُحفظ محلياً في متصفحك فقط.
                                <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-green-600 dark:text-green-500 hover:underline">
                                    {' '}الحصول على مفتاح
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
                 <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 text-left">
                    <button onClick={handleSaveAndClose} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-slate-800">تم</button>
                </div>
            </motion.div>
        </div>
    );
};

const TafsirModal: React.FC<{content: any, onClose: () => void}> = ({ content, onClose }) => {
    const modalRef = useRef<HTMLDivElement>(null);
    useFocusTrap(modalRef, onClose);

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <motion.div ref={modalRef} initial={{scale: 0.95, opacity: 0}} animate={{scale: 1, opacity: 1}} exit={{scale: 0.95, opacity: 0}}
              onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col" role="dialog" aria-modal="true" aria-labelledby="tafsir-title">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                    <h3 id="tafsir-title" className="font-bold text-lg">{content.tafsirName || 'التفسير'} - الآية {content.surahNumber}:{content.ayah.numberInSurah}</h3>
                    <button onClick={onClose} aria-label="Close Tafsir" className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"><XMarkIcon className="w-5 h-5" /></button>
                </div>
                <div className="p-6 overflow-y-auto space-y-4 text-right">
                    <div className="font-quran text-2xl leading-loose bg-slate-100 dark:bg-slate-700/50 p-4 rounded-md">{content.ayah.text}</div>
                    {content.isLoading && <div className="text-center p-4 flex justify-center items-center gap-2"><Spinner/> ...جاري تحميل التفسير</div>}
                    {content.error && <div className="text-center p-4 text-red-500" role="alert">{content.error}</div>}
                    {content.tafsir && <div className="text-lg leading-relaxed prose dark:prose-invert max-w-none">{content.tafsir.text}</div>}
                </div>
                 <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 text-left">
                    <button onClick={onClose} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-slate-800">إغلاق</button>
                </div>
            </motion.div>
        </div>
    );
};

// ======== UTILITY COMPONENTS & HOOKS ======== //

export const useDebounce = <T,>(value: T, delay: number): T => {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
};

export const useFocusTrap = (ref: React.RefObject<HTMLElement>, onClose: () => void) => {
    const triggerRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        triggerRef.current = document.activeElement as HTMLElement;
        const focusableElements = ref.current?.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements?.[0];
        firstElement?.focus();

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'Tab' && ref.current) {
                const elements = Array.from(focusableElements || []);
                if (elements.length === 0) return;
                const first = elements[0];
                const last = elements[elements.length - 1];
                if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); } 
                else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            triggerRef.current?.focus();
        };
    }, [ref, onClose]);
};

export const SettingSelect: React.FC<React.PropsWithChildren<{id: string; label: string; value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;}>> = ({id, label, children, ...props}) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium mb-1">{label}</label>
        <select id={id} {...props} className="w-full p-2.5 rounded-md bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-green-500">
            {children}
        </select>
    </div>
);

export const Spinner: React.FC = () => (
    <svg className="animate-spin h-5 w-5 text-slate-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);


export default App;