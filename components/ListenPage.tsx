
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { SurahSimple } from '../types';
import { ListeningReciter } from '../types';
import { useApp } from '../context/AppContext';
import { ChevronLeftIcon, ArrowRightIcon, SpeakerWaveIcon, SearchIcon } from './Icons';
import { motion, AnimatePresence } from 'framer-motion';
import { Spinner } from './Spinner';
import { ListenPlayerView } from './ListenPlayerView';

type View = 'reciters' | 'surahs' | 'player';

export const ListenPage: React.FC = () => {
    const { listeningReciters, surahList, isLoading } = useApp();
    const [view, setView] = useState<View>('reciters');
    const [selectedReciter, setSelectedReciter] = useState<ListeningReciter | null>(null);
    const [selectedSurah, setSelectedSurah] = useState<SurahSimple | null>(null);

    const availableSurahsForSelectedReciter = useMemo(() => {
        if (!selectedReciter || !selectedReciter.surah_list) return surahList;
        const availableNumbers = new Set(selectedReciter.surah_list.split(',').map(Number));
        return surahList.filter(s => availableNumbers.has(s.number));
    }, [selectedReciter, surahList]);
    
    const handleReciterSelect = (reciter: ListeningReciter) => {
        setSelectedReciter(reciter);
        setView('surahs');
    };

    const handleSurahSelect = (surah: SurahSimple) => {
        setSelectedSurah(surah);
        setView('player');
    };
    
    const handleTrackChange = (direction: 'next' | 'prev') => {
        if (!selectedSurah) return;
        const currentSurahIndex = availableSurahsForSelectedReciter.findIndex(s => s.number === selectedSurah.number);
        
        if (currentSurahIndex === -1) return; // Should not happen

        const nextIndex = direction === 'next' ? currentSurahIndex + 1 : currentSurahIndex - 1;
        
        if (nextIndex >= 0 && nextIndex < availableSurahsForSelectedReciter.length) {
            setSelectedSurah(availableSurahsForSelectedReciter[nextIndex]);
        }
    }

    const handleBack = () => {
        if (view === 'player') setView('surahs');
        else if (view === 'surahs') setView('reciters');
    }
    
    const renderContent = () => {
        if (view === 'player' && selectedReciter && selectedSurah) {
            const currentSurahIndex = availableSurahsForSelectedReciter.findIndex(s => s.number === selectedSurah.number);
            const isFirst = currentSurahIndex === 0;
            const isLast = currentSurahIndex === availableSurahsForSelectedReciter.length - 1;
            return <ListenPlayerView reciter={selectedReciter} surah={selectedSurah} onBack={handleBack} onTrackChange={handleTrackChange} isFirst={isFirst} isLast={isLast} />;
        }
        if (view === 'surahs' && selectedReciter) {
            return <SurahListView reciter={selectedReciter} surahs={availableSurahsForSelectedReciter} onSelect={handleSurahSelect} onBack={handleBack} />;
        }
        return <ReciterListView reciters={listeningReciters} onSelect={handleReciterSelect} isLoading={isLoading} />;
    };
    
    const viewAnimation = {
        initial: { opacity: 0, x: 20 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -20 },
        transition: { duration: 0.25 }
    };
    
    return (
        <div className="max-w-4xl mx-auto">
             <AnimatePresence mode="wait">
                <motion.div
                    key={view}
                    {...viewAnimation}
                >
                    {renderContent()}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

const ReciterListView: React.FC<{reciters: ListeningReciter[], onSelect: (r: ListeningReciter) => void, isLoading: boolean}> = ({ reciters, onSelect, isLoading }) => {
    const titleRef = useRef<HTMLHeadingElement>(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => {
            titleRef.current?.focus();
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    const filteredReciters = useMemo(() => {
        if (!searchQuery.trim()) {
            return reciters;
        }
        return reciters.filter(reciter =>
            reciter.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [reciters, searchQuery]);

    if (isLoading) {
        return <div className="text-center p-10 flex items-center justify-center gap-2"><Spinner/> جاري تحميل القراء...</div>;
    }

    if (reciters.length === 0 && !searchQuery) {
        return (
            <div className="text-center p-10">
                <h2 className="text-xl font-semibold mb-2">لم يتم العثور على قراء</h2>
                <p className="text-slate-500">قد تكون هناك مشكلة في الاتصال بالإنترنت.</p>
            </div>
        );
    }
    
    return (
        <div>
            <header className="mb-6 space-y-4">
                <h1 ref={titleRef} tabIndex={-1} className="text-2xl md:text-3xl font-bold focus:outline-none">اختر القارئ</h1>
                <div className="relative">
                    <input
                        type="search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="ابحث عن قارئ..."
                        className="w-full h-12 px-4 pr-11 text-right bg-white dark:bg-slate-800 rounded-xl shadow-sm border-2 border-transparent focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                        aria-label="ابحث عن قارئ"
                    />
                    <div className="absolute top-0 right-0 h-12 w-12 flex items-center justify-center text-slate-400 dark:text-slate-500 pointer-events-none">
                        <SearchIcon className="w-5 h-5" />
                    </div>
                </div>
            </header>
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm">
                {filteredReciters.length > 0 ? (
                    <div className="divide-y divide-slate-100 dark:divide-slate-700">
                        {filteredReciters.map(reciter => (
                            <button key={reciter.identifier} onClick={() => onSelect(reciter)} className="w-full flex items-center justify-between text-right p-4 hover:bg-green-50 dark:hover:bg-slate-700/50 transition-colors group">
                                <div>
                                    <p className="font-semibold text-lg text-slate-800 dark:text-slate-200 group-hover:text-green-600 dark:group-hover:text-green-400">
                                        {reciter.name}
                                    </p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">{reciter.rewaya}</p>
                                </div>
                                <ChevronLeftIcon className="w-5 h-5 text-slate-400 group-hover:text-green-500 transition-colors" />
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                        <p>لم يتم العثور على نتائج للبحث "{searchQuery}"</p>
                    </div>
                )}
            </div>
        </div>
    )
}

const SurahListView: React.FC<{reciter: ListeningReciter, surahs: SurahSimple[], onSelect: (s: SurahSimple) => void, onBack: () => void}> = ({ reciter, surahs, onSelect, onBack }) => {
    const titleRef = useRef<HTMLHeadingElement>(null);
    useEffect(() => {
        const timer = setTimeout(() => {
            titleRef.current?.focus();
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div>
            <header className="flex items-center gap-4 mb-6">
                 <button onClick={onBack} aria-label="الرجوع لاختيار القارئ" className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                    <ArrowRightIcon className="w-6 h-6 transform -scale-x-100" />
                </button>
                <div>
                    <h1 ref={titleRef} tabIndex={-1} className="text-2xl md:text-3xl font-bold focus:outline-none">اختر السورة</h1>
                    <p className="text-slate-500 dark:text-slate-400">{reciter.name}</p>
                </div>
            </header>
             <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm divide-y divide-slate-100 dark:divide-slate-700">
                {surahs.map(surah => (
                     <button key={surah.number} onClick={() => onSelect(surah)} className="w-full flex items-center justify-between text-right p-4 hover:bg-green-50 dark:hover:bg-slate-700/50 transition-colors group">
                        <div className="flex items-center gap-4">
                            <span className="text-lg font-mono text-slate-400 group-hover:text-green-500">{surah.number}</span>
                             <div>
                                <p className="font-semibold text-lg text-slate-800 dark:text-slate-200 group-hover:text-green-600 dark:group-hover:text-green-400">
                                    {surah.name}
                                </p>
                                 <p className="text-sm text-slate-500 dark:text-slate-400">{surah.englishName}</p>
                             </div>
                        </div>
                        <SpeakerWaveIcon className="w-6 h-6 text-slate-400 group-hover:text-green-500 transition-colors" />
                    </button>
                ))}
            </div>
        </div>
    )
}