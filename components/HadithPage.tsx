import React, { useState, useMemo, useRef, useEffect } from 'react';
import type { HadithBook, Hadith, HadithChapter } from '../types';
import { hadithCollection } from '../data/hadithData';
import { motion, AnimatePresence } from 'framer-motion';
import { useVirtualizer } from '@tanstack/react-virtual';
import { SearchIcon, ChevronLeftIcon, ArrowRightIcon } from './Icons';

const MotionDiv = motion.div as any;

// --- Component to display the list of Hadith books ---
const BookListView: React.FC<{ onSelect: (book: HadithBook) => void }> = ({ onSelect }) => {
    const titleRef = useRef<HTMLHeadingElement>(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => { titleRef.current?.focus(); }, 100);
        return () => clearTimeout(timer);
    }, []);

    const filteredBooks = useMemo(() => {
        if (!searchQuery.trim()) return hadithCollection.chapters;
        return hadithCollection.chapters.filter(book => book.arabic.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [searchQuery]);

    return (
        <MotionDiv key="book-list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: -100 }}>
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

// --- Component to display the list of chapters in a book ---
const ChapterListView: React.FC<{ book: HadithBook, chapters: HadithChapter[], onSelect: (chapter: HadithChapter) => void, onBack: () => void }> = ({ book, chapters, onSelect, onBack }) => {
    const titleRef = useRef<HTMLHeadingElement>(null);
    useEffect(() => {
        const timer = setTimeout(() => { titleRef.current?.focus(); }, 100);
        return () => clearTimeout(timer);
    }, []);

    return (
        <MotionDiv key="chapter-list" initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -100 }}>
            <header className="mb-6 flex items-center justify-between">
                 <h1 ref={titleRef} tabIndex={-1} className="text-xl md:text-2xl font-bold text-right flex-grow mx-4 focus:outline-none">{book.arabic}</h1>
                 <button onClick={onBack} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" aria-label="العودة إلى قائمة الكتب">
                    <ArrowRightIcon className="w-6 h-6" />
                </button>
            </header>
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm">
                <div className="divide-y divide-slate-100 dark:divide-slate-700 max-h-[calc(100vh-16rem)] overflow-y-auto">
                    {chapters.map(chapter => (
                        <button key={chapter.id} onClick={() => onSelect(chapter)} className="w-full flex items-center justify-between text-right p-4 hover:bg-green-50 dark:hover:bg-slate-700/50 transition-colors group">
                            <p className="font-semibold text-lg text-slate-800 dark:text-slate-200 group-hover:text-green-600 dark:group-hover:text-green-400">
                                {chapter.arabic}
                            </p>
                            <ChevronLeftIcon className="w-5 h-5 text-slate-400 group-hover:text-green-500 transition-colors" />
                        </button>
                    ))}
                </div>
            </div>
        </MotionDiv>
    );
};

// --- Component to display the hadiths in a selected chapter ---
const HadithListView: React.FC<{ book: HadithBook, chapter: HadithChapter, hadiths: Hadith[], onBack: () => void }> = ({ book, chapter, hadiths, onBack }) => {
    const titleRef = useRef<HTMLHeadingElement>(null);
    const parentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const timer = setTimeout(() => { titleRef.current?.focus(); }, 100);
        return () => clearTimeout(timer);
    }, []);

    const rowVirtualizer = useVirtualizer({
        count: hadiths.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 120, // Adjusted for better estimation
        overscan: 10,
    });

    return (
        <MotionDiv key="hadith-list" initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -100 }}>
            <header className="mb-6 space-y-4">
                <div className="flex items-center justify-between">
                    <div className="text-right flex-grow mx-4">
                        <h1 ref={titleRef} tabIndex={-1} className="text-xl md:text-2xl font-bold focus:outline-none">{book.arabic}</h1>
                        <p className="text-slate-500 dark:text-slate-400">{chapter.arabic}</p>
                    </div>
                    <button onClick={onBack} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" aria-label="العودة إلى قائمة الأبواب">
                        <ArrowRightIcon className="w-6 h-6" />
                    </button>
                </div>
            </header>
            <div ref={parentRef} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm max-h-[calc(100vh-20rem)] overflow-y-auto">
                <div style={{ height: `${rowVirtualizer.getTotalSize()}px`, width: '100%', position: 'relative' }}>
                    {rowVirtualizer.getVirtualItems().map(virtualItem => {
                        const hadith = hadiths[virtualItem.index];
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
                                className="p-4 border-b border-slate-100 dark:border-slate-700"
                            >
                                <p className="font-serif text-lg leading-loose text-slate-800 dark:text-slate-200">
                                    <span className="font-bold text-slate-500 dark:text-slate-400">[{hadith.idInBook}] </span>
                                    {hadith.arabic}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </MotionDiv>
    );
};


// --- Main page component that manages state ---
export const HadithPage: React.FC = () => {
    const [view, setView] = useState<'books' | 'chapters' | 'hadiths'>('books');
    const [selectedBook, setSelectedBook] = useState<HadithBook | null>(null);
    const [chapters, setChapters] = useState<HadithChapter[]>([]);
    const [selectedChapter, setSelectedChapter] = useState<HadithChapter | null>(null);
    const [hadiths, setHadiths] = useState<Hadith[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSelectBook = async (book: HadithBook) => {
        setSelectedBook(book);
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`/hadith-data/${book.id}/chapters.json`);
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            setChapters(data);
            setView('chapters');
        } catch (err) {
            setError('فشل تحميل الأبواب. يرجى المحاولة مرة أخرى.');
            console.error("Failed to load hadith chapters:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectChapter = async (chapter: HadithChapter) => {
        if (!selectedBook) return;
        setSelectedChapter(chapter);
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`/hadith-data/${selectedBook.id}/${chapter.id}.json`);
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            setHadiths(data);
            setView('hadiths');
        } catch (err) {
            setError('فشل تحميل الأحاديث. يرجى المحاولة مرة أخرى.');
            console.error("Failed to load hadiths:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleBackToBooks = () => {
        setSelectedBook(null);
        setChapters([]);
        setView('books');
    };

    const handleBackToChapters = () => {
        setSelectedChapter(null);
        setHadiths([]);
        setView('chapters');
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-full"><p>جاري التحميل...</p></div>;
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
            {view === 'books' && (
                <BookListView onSelect={handleSelectBook} />
            )}
            {view === 'chapters' && selectedBook && (
                <ChapterListView book={selectedBook} chapters={chapters} onSelect={handleSelectChapter} onBack={handleBackToBooks} />
            )}
            {view === 'hadiths' && selectedBook && selectedChapter && (
                <HadithListView book={selectedBook} chapter={selectedChapter} hadiths={hadiths} onBack={handleBackToChapters} />
            )}
        </AnimatePresence>
    );
};