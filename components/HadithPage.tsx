import React, { useState, useMemo, useRef, useEffect } from 'react';
import type { HadithBook, Hadith, HadithChapter } from '../types';
import { hadithCollection } from '../data/hadithData';
import { motion, AnimatePresence } from 'framer-motion';
import { useVirtualizer } from '@tanstack/react-virtual';
import { SearchIcon, ChevronLeftIcon, ArrowRightIcon } from './Icons';
import { ChaptersModal } from './ChaptersModal';

const MotionDiv = motion.div as any;

// --- Component to display the list of Hadith books ---
const BookListView: React.FC<{ onSelect: (book: HadithBook) => void }> = ({ onSelect }) => {
    const titleRef = useRef<HTMLHeadingElement>(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => {
            titleRef.current?.focus();
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    const filteredBooks = useMemo(() => {
        if (!searchQuery.trim()) return hadithCollection.chapters;
        return hadithCollection.chapters.filter(book => book.arabic.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [searchQuery]);

    return (
        <MotionDiv key="book-list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <header className="mb-6 space-y-4">
                <h1 ref={titleRef} tabIndex={-1} className="text-2xl md:text-3xl font-bold focus:outline-none">الحديث الشريف</h1>
                <div className="relative">
                    <input
                        type="search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="ابحث عن كتاب..."
                        className="w-full h-12 px-4 pr-11 text-right bg-white dark:bg-slate-800 rounded-xl shadow-sm border-2 border-transparent focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                        aria-label="ابحث عن كتاب"
                    />
                    <div className="absolute top-0 right-0 h-12 w-12 flex items-center justify-center text-slate-400 dark:text-slate-500 pointer-events-none">
                        <SearchIcon className="w-5 h-5" />
                    </div>
                </div>
            </header>
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm">
                <div className="divide-y divide-slate-100 dark:divide-slate-700 max-h-[calc(100vh-20rem)] overflow-y-auto">
                    {filteredBooks.map(book => (
                        <button key={book.id} onClick={() => onSelect(book)} className="w-full flex items-center justify-between text-right p-4 hover:bg-green-50 dark:hover:bg-slate-700/50 transition-colors group">
                            <p className="font-semibold text-lg text-slate-800 dark:text-slate-200 group-hover:text-green-600 dark:group-hover:text-green-400">
                                {book.arabic}
                            </p>
                            <ChevronLeftIcon className="w-5 h-5 text-slate-400 group-hover:text-green-500 transition-colors" />
                        </button>
                    ))}
                </div>
            </div>
        </MotionDiv>
    );
};

type ListItem = { type: 'chapter'; chapter: HadithChapter } | { type: 'hadith'; hadith: Hadith };

// --- Component to display the hadiths in a selected book ---
const HadithListView: React.FC<{ book: HadithBook & { chapters: HadithChapter[], hadiths: Hadith[] }, onBack: () => void }> = ({ book, onBack }) => {
    const titleRef = useRef<HTMLHeadingElement>(null);
    const parentRef = useRef<HTMLDivElement>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isChaptersModalOpen, setIsChaptersModalOpen] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            titleRef.current?.focus();
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    const allItems = useMemo(() => {
        const items: ListItem[] = [];
        const hadiths = book.hadiths || [];
        const chapters = book.chapters || [];

        const filteredHadiths = searchQuery.trim()
            ? hadiths.filter(h => h.arabic.includes(searchQuery))
            : hadiths;

        if (!searchQuery.trim()) {
            chapters.forEach(chapter => {
                items.push({ type: 'chapter', chapter });
                const hadithsInChapter = hadiths.filter(h => h.chapterId === chapter.id);
                hadithsInChapter.forEach(hadith => {
                    items.push({ type: 'hadith', hadith });
                });
            });
        } else {
            filteredHadiths.forEach(hadith => {
                items.push({ type: 'hadith', hadith });
            });
        }
        return items;
    }, [book.chapters, book.hadiths, searchQuery]);

    const rowVirtualizer = useVirtualizer({
        count: allItems.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 100,
        overscan: 10,
    });

    return (
        <MotionDiv key="hadith-list" initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -100 }}>
            <header className="mb-6 space-y-4">
                <div className="flex items-center justify-between">
                    <h1 ref={titleRef} tabIndex={-1} className="text-xl md:text-2xl font-bold text-right flex-grow mx-4 focus:outline-none">{book.arabic}</h1>
                    <button onClick={() => setIsChaptersModalOpen(true)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" aria-label="الأبواب">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                    <button onClick={onBack} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" aria-label="العودة إلى قائمة الكتب">
                        <ArrowRightIcon className="w-6 h-6" />
                    </button>
                </div>
                 <div className="relative">
                    <input
                        type="search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="ابحث في الأحاديث..."
                        className="w-full h-12 px-4 pr-11 text-right bg-white dark:bg-slate-800 rounded-xl shadow-sm border-2 border-transparent focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                        aria-label="ابحث في الأحاديث"
                    />
                    <div className="absolute top-0 right-0 h-12 w-12 flex items-center justify-center text-slate-400 dark:text-slate-500 pointer-events-none">
                        <SearchIcon className="w-5 h-5" />
                    </div>
                </div>
            </header>
            <div ref={parentRef} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm max-h-[calc(100vh-22rem)] overflow-y-auto">
                <div style={{ height: `${rowVirtualizer.getTotalSize()}px`, width: '100%', position: 'relative' }}>
                    {rowVirtualizer.getVirtualItems().map(virtualItem => {
                        const item = allItems[virtualItem.index];
                        return (
                            <div
                                key={virtualItem.key}
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    transform: `translateY(${virtualItem.start}px)`,
                                }}
                                className="p-4"
                            >
                                {item.type === 'chapter' ? (
                                    <h2 className="text-lg font-bold bg-slate-100 dark:bg-slate-700 p-2 rounded-md my-2">
                                        {item.chapter.arabic}
                                    </h2>
                                ) : (
                                    <p className="font-serif text-lg leading-loose text-slate-800 dark:text-slate-200 mb-2">
                                        <span className="font-bold text-slate-500 dark:text-slate-400">[{item.hadith.idInBook}] </span>
                                        {item.hadith.arabic}
                                    </p>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
            {isChaptersModalOpen && (
                <ChaptersModal
                    chapters={book.chapters}
                    onClose={() => setIsChaptersModalOpen(false)}
                    onSelectChapter={(chapter) => {
                        const chapterIndex = allItems.findIndex(item => item.type === 'chapter' && item.chapter.id === chapter.id);
                        if (chapterIndex !== -1) {
                            rowVirtualizer.scrollToIndex(chapterIndex);
                        }
                        setIsChaptersModalOpen(false);
                    }}
                />
            )}
        </MotionDiv>
    );
};

// --- Main page component that manages state ---
export const HadithPage: React.FC = () => {
    const [selectedBook, setSelectedBook] = useState<(HadithBook & { chapters: HadithChapter[], hadiths: Hadith[] }) | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSelectBook = (book: HadithBook) => {
        setIsLoading(true);
        import(`../data/${book.id}.json`).then(fullDataModule => {
            const fullData = fullDataModule.default;
            const bookWithData = { ...book, chapters: fullData.chapters, hadiths: fullData.hadiths };
            setSelectedBook(bookWithData);
            setIsLoading(false);
        }).catch(err => {
            console.error("Failed to load hadith data:", err); 
            setIsLoading(false);
        });
    };

    const handleGoBack = () => {
        setSelectedBook(null);
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-full"><p>جاري تحميل الأحاديث...</p></div>;
    }

    return (
        <AnimatePresence mode="wait">
            {selectedBook ? (
                <HadithListView key={selectedBook.id} book={selectedBook} onBack={handleGoBack} />
            ) : (
                <BookListView onSelect={handleSelectBook} />
            )}
        </AnimatePresence>
    );
};