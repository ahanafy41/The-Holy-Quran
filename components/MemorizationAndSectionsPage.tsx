import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Howl } from 'howler';
import { Ayah, SavedSection, SurahSimple } from '../types';
import * as api from '../services/quranApi';
import { useApp } from '../App';
import { FlowerIcon, PlayIcon, PauseIcon, PreviousIcon, NextIcon, ArrowRightIcon, BookOpenIcon, TrashIcon, XMarkIcon, MicrophoneIcon } from './Icons';
import { motion, AnimatePresence } from 'framer-motion';
import { SamiaSessionModal } from './SamiaSessionModal';


const MotionDiv = motion('div');

type PlayerPlaylist = {
    section: SavedSection;
    ayahs: Ayah[];
};

export const MemorizationAndSectionsPage: React.FC = () => {
    const { savedSections, settings, setError, addSavedSection, removeSavedSection, navigateTo, surahList, apiKey, showSettings } = useApp();
    const [playlist, setPlaylist] = useState<PlayerPlaylist | null>(null);
    const [samiaPlaylist, setSamiaPlaylist] = useState<PlayerPlaylist | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    const handleStartListening = async (section: SavedSection) => {
        setIsLoading(true);
        setError(null);
        try {
            const surahData = await api.getSurah(section.surahNumber, settings.reciter);
            const sectionAyahs = surahData.ayahs.filter(
                ayah => ayah.numberInSurah >= section.startAyah && ayah.numberInSurah <= section.endAyah
            );
            setPlaylist({ section, ayahs: sectionAyahs });
        } catch (e) {
            setError('فشل تحميل المقطع للاستماع.');
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleStartSamia = async (section: SavedSection) => {
        if (!apiKey) {
            setError('يرجى إدخال مفتاح API الخاص بك في الإعدادات لاستخدام ميزة التسميع.');
            showSettings();
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            // We don't need reciter for Samia mode, but getSurah requires it. We can use any valid one.
            const surahData = await api.getSurah(section.surahNumber, settings.reciter);
            const sectionAyahs = surahData.ayahs.filter(
                ayah => ayah.numberInSurah >= section.startAyah && ayah.numberInSurah <= section.endAyah
            );
            setSamiaPlaylist({ section, ayahs: sectionAyahs });
        } catch (e) {
            setError('فشل تحميل بيانات المقطع للتسميع.');
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleReadSection = (section: SavedSection) => {
        const surahInfo = surahList.find(s => s.number === section.surahNumber);
        const title = `${section.name} (سورة ${surahInfo?.name || section.surahNumber})`;
        navigateTo('division', {
            division: {
                number: 0,
                start: { surah: section.surahNumber, ayah: section.startAyah },
                end: { surah: section.surahNumber, ayah: section.endAyah },
                title: title,
                startSurahName: surahInfo?.name,
            }
        });
    };

    const renderContent = () => {
        if (isLoading) {
            return <div className="text-center p-10 flex items-center justify-center gap-2"><Spinner/> جاري التحضير...</div>;
        }
         if (samiaPlaylist) {
            return <SamiaSessionModal playlist={samiaPlaylist} onClose={() => setSamiaPlaylist(null)} />;
        }
        if (playlist) {
            return <PlayerView playlist={playlist} onBack={() => setPlaylist(null)} />;
        }
        return (
            <SectionListView 
                savedSections={savedSections} 
                onStartListening={handleStartListening}
                onStartSamia={handleStartSamia}
                onReadSection={handleReadSection}
                onAddSection={() => setIsCreating(true)}
                onRemoveSection={removeSavedSection}
            />
        );
    };

    return (
        <div className="max-w-4xl mx-auto">
            <AnimatePresence>
                {isCreating && (
                    <CreateSectionModal 
                        onClose={() => setIsCreating(false)} 
                        onSave={(section) => {
                            addSavedSection(section);
                            setIsCreating(false);
                        }}
                    />
                )}
            </AnimatePresence>
            <AnimatePresence mode="wait">
                <MotionDiv
                    key={playlist ? 'player' : samiaPlaylist ? 'samia' : 'selection'}
                    initial={{ opacity: 0, x: (playlist || samiaPlaylist) ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: (playlist || samiaPlaylist) ? -20 : 20 }}
                    transition={{ duration: 0.25 }}
                >
                    {renderContent()}
                </MotionDiv>
            </AnimatePresence>
        </div>
    );
};

const SectionListView: React.FC<{
    savedSections: SavedSection[];
    onStartListening: (section: SavedSection) => void;
    onStartSamia: (section: SavedSection) => void;
    onReadSection: (section: SavedSection) => void;
    onAddSection: () => void;
    onRemoveSection: (id: string) => void;
}> = ({ savedSections, onStartListening, onStartSamia, onReadSection, onAddSection, onRemoveSection }) => {
    
    const { surahList, navigateTo } = useApp();
    const surahMap = useMemo(() => new Map(surahList.map(s => [s.number, s.name])), [surahList]);

    return (
        <div className="space-y-6">
            <header className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                     <button onClick={() => navigateTo('home')} aria-label="الرجوع للقائمة الرئيسية" className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                        <ArrowRightIcon className="w-6 h-6 transform -scale-x-100" />
                    </button>
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold">الحفظ والمراجعة</h1>
                        <p className="text-slate-600 dark:text-slate-400">أنشئ وراجع مقاطعك المحفوظة.</p>
                    </div>
                </div>
                <button onClick={onAddSection} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition-colors flex-shrink-0">
                   إضافة مقطع
                </button>
            </header>
            
            {savedSections.length === 0 ? (
                <div className="text-center p-8 space-y-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm">
                    <FlowerIcon className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600" />
                    <h3 className="text-xl font-semibold">لا توجد مقاطع محفوظة</h3>
                    <p className="text-slate-500 dark:text-slate-400">انقر على "إضافة مقطع" لإنشاء مقطعك الأول.</p>
                </div>
            ) : (
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm divide-y divide-slate-100 dark:divide-slate-700">
                    {savedSections.map(section => (
                        <div key={section.id} className="p-4 flex flex-wrap items-center justify-between gap-4 group">
                             <div className="text-right flex-grow">
                                <h3 className="font-bold text-lg text-green-600 dark:text-green-500">{section.name}</h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    سورة {surahMap.get(section.surahNumber) || '...'} | الآيات: {section.startAyah} - {section.endAyah}
                                </p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                                <button onClick={() => onRemoveSection(section.id)} aria-label={`حذف مقطع ${section.name}`}
                                    className="w-9 h-9 flex items-center justify-center rounded-full text-slate-400 hover:bg-red-100 hover:text-red-500 dark:hover:bg-red-900/50 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100">
                                    <TrashIcon className="w-5 h-5"/>
                                </button>
                                <button onClick={() => onReadSection(section)} aria-label={`قراءة مقطع ${section.name}`}
                                    className="w-9 h-9 flex items-center justify-center rounded-full text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-700 transition-colors">
                                    <BookOpenIcon className="w-5 h-5"/>
                                </button>
                                 <button onClick={() => onStartSamia(section)} aria-label={`تسميع مقطع ${section.name}`}
                                    className="px-3 py-2 text-sm font-semibold flex items-center gap-2 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:hover:bg-blue-500/30 transition-colors">
                                    <MicrophoneIcon className="w-4 h-4" />
                                    <span>تسميع</span>
                                </button>
                                <button onClick={() => onStartListening(section)} aria-label={`بدء الحفظ لمقطع ${section.name}`}
                                    className="px-3 py-2 text-sm font-semibold flex items-center gap-2 bg-green-100 text-green-700 rounded-full hover:bg-green-200 dark:bg-green-500/20 dark:text-green-300 dark:hover:bg-green-500/30 transition-colors">
                                    <PlayIcon className="w-4 h-4" />
                                    <span>استماع</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const PlayerView: React.FC<{ playlist: PlayerPlaylist, onBack: () => void }> = ({ playlist, onBack }) => {
    const { settings, setError } = useApp();
    const { ayahs, section } = playlist;
    
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentAyahIndex, setCurrentAyahIndex] = useState(0);
    const [repetitionCount, setRepetitionCount] = useState(1);
    
    const howlRef = useRef<Howl | null>(null);
    const soundIdRef = useRef<number | null>(null);
    const timeoutRef = useRef<number>();
    const playAyahRef = useRef<((index: number) => void) | null>(null);

    const cleanupPlayer = useCallback(() => {
        howlRef.current?.unload();
        howlRef.current = null;
        soundIdRef.current = null;
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
    }, []);

    const playAyah = useCallback((index: number) => {
        cleanupPlayer();
        if (index < 0 || index >= ayahs.length) {
            setIsPlaying(false);
            return;
        }

        setCurrentAyahIndex(index);
        setRepetitionCount(1);
        const ayah = ayahs[index];
        const sources = [ayah.audio, ...(ayah.audioSecondarys || [])].filter(Boolean);

        const newHowl = new Howl({
            src: sources,
            html5: true,
            rate: settings.memorization.playbackRate,
            sprite: {
                _play: [0, 300000] // 5 minutes, should be enough for any ayah
            }
        });

        newHowl.on('play', () => setIsPlaying(true));
        newHowl.on('pause', () => setIsPlaying(false));
        newHowl.on('stop', () => setIsPlaying(false));
        newHowl.on('end', (id) => {
            if (repetitionCount < settings.memorization.repetitions) {
                timeoutRef.current = window.setTimeout(() => {
                    if (typeof id === 'number' && howlRef.current) {
                        howlRef.current.stop(id);
                        howlRef.current.play(id);
                    }
                }, 500);
                setRepetitionCount(prev => prev + 1);
            } else {
                const nextIndex = currentAyahIndex + 1;
                if (nextIndex < ayahs.length) {
                    timeoutRef.current = window.setTimeout(() => {
                        playAyahRef.current?.(nextIndex);
                    }, settings.memorization.delay * 1000);
                } else {
                    setIsPlaying(false); // End of playlist
                }
            }
        });
        newHowl.on('loaderror', (id, err) => setError(`فشل تحميل الصوت للآية ${ayah.numberInSurah}.`));
        newHowl.on('playerror', (id, err) => setError(`فشل تشغيل الصوت للآية ${ayah.numberInSurah}.`));
        
        soundIdRef.current = newHowl.play('_play');
        howlRef.current = newHowl;
    }, [ayahs, cleanupPlayer, settings, setError, currentAyahIndex, repetitionCount]);
    
    useEffect(() => {
        playAyahRef.current = playAyah;
    }, [playAyah]);
    
    useEffect(() => {
        if (ayahs.length > 0) {
            playAyah(0);
        }
        return cleanupPlayer;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ayahs]);
    
    const handlePlayPause = () => {
        if (isPlaying) {
            howlRef.current?.pause(soundIdRef.current!);
        } else {
            if (howlRef.current?.state() === 'loaded') {
                howlRef.current?.play(soundIdRef.current!);
            } else {
                playAyah(currentAyahIndex);
            }
        }
    };
    
    const handleNext = () => playAyah((currentAyahIndex + 1) % ayahs.length);
    const handlePrevious = () => playAyah((currentAyahIndex - 1 + ayahs.length) % ayahs.length);

    const currentAyah = ayahs[currentAyahIndex];
    
    return (
        <div className="flex flex-col h-[calc(100vh-10rem)] md:h-[calc(100vh-8rem)]">
             <header className="flex items-center gap-4 mb-4 flex-shrink-0">
                <button onClick={onBack} aria-label="الرجوع للاختيار" className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                    <ArrowRightIcon className="w-6 h-6 transform -scale-x-100" />
                </button>
                <div>
                     <h1 className="text-2xl font-bold">{section.name}</h1>
                     <p className="text-slate-600 dark:text-slate-400">الآية {currentAyahIndex + 1} من {ayahs.length} | التكرار {repetitionCount} من {settings.memorization.repetitions}</p>
                </div>
            </header>
            
            <div className="flex-grow overflow-hidden flex items-center justify-center p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-inner">
                {currentAyah && (
                    <p dir="rtl" className="font-quran text-4xl md:text-5xl lg:text-6xl leading-loose text-center">
                        {currentAyah.text}
                    </p>
                )}
            </div>
            
            <div className="flex-shrink-0 bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-4 mt-4">
                <div className="flex items-center justify-center gap-4">
                     <button onClick={handlePrevious} aria-label="السابق" className="p-3 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 transition"><PreviousIcon className="w-6 h-6"/></button>
                    <button onClick={handlePlayPause} aria-label={isPlaying ? 'إيقاف مؤقت' : 'تشغيل'} className="p-4 rounded-full bg-green-600 text-white hover:bg-green-700 transition mx-4">
                        {isPlaying ? <PauseIcon className="w-10 h-10"/> : <PlayIcon className="w-10 h-10"/>}
                    </button>
                    <button onClick={handleNext} aria-label="التالي" className="p-3 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 transition"><NextIcon className="w-6 h-6"/></button>
                </div>
            </div>
        </div>
    );
};

const CreateSectionModal: React.FC<{onClose: () => void, onSave: (section: Omit<SavedSection, 'id'>) => void}> = ({ onClose, onSave }) => {
    const { surahList } = useApp();
    const [selectedSurah, setSelectedSurah] = useState<SurahSimple | null>(null);
    const [startAyah, setStartAyah] = useState<number | null>(null);
    const [endAyah, setEndAyah] = useState<number | null>(null);
    const [sectionName, setSectionName] = useState('');
    const [error, setError] = useState('');
    const modalRef = useRef<HTMLDivElement>(null);

    const handleAyahClick = (ayahNum: number) => {
        setError('');
        if (startAyah === null || (startAyah !== null && endAyah !== null)) {
            setStartAyah(ayahNum);
            setEndAyah(null);
        } else {
            if (ayahNum < startAyah) { setEndAyah(startAyah); setStartAyah(ayahNum); }
            else { setEndAyah(ayahNum); }
        }
    };

    const handleSaveClick = () => {
        if (!sectionName.trim()) { setError('يرجى إدخال اسم للمقطع.'); return; }
        if (!selectedSurah || startAyah === null || endAyah === null) { setError('يرجى تحديد سورة ونطاق آيات صحيح.'); return; }
        onSave({ name: sectionName.trim(), surahNumber: selectedSurah.number, startAyah, endAyah });
    };
    
    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <MotionDiv ref={modalRef} initial={{scale:0.9, opacity:0}} animate={{scale:1, opacity:1}} exit={{scale:0.9, opacity:0}}
                onClick={e => e.stopPropagation()} className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-lg flex flex-col" role="dialog" aria-modal="true" aria-labelledby="create-section-title">
                <header className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                    <h3 id="create-section-title" className="font-bold text-lg">إضافة مقطع جديد</h3>
                    <button onClick={onClose} aria-label="Close" className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"><XMarkIcon className="w-5 h-5" /></button>
                </header>
                <div className="p-6 space-y-4 text-right">
                    <input type="text" value={sectionName} onChange={e => setSectionName(e.target.value)} placeholder="اسم المقطع (مثال: مراجعة الأسبوع)"
                        className="w-full p-2.5 rounded-md bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-right focus:outline-none focus:ring-2 focus:ring-green-500" />
                    <select value={selectedSurah?.number || ''}
                        onChange={e => {
                            const surah = surahList.find(s => s.number === parseInt(e.target.value)) || null;
                            setSelectedSurah(surah);
                            setStartAyah(null); setEndAyah(null);
                        }}
                        className="w-full p-2.5 rounded-md bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-right appearance-none focus:outline-none focus:ring-2 focus:ring-green-500">
                        <option value="" disabled>-- اختر سورة --</option>
                        {surahList.map(s => <option key={s.number} value={s.number}>{s.number}. {s.name} ({s.englishName})</option>)}
                    </select>

                    {selectedSurah && (
                        <div>
                            <p className="text-sm font-medium mb-2 text-right">اختر بداية ونهاية المقطع:</p>
                            <div className="grid grid-cols-7 sm:grid-cols-10 gap-1.5 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700 max-h-52 overflow-y-auto">
                                {Array.from({ length: selectedSurah.numberOfAyahs }, (_, i) => i + 1).map(num => {
                                    const isSelected = startAyah !== null && endAyah !== null && num >= startAyah && num <= endAyah;
                                    const isEndpoint = num === startAyah || num === endAyah;
                                    return (
                                        <button key={num} onClick={() => handleAyahClick(num)} aria-pressed={isSelected}
                                            className={`p-1.5 h-9 rounded text-sm font-mono transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-green-500
                                            ${isEndpoint ? 'bg-green-600 text-white font-bold' : isSelected ? 'bg-green-200 dark:bg-green-800/60' : 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600'}`}>
                                            {num}
                                        </button>
                                    );
                                })}
                            </div>
                            {startAyah && <div aria-live="polite" className="text-right text-sm mt-2 text-slate-600 dark:text-slate-400">
                                {endAyah ? `المحدد: من الآية ${startAyah} إلى ${endAyah}`: `البداية: الآية ${startAyah}. اختر آية النهاية.`}
                            </div>}
                        </div>
                    )}
                </div>
                {error && <p className="text-red-500 text-sm text-center px-6 pb-2" role="alert">{error}</p>}
                <footer className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500 font-semibold">إلغاء</button>
                    <button onClick={handleSaveClick} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold">حفظ المقطع</button>
                </footer>
            </MotionDiv>
        </div>
    );
};


const Spinner: React.FC = () => (
    <svg className="animate-spin h-5 w-5 text-slate-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);