import React, { useState, useMemo, useRef, useEffect } from 'react';
import type { HisnCategory, HisnDhikr } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { SearchIcon, ChevronLeftIcon, ArrowRightIcon, PlayIcon, PauseIcon, CheckCircleIcon } from './Icons';

const MotionDiv = motion.div as any;

const DhikrCard: React.FC<{
    dhikr: HisnDhikr;
    progress: number;
    isPlaying: boolean;
    onCounterClick: () => void;
    onPlayClick: () => void;
}> = ({ dhikr, progress, isPlaying, onCounterClick, onPlayClick }) => {
    const isCompleted = progress === 0;

    const counterAriaLabel = isCompleted 
        ? `اكتمل الذكر: ${dhikr.text}` 
        : `الذكر: ${dhikr.text}. التكرار المتبقي: ${progress} من ${dhikr.count}. اضغط لإنقاص العداد.`;

    const playButtonAriaLabel = isPlaying ? 'إيقاف الصوت' : 'تشغيل الصوت';

    // The root is a non-interactive div.
    // Inside, we have two distinct buttons for the two actions.
    return (
        <div className={`relative group bg-white dark:bg-slate-800 rounded-2xl shadow-sm transition-all duration-300 overflow-hidden ${isCompleted ? 'opacity-60' : ''}`}>
            
            {/* The main content area, which also acts as the counter button. */}
            <button
                onClick={!isCompleted ? onCounterClick : undefined}
                disabled={isCompleted}
                aria-label={counterAriaLabel}
                className="w-full text-right block p-6 disabled:cursor-default focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-green-500 rounded-t-2xl"
            >
                <p className="font-quran text-2xl leading-loose text-slate-800 dark:text-slate-200">{dhikr.text}</p>
            </button>
            
            {/* Footer with visual count and the separate play button. */}
            <div className="flex items-center justify-between px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-700">
                <button
                    onClick={onPlayClick}
                    aria-label={playButtonAriaLabel}
                    className="z-10 w-10 h-10 flex items-center justify-center rounded-full text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                    {isPlaying ? <PauseIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5" />}
                </button>
                
                <div className="px-4 py-2 rounded-full font-bold text-lg flex items-center gap-2" aria-hidden="true">
                    <span className="transition-colors text-slate-700 dark:text-slate-200">
                        {progress} / {dhikr.count}
                    </span>
                </div>
            </div>

            {/* Progress bar is positioned relative to the root div */}
            <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-green-200/50 dark:bg-green-800/50 pointer-events-none">
                <MotionDiv
                    className="h-full bg-green-500"
                    initial={{ width: '100%' }}
                    animate={{ width: `${(progress / dhikr.count) * 100}%` }}
                    transition={{ duration: 0.5, ease: 'easeInOut' }}
                />
            </div>

            <AnimatePresence>
                {isCompleted && (
                    <MotionDiv
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="absolute top-3 left-3 text-green-500 bg-white/80 dark:bg-slate-800/80 rounded-full p-1 pointer-events-none z-20"
                    >
                        <CheckCircleIcon className="w-8 h-8" />
                    </MotionDiv>
                )}
            </AnimatePresence>
        </div>
    );
};


const CategoryDetailView: React.FC<{ category: HisnCategory, onBack: () => void }> = ({ category, onBack }) => {
    const titleRef = useRef<HTMLHeadingElement>(null);
    const audioRef = useRef<HTMLAudioElement>(null);
    const [counts, setCounts] = useState<Record<number, number>>(() =>
        category.array.reduce((acc, dhikr) => {
            acc[dhikr.id] = dhikr.count;
            return acc;
        }, {} as Record<number, number>)
    );
    const [playingDhikrId, setPlayingDhikrId] = useState<number | null>(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            titleRef.current?.focus();
        }, 100);

        const audioEl = audioRef.current;
        const handleAudioEnd = () => setPlayingDhikrId(null);
        audioEl?.addEventListener('ended', handleAudioEnd);
        audioEl?.addEventListener('pause', handleAudioEnd);

        return () => {
            clearTimeout(timer);
            audioEl?.removeEventListener('ended', handleAudioEnd);
            audioEl?.removeEventListener('pause', handleAudioEnd);
            audioEl?.pause();
        };
    }, [category]);

    const handleCounterClick = (dhikrId: number) => {
        setCounts(prev => {
            const current = prev[dhikrId];
            return current > 0 ? { ...prev, [dhikrId]: current - 1 } : prev;
        });
    };

    const handlePlayClick = (dhikr: HisnDhikr) => {
        if (playingDhikrId === dhikr.id) {
            audioRef.current?.pause();
        } else {
            if (audioRef.current) {
                audioRef.current.src = dhikr.audio;
                audioRef.current.play().catch(e => console.error("Audio play failed:", e));
                setPlayingDhikrId(dhikr.id);
            }
        }
    };

    return (
        <div>
            <audio ref={audioRef} />
            <header className="flex items-center gap-4 mb-6">
                <button onClick={onBack} aria-label="الرجوع لقائمة الأذكار" className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                    <ArrowRightIcon className="w-6 h-6 transform -scale-x-100" />
                </button>
                <h1 ref={titleRef} tabIndex={-1} className="text-2xl md:text-3xl font-bold focus:outline-none">{category.category}</h1>
            </header>

            <div className="space-y-4">
                {category.array.map(dhikr => (
                    <DhikrCard
                        key={dhikr.id}
                        dhikr={dhikr}
                        progress={counts[dhikr.id]}
                        isPlaying={playingDhikrId === dhikr.id}
                        onCounterClick={() => handleCounterClick(dhikr.id)}
                        onPlayClick={() => handlePlayClick(dhikr)}
                    />
                ))}
            </div>
        </div>
    );
};


const CategoryListView: React.FC<{ categories: HisnCategory[], onSelect: (category: HisnCategory) => void }> = ({ categories, onSelect }) => {
    const titleRef = useRef<HTMLHeadingElement>(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => {
            titleRef.current?.focus();
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    const filteredCategories = useMemo(() => {
        if (!searchQuery.trim()) return categories;
        return categories.filter(cat => cat.category.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [searchQuery, categories]);

    return (
        <div>
            <header className="mb-6 space-y-4">
                <h1 ref={titleRef} tabIndex={-1} className="text-2xl md:text-3xl font-bold focus:outline-none">حصن المسلم</h1>
                <div className="relative">
                    <input
                        type="search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="ابحث عن ذكر أو دعاء..."
                        className="w-full h-12 px-4 pr-11 text-right bg-white dark:bg-slate-800 rounded-xl shadow-sm border-2 border-transparent focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                        aria-label="ابحث عن ذكر أو دعاء"
                    />
                    <div className="absolute top-0 right-0 h-12 w-12 flex items-center justify-center text-slate-400 dark:text-slate-500 pointer-events-none">
                        <SearchIcon className="w-5 h-5" />
                    </div>
                </div>
            </header>
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm">
                <div className="divide-y divide-slate-100 dark:divide-slate-700 max-h-[calc(100vh-20rem)] overflow-y-auto">
                    {filteredCategories.map(category => (
                        <button key={category.id} onClick={() => onSelect(category)} className="w-full flex items-center justify-between text-right p-4 hover:bg-green-50 dark:hover:bg-slate-700/50 transition-colors group">
                            <p className="font-semibold text-lg text-slate-800 dark:text-slate-200 group-hover:text-green-600 dark:group-hover:text-green-400">
                                {category.category}
                            </p>
                            <ChevronLeftIcon className="w-5 h-5 text-slate-400 group-hover:text-green-500 transition-colors" />
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};


export const HisnAlMuslimPage: React.FC = () => {
    const [selectedCategory, setSelectedCategory] = useState<HisnCategory | null>(null);
    const [categories, setCategories] = useState<HisnCategory[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAzkarData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch('https://raw.githubusercontent.com/ahanafy41/The-Holy-Quran/feat/online-azkar-data/azkar-data/azkar.json');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setCategories(data);
            } catch (err) {
                setError('فشل تحميل الأذكار. يرجى المحاولة مرة أخرى.');
                console.error("Failed to load Azkar data:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAzkarData();
    }, []);

    const viewAnimation = {
        initial: { opacity: 0, x: 20 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -20 },
        transition: { duration: 0.25 }
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-full"><p>جاري تحميل الأذكار...</p></div>;
    }

    if (error) {
         return <div className="flex flex-col justify-center items-center h-full text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <button onClick={() => window.location.reload()} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                إعادة تحميل الصفحة
            </button>
        </div>;
    }

    return (
        <AnimatePresence mode="wait">
            <MotionDiv
                key={selectedCategory ? selectedCategory.id : 'list'}
                {...viewAnimation}
            >
                {selectedCategory ? (
                    <CategoryDetailView category={selectedCategory} onBack={() => setSelectedCategory(null)} />
                ) : (
                    <CategoryListView categories={categories} onSelect={setSelectedCategory} />
                )}
            </MotionDiv>
        </AnimatePresence>
    );
};