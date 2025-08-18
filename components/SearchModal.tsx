
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as searchService from '../services/searchService';
import { useApp, useDebounce, useFocusTrap, Spinner } from '../App';
import { SearchResult } from '../types';
import { XMarkIcon, SearchIcon } from './Icons';

const MotionDiv = motion('div');

export const SearchModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { navigateTo, surahList } = useApp();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useFocusTrap(modalRef, onClose);

    const debouncedSearchQuery = useDebounce(searchQuery, 300);

    const surahMetaMap = useMemo(() => {
        const map = new Map<number, { name: string; englishName: string }>();
        surahList.forEach(s => map.set(s.number, { name: s.name, englishName: s.englishName }));
        return map;
    }, [surahList]);

    useEffect(() => {
        if (!debouncedSearchQuery.trim()) {
            setSearchResults([]);
            setIsSearching(false);
            return;
        }

        const performSearch = async () => {
            setIsSearching(true);
            const results = await searchService.searchQuran(debouncedSearchQuery);
            setSearchResults(results);
            setIsSearching(false);
        };

        performSearch();
    }, [debouncedSearchQuery]);

    const handleResultClick = (surahNumber: number, ayahNumber: number) => {
        navigateTo('reader', { surahNumber, ayahNumber });
        onClose();
    };

    useEffect(() => {
        // Focus the input when the modal opens
        inputRef.current?.focus();
    }, []);

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center p-4 pt-[10vh]" onClick={onClose}>
            <MotionDiv
                ref={modalRef}
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -50, opacity: 0 }}
                transition={{ type: 'spring', damping: 15, stiffness: 200 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col"
                role="dialog"
                aria-modal="true"
                aria-labelledby="search-title"
            >
                <header className="p-4 flex items-center gap-4 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex-shrink-0 text-slate-400 dark:text-slate-500">
                        {isSearching ? <Spinner/> : <SearchIcon className="w-5 h-5"/>}
                    </div>
                    <input 
                      ref={inputRef}
                      id="search-title"
                      type="search" placeholder="ابحث في القرآن الكريم..."
                      value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-transparent focus:outline-none text-lg"
                      aria-label="Search Quran text"
                    />
                    <button onClick={onClose} aria-label="إغلاق البحث" className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 flex-shrink-0">
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </header>

                <div className="overflow-y-auto">
                    {searchQuery ? (
                        <ul>
                            {searchResults.map((result) => (
                                <li key={`${result.surah}-${result.ayah}`}>
                                    <button onClick={() => handleResultClick(result.surah, result.ayah)}
                                      className="w-full text-right p-4 hover:bg-green-50 dark:hover:bg-slate-700/50 cursor-pointer border-b border-slate-100 dark:border-slate-700">
                                        <p className="font-semibold text-green-600 dark:text-green-500">سورة {surahMetaMap.get(result.surah)?.name}، آية {result.ayah}</p>
                                        <p className="text-md text-slate-700 dark:text-slate-300 font-quran leading-relaxed">{result.text}</p>
                                    </button>
                                </li>
                            ))}
                            {searchResults.length === 0 && !isSearching && (
                                <li className="p-8 text-center text-slate-500">لم يتم العثور على نتائج.</li>
                            )}
                        </ul>
                    ) : (
                        <div className="p-8 text-center text-slate-400">
                            <p>أدخل كلمة أو جزء من آية للبحث.</p>
                        </div>
                    )}
                </div>
            </MotionDiv>
        </div>
    );
};
