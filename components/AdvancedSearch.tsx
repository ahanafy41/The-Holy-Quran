import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { searchQuran } from '../services/searchService';
import { useDebounce } from '../hooks/useDebounce';
import { SearchResult, QuranDivision, SurahSimple } from '../types';
import { juzs, pages, hizbs, rubs } from '../data/quranicDivisions';
import { SearchIcon, ChevronLeftIcon, BookOpenIcon, ArrowRightIcon } from './Icons';

type DivisionType = 'surah' | 'juz' | 'page' | 'hizb' | 'rub';

const divisionData: { [key in DivisionType]: { data: (QuranDivision | SurahSimple)[], label: string } } = {
    surah: { data: [], label: 'سورة' }, // Surah list will be populated from context
    juz: { data: juzs, label: 'جزء' },
    page: { data: pages, label: 'صفحة' },
    hizb: { data: hizbs, label: 'حزب' },
    rub: { data: rubs, label: 'ربع' },
};

export const AdvancedSearch: React.FC = () => {
    const { navigateTo, surahList } = useApp();

    // Populate surah data once surahList is available
    divisionData.surah.data = surahList;

    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const debouncedQuery = useDebounce(query, 300);

    const [navType, setNavType] = useState<DivisionType>('surah');
    const [selectedNumber, setSelectedNumber] = useState('1');
    const [ayahNumber, setAyahNumber] = useState('');

    const [isFocused, setIsFocused] = useState(false);

    useEffect(() => {
        const performSearch = async () => {
            if (debouncedQuery.length < 3) {
                setResults([]);
                return;
            }
            setIsLoading(true);
            const searchResults = await searchQuran(debouncedQuery);
            setResults(searchResults);
            setIsLoading(false);
        };
        performSearch();
    }, [debouncedQuery]);

    const handleResultClick = (result: SearchResult) => {
        navigateTo('reader', { surahNumber: result.surah, ayahNumber: result.ayah });
        setQuery('');
        setResults([]);
    };

    const handleGo = () => {
        const division = divisionData[navType].data.find(d => d.number === parseInt(selectedNumber));
        if (!division) return;

        if (navType === 'surah') {
            navigateTo('reader', { surahNumber: division.number, ayahNumber: parseInt(ayahNumber) || 1, navigationContext: 'surahs' });
        } else {
            const surahName = surahList.find(s => s.number === (division as QuranDivision).start.surah)?.name;
            navigateTo('division', {
                division: { ...(division as QuranDivision), title: `${divisionData[navType].label} ${division.number}`, startSurahName: surahName },
                navigationContext: `${navType}s`,
            });
        }
    };

    const selectedDivisionData = useMemo(() => divisionData[navType].data, [navType]);

    return (
        <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-2xl shadow-sm mb-6 sm:mb-8 relative">
            <h2 className="text-xl font-bold mb-4 text-slate-800 dark:text-slate-200">الوصول السريع والبحث</h2>

            <div className="relative">
                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                    <SearchIcon className="w-5 h-5 text-slate-400" />
                </div>
                <input
                    type="text"
                    placeholder="ابحث عن آية، سورة، أو جزء..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setTimeout(() => setIsFocused(false), 150)} // Delay to allow click on results
                    className="w-full pl-4 pr-12 py-3 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg border-2 border-transparent focus:border-green-500 focus:ring-green-500 focus:outline-none transition"
                />
                <AnimatePresence>
                    {isFocused && (query.length > 2 || results.length > 0) && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-10 max-h-72 overflow-y-auto"
                        >
                            {isLoading ? (
                                <div className="p-4 text-center text-slate-500">جاري البحث...</div>
                            ) : results.length > 0 ? (
                                results.map((result) => (
                                    <button
                                      key={`${result.surah}-${result.ayah}`}
                                      onClick={() => handleResultClick(result)}
                                      className="block w-full text-right px-4 py-3 hover:bg-green-50 dark:hover:bg-slate-700 transition-colors"
                                    >
                                        <p className="font-semibold text-slate-800 dark:text-slate-200">
                                            {surahList.find(s => s.number === result.surah)?.name}: {result.ayah}
                                        </p>
                                        <p className="text-sm text-slate-600 dark:text-slate-400 truncate">
                                            {result.text}
                                        </p>
                                    </button>
                                ))
                            ) : (
                                <div className="p-4 text-center text-slate-500">لا توجد نتائج.</div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-600">
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">أو انتقل مباشرة إلى:</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <select
                        value={navType}
                        onChange={(e) => {
                            setNavType(e.target.value as DivisionType);
                            setSelectedNumber('1');
                            setAyahNumber('');
                        }}
                        className="p-2.5 rounded-md bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                        {Object.keys(divisionData).map(key => (
                            <option key={key} value={key}>{divisionData[key as DivisionType].label}</option>
                        ))}
                    </select>

                    <div className="flex gap-2">
                        <select
                            value={selectedNumber}
                            onChange={(e) => setSelectedNumber(e.target.value)}
                            className="flex-grow p-2.5 rounded-md bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                            {selectedDivisionData.map(item => (
                                <option key={item.number} value={item.number}>
                                    {navType === 'surah' ? `${item.number} - ${(item as SurahSimple).name}` : item.number}
                                </option>
                            ))}
                        </select>
                        {navType === 'surah' && (
                            <input
                                type="number"
                                placeholder="الآية"
                                value={ayahNumber}
                                onChange={(e) => setAyahNumber(e.target.value)}
                                className="w-20 p-2.5 rounded-md bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                        )}
                    </div>

                    <button
                        onClick={handleGo}
                        className="w-full sm:w-auto px-4 py-2.5 bg-green-600 text-white font-semibold rounded-lg shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-slate-800 transition-colors flex items-center justify-center gap-2"
                    >
                        <span>انتقل</span>
                        <ArrowRightIcon className="w-5 h-5 transform -scale-x-100"/>
                    </button>
                </div>
            </div>
        </div>
    );
};
