import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Howl, Howler } from 'howler';
import { Ayah, Surah, SurahSimple, QuranDivision } from '../types';
import * as api from '../services/quranApi';
import { useApp } from '../App';
import {
    HeadphonesIcon, ArrowRightIcon, ChevronLeftIcon, BookOpenIcon, FolderIcon, PlayIcon, PauseIcon,
    PreviousIcon, NextIcon, RepeatIcon, SpeakerWaveIcon, SpeakerXMarkIcon, XMarkIcon
} from './Icons';
import { juzs, pages, hizbs, rubs } from '../data/quranicDivisions';
import { motion, AnimatePresence } from 'framer-motion';


// Define types for clarity
type DivisionItem = SurahSimple | QuranDivision | { name: string; number: number };
interface DivisionConfig {
    id: string;
    title: string;
    items: DivisionItem[];
    itemLabel: string;
    icon: React.FC<{ className?: string }>;
}
type Playlist = {
    title: string;
    ayahs: Ayah[];
};

const MotionDiv = motion('div');

export const ListenPage: React.FC = () => {
    const { settings, setError, navigateTo } = useApp();
    const [playlist, setPlaylist] = useState<Playlist | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handlePlayRequest = async (item: DivisionItem, config: DivisionConfig) => {
        setIsLoading(true);
        setError(null);
        let ayahs: Ayah[] = [];
        let title = '';

        try {
            if (config.id === 'surahs') {
                const surah = item as SurahSimple;
                const fullSurah = await api.getSurah(surah.number, settings.reciter);
                ayahs = fullSurah.ayahs;
                title = `سورة ${surah.name}`;
            } else {
                const division = item as QuranDivision;
                const surahNumbers = Array.from({ length: division.end.surah - division.start.surah + 1 }, (_, i) => division.start.surah + i);
                const surahPromises = surahNumbers.map(num => api.getSurah(num, settings.reciter));
                const fetchedSurahs = await Promise.all(surahPromises);
                
                ayahs = fetchedSurahs.flatMap(s => s.ayahs).filter(a => {
                    if (!a.surah) return false;
                    const inRange = (sNum: number, aNum: number) => 
                        (sNum > division.start.surah || (sNum === division.start.surah && aNum >= division.start.ayah)) &&
                        (sNum < division.end.surah || (sNum === division.end.surah && aNum <= division.end.ayah));
                    return inRange(a.surah.number, a.numberInSurah);
                });
                title = `${config.itemLabel} ${division.number}`;
            }
            setPlaylist({ title, ayahs });
        } catch (e) {
            setError(`فشل تحميل المقطع الصوتي.`);
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const renderContent = () => {
        if (isLoading) {
            return <div className="text-center p-10 flex items-center justify-center gap-2"><Spinner/> جاري التحميل...</div>;
        }
        if (playlist) {
            return <PlayerView playlist={playlist} onBack={() => setPlaylist(null)} />;
        }
        return (
             <div>
                <header className="flex items-center gap-4 mb-6">
                    <button onClick={() => navigateTo('home')} aria-label="الرجوع للقائمة الرئيسية" className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                        <ArrowRightIcon className="w-6 h-6 transform -scale-x-100" />
                    </button>
                    <h1 className="text-2xl md:text-3xl font-bold">الاستماع للقرآن الكريم</h1>
                </header>
                <SelectionView onPlayRequest={handlePlayRequest} />
            </div>
        );
    };
    
    return (
        <div className="max-w-4xl mx-auto">
            <AnimatePresence mode="wait">
                <MotionDiv
                    key={playlist ? 'player' : 'selection'}
                    initial={{ opacity: 0, x: playlist ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: playlist ? -20 : 20 }}
                    transition={{ duration: 0.25 }}
                >
                    {renderContent()}
                </MotionDiv>
            </AnimatePresence>
        </div>
    );
};

const SelectionView: React.FC<{onPlayRequest: (item: DivisionItem, config: DivisionConfig) => void}> = ({ onPlayRequest }) => {
    const { surahList } = useApp();
    const [activeList, setActiveList] = useState<DivisionConfig | null>(null);

    const surahMap = useMemo(() => new Map(surahList.map(s => [s.number, s.name])), [surahList]);

    const divisions = useMemo((): DivisionConfig[] => [
        { id: 'surahs', title: 'السور', items: surahList, itemLabel: 'سورة', icon: BookOpenIcon },
        { id: 'juzs', title: 'الأجزاء', items: juzs, itemLabel: 'جزء', icon: BookOpenIcon },
        { id: 'hizbs', title: 'الأحزاب', items: hizbs, itemLabel: 'حزب', icon: BookOpenIcon },
        { id: 'pages', title: 'الصفحات', items: pages, itemLabel: 'صفحة', icon: BookOpenIcon },
    ], [surahList]);

    return (
         <AnimatePresence mode="wait">
            {activeList ? (
                <MotionDiv key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <ListView list={activeList} onBack={() => setActiveList(null)} onSelect={(item) => onPlayRequest(item, activeList)} surahMap={surahMap} />
                </MotionDiv>
            ) : (
                 <MotionDiv key="index" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <p className="text-slate-600 dark:text-slate-400 mb-6">اختر ما تود الاستماع إليه من الفهارس التالية.</p>
                    <IndexGrid divisions={divisions} onSelect={setActiveList} />
                </MotionDiv>
            )}
        </AnimatePresence>
    );
};

const IndexGrid: React.FC<{ divisions: DivisionConfig[]; onSelect: (config: DivisionConfig) => void; }> = ({ divisions, onSelect }) => (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        {divisions.map((div) => (
            <button key={div.id} onClick={() => onSelect(div)} className="p-4 md:p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-sm text-center hover:shadow-md hover:-translate-y-1 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-slate-900">
                <div.icon className="w-10 h-10 text-green-500 mx-auto" />
                <h2 className="text-lg font-bold mt-3">{div.title}</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{div.items.length > 0 ? `${div.items.length} ${div.itemLabel}` : 'قريباً'}</p>
            </button>
        ))}
    </div>
);

const ListView: React.FC<{ list: DivisionConfig; onBack: () => void; onSelect: (item: DivisionItem) => void; surahMap: Map<number, string>; }> = ({ list, onBack, onSelect, surahMap }) => (
    <div>
        <header className="flex items-center gap-4 mb-6">
            <button onClick={onBack} aria-label="الرجوع" className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                <ArrowRightIcon className="w-6 h-6 transform -scale-x-100" />
            </button>
            <h1 className="text-2xl md:text-3xl font-bold">{list.title}</h1>
        </header>
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm divide-y divide-slate-100 dark:divide-slate-700">
            {list.items.map((item: any, index: number) => (
                <button key={`${list.id}-${item.number || index}`} onClick={() => onSelect(item)} className="w-full flex items-center justify-between text-right p-4 hover:bg-green-50 dark:hover:bg-slate-700/50 transition-colors group">
                    <div>
                        <p className="font-semibold text-lg text-slate-800 dark:text-slate-200 group-hover:text-green-600 dark:group-hover:text-green-400">
                          {`${list.itemLabel} ${item.number}`}
                          {list.id === 'surahs' && ` - ${item.name}`}
                        </p>
                        {list.id !== 'surahs' && item.start && (
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                يبدأ من: سورة {surahMap.get(item.start.surah)}، آية {item.start.ayah}
                            </p>
                        )}
                    </div>
                    <ChevronLeftIcon className="w-5 h-5 text-slate-400 group-hover:text-green-500 transition-colors" />
                </button>
            ))}
        </div>
    </div>
);


const PlayerView: React.FC<{ playlist: Playlist, onBack: () => void }> = ({ playlist, onBack }) => {
    const { settings, setError } = useApp();
    const { ayahs, title } = playlist;
    
    // Player state
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentAyahIndex, setCurrentAyahIndex] = useState(0);
    const [repeatMode, setRepeatMode] = useState<'none' | 'one' | 'all'>('all');
    const [playbackRate, setPlaybackRate] = useState(settings.memorization.playbackRate);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);

    const howlRef = useRef<Howl | null>(null);
    const soundIdRef = useRef<number | null>(null);
    const progressAnimationFrameRef = useRef<number>();
    const ayahListRef = useRef<HTMLDivElement>(null);
    const activeAyahRef = useRef<HTMLDivElement>(null);
    const playAyahFn = useRef<((index: number) => void) | null>(null);

    const playerStateRef = useRef({ repeatMode, ayahs });
    useEffect(() => { playerStateRef.current = { repeatMode, ayahs }; }, [repeatMode, ayahs]);

    const repeatAriaLabel = useMemo(() => {
        // This label describes the *action* the button will perform.
        const modes = ['all', 'one', 'none'] as const;
        const currentModeIndex = modes.indexOf(repeatMode);
        const nextMode = modes[(currentModeIndex + 1) % modes.length];

        switch(nextMode) {
            case 'all': return "تفعيل تكرار القائمة";
            case 'one': return "تفعيل تكرار الآية الحالية";
            case 'none': return "إيقاف التكرار";
            default: return "تغيير وضع التكرار"; // Fallback
        }
    }, [repeatMode]);

    const cleanupPlayer = useCallback(() => {
        if (howlRef.current) {
            howlRef.current.unload();
        }
        howlRef.current = null;
        if(progressAnimationFrameRef.current) cancelAnimationFrame(progressAnimationFrameRef.current);
    }, []);
    
    const playAyah = useCallback((index: number) => {
        cleanupPlayer();
        if (index < 0 || index >= ayahs.length) {
            setIsPlaying(false);
            return;
        }

        setCurrentAyahIndex(index);
        const ayah = ayahs[index];
        const sources = [ayah.audio, ...(ayah.audioSecondarys || [])].filter(Boolean);

        const newHowl = new Howl({
            src: sources,
            html5: true,
            rate: playbackRate,
            sprite: {
                _play: [0, 300000] // 5 minutes, should be enough for any ayah
            }
        });

        newHowl.on('load', () => {
            setDuration(newHowl.duration());
        });
        newHowl.on('play', () => setIsPlaying(true));
        newHowl.on('pause', () => setIsPlaying(false));
        newHowl.on('stop', () => setIsPlaying(false));
        newHowl.on('end', (soundId: number) => {
             setTimeout(() => {
                setCurrentAyahIndex(prevIndex => {
                    const { repeatMode, ayahs: currentAyahs } = playerStateRef.current;
                    if (repeatMode === 'one') {
                        playAyahFn.current?.(prevIndex);
                        return prevIndex;
                    }
                    const nextIndex = prevIndex + 1;
                    if (nextIndex >= currentAyahs.length) {
                        if (repeatMode === 'all') { // Loop back to start
                            playAyahFn.current?.(0);
                            return 0;
                        }
                        setIsPlaying(false); // 'none' mode: stop at the end
                        return prevIndex;
                    }
                    // For 'all' and 'none' modes when not at the end
                    playAyahFn.current?.(nextIndex);
                    return nextIndex;
                });
            }, settings.memorization.delay * 1000 || 500);
        });
        newHowl.on('loaderror', (id, err) => setError(`فشل تحميل الصوت: ${err}`));
        newHowl.on('playerror', (id, err) => setError(`فشل تشغيل الصوت: ${err}`));
        
        soundIdRef.current = newHowl.play('_play');
        howlRef.current = newHowl;
    }, [ayahs, playbackRate, setError, cleanupPlayer, settings.memorization.delay]);

    useEffect(() => {
        playAyahFn.current = playAyah;
    }, [playAyah]);

    useEffect(() => {
        if (ayahs.length > 0) {
            playAyah(0); // Autoplay first ayah on load
        }
        return cleanupPlayer;
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ayahs]);

    useEffect(() => {
        howlRef.current?.rate(playbackRate);
    }, [playbackRate]);

    useEffect(() => {
      if (activeAyahRef.current) {
        activeAyahRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, [currentAyahIndex]);

    const updateProgress = useCallback(() => {
        if (howlRef.current && soundIdRef.current && howlRef.current.playing(soundIdRef.current)) {
            const seek = howlRef.current.seek(soundIdRef.current);
            if (typeof seek === 'number') {
                setProgress(seek);
            }
        }
        progressAnimationFrameRef.current = requestAnimationFrame(updateProgress);
    }, []);

    useEffect(() => {
        if (isPlaying) {
            progressAnimationFrameRef.current = requestAnimationFrame(updateProgress);
        } else {
            if(progressAnimationFrameRef.current) cancelAnimationFrame(progressAnimationFrameRef.current);
        }
        return () => {
            if(progressAnimationFrameRef.current) cancelAnimationFrame(progressAnimationFrameRef.current);
        };
    }, [isPlaying, updateProgress]);

    const handlePlayPause = () => {
        const h = howlRef.current;
        if (isPlaying) {
            h?.pause(soundIdRef.current!);
        } else {
             if(h?.state() === 'loaded') {
                h?.play(soundIdRef.current!);
             } else {
                playAyah(currentAyahIndex);
             }
        }
    };
    const handleNext = () => {
       const nextIndex = (currentAyahIndex + 1) % ayahs.length;
       playAyah(nextIndex);
    }
    const handlePrevious = () => {
       const prevIndex = (currentAyahIndex - 1 + ayahs.length) % ayahs.length;
       playAyah(prevIndex);
    }
    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTime = parseFloat(e.target.value);
        if (howlRef.current && typeof soundIdRef.current === 'number') {
             howlRef.current.seek(newTime, soundIdRef.current);
        }
        setProgress(newTime);
    };

    const currentAyah = ayahs[currentAyahIndex];
    
    if (!currentAyah) {
        return (
            <div className="text-center p-8">
                <p>لا يوجد آيات في قائمة التشغيل هذه.</p>
                <button onClick={onBack} className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg">الرجوع</button>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[calc(100vh-10rem)] md:h-[calc(100vh-8rem)]">
             <header className="flex items-center gap-4 mb-4 flex-shrink-0">
                <button onClick={onBack} aria-label="الرجوع للاختيار" className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                    <ArrowRightIcon className="w-6 h-6 transform -scale-x-100" />
                </button>
                <div>
                     <h1 className="text-2xl font-bold">{title}</h1>
                     <p className="text-slate-600 dark:text-slate-400">{ayahs.length} آيات</p>
                </div>
            </header>
            
            <div ref={ayahListRef} className="flex-grow overflow-y-auto space-y-1 pr-2">
                {ayahs.map((ayah, index) => {
                    const isActive = index === currentAyahIndex;
                    return (
                        <div 
                          key={ayah.number}
                          ref={isActive ? activeAyahRef : null}
                          className={`p-4 rounded-xl transition-colors duration-300 relative ${
                            isActive ? 'bg-green-100 dark:bg-green-500/10 text-green-800 dark:text-green-200' : 'text-slate-700 dark:text-slate-300'
                          }`}
                        >
                           <p dir="rtl" className="font-quran text-3xl leading-loose text-right">
                                {ayah.text}
                                <span className={`font-mono text-xl transition-colors ${isActive ? 'text-green-500' : 'text-slate-400'}`}> ({ayah.numberInSurah})</span>
                           </p>
                        </div>
                    );
                })}
            </div>
            
            <div className="flex-shrink-0 bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-4 mt-4">
                <div className="flex items-center gap-4">
                     <div className="text-center w-28">
                         <p className="font-quran text-2xl">{currentAyah.surah?.name}</p>
                         <p className="text-sm font-mono">{currentAyah.numberInSurah}</p>
                     </div>
                     <div className="flex-grow space-y-2">
                         <div className="flex items-center justify-center gap-4">
                             <button onClick={handlePrevious} aria-label="السابق" className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 transition"><PreviousIcon className="w-6 h-6"/></button>
                            <button onClick={handlePlayPause} aria-label={isPlaying ? 'إيقاف مؤقت' : 'تشغيل'} className="p-3 rounded-full bg-green-600 text-white hover:bg-green-700 transition mx-2">
                                {isPlaying ? <PauseIcon className="w-8 h-8"/> : <PlayIcon className="w-8 h-8"/>}
                            </button>
                            <button onClick={handleNext} aria-label="التالي" className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 transition"><NextIcon className="w-6 h-6"/></button>
                         </div>
                         <PlayerProgressBar progress={progress} duration={duration} onSeek={handleSeek} />
                     </div>
                     <div className="flex flex-col gap-2 items-center">
                        <button
                            onClick={() => {
                                const modes = ['all', 'one', 'none'] as const;
                                const nextMode = modes[(modes.indexOf(repeatMode) + 1) % modes.length];
                                setRepeatMode(nextMode);
                            }}
                            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors relative"
                            aria-label={repeatAriaLabel}
                        >
                            <RepeatIcon className={`w-5 h-5 ${repeatMode !== 'none' ? 'text-green-500' : ''}`} />
                            {repeatMode === 'one' && <span aria-hidden="true" className="absolute -bottom-1 -right-1 bg-green-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">1</span>}
                        </button>
                        <select value={playbackRate} onChange={e => setPlaybackRate(parseFloat(e.target.value))} aria-label="سرعة القراءة" className="bg-transparent text-sm font-semibold rounded-md text-center appearance-none focus:outline-none focus:ring-1 focus:ring-green-500">
                           <option value="0.75">0.75x</option>
                           <option value="1">1x</option>
                           <option value="1.25">1.25x</option>
                           <option value="1.5">1.5x</option>
                       </select>
                     </div>
                </div>
            </div>
        </div>
    );
};

const PlayerProgressBar: React.FC<{ progress: number, duration: number, onSeek: (e: React.ChangeEvent<HTMLInputElement>) => void }> = ({ progress, duration, onSeek }) => {
    const formatTime = (secs: number) => {
        const minutes = Math.floor(secs / 60) || 0;
        const seconds = Math.floor(secs - minutes * 60) || 0;
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    return (
        <div className="flex items-center gap-2 text-xs font-mono">
            <span>{formatTime(progress)}</span>
            <input
                type="range"
                min="0"
                max={duration || 1}
                step="0.1"
                value={progress}
                onChange={onSeek}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-green-600"
                aria-label="Seek audio"
            />
            <span>{formatTime(duration)}</span>
        </div>
    );
};

const Spinner: React.FC = () => (
    <svg className="animate-spin h-5 w-5 text-slate-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);