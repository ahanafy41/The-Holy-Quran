import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import wordMeanings from '../data/quran_word_meanings.json';
import { BookOpenIcon, ChevronDownIcon } from './Icons'; // Assuming ChevronDown for accordion

// We need to get the arabic surah name from the main surahList
const getSurahNameAr = (surahNumber: number, surahList: any[]) => {
    const surah = surahList.find(s => s.number === surahNumber);
    return surah ? surah.name : 'سورة غير معروفة';
};

export const WordMeaningsPage: React.FC = () => {
    const { surahList } = useApp();
    const [openSurah, setOpenSurah] = useState<number | null>(null);

    const toggleSurah = (surahNumber: number) => {
        setOpenSurah(openSurah === surahNumber ? null : surahNumber);
    };

    return (
        <div className="max-w-4xl mx-auto">
            <header className="mb-8 text-center">
                <div className="inline-block p-4 bg-teal-500 rounded-2xl mb-4">
                    <BookOpenIcon className="w-10 h-10 text-white"/>
                </div>
                <h1 tabIndex={-1} className="text-4xl md:text-5xl font-bold text-slate-800 dark:text-white focus:outline-none">معاني كلمات القرآن</h1>
                <p className="text-lg text-slate-600 dark:text-slate-400 mt-2">مأخوذ من كتاب "السراج في بيان غريب القرآن"</p>
            </header>

            {wordMeanings.length === 0 ? (
                <div className="text-center p-10 bg-white dark:bg-slate-800 rounded-2xl shadow-sm">
                    <p className="text-slate-500 dark:text-slate-400">لا توجد بيانات لعرضها.</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {wordMeanings.map(sura => (
                        <details
                            key={sura.sura_number}
                            className="group bg-white dark:bg-slate-800 rounded-2xl shadow-sm"
                            open={openSurah === sura.sura_number}
                            onToggle={(e) => {
                                if ((e.target as HTMLDetailsElement).open) {
                                    setOpenSurah(sura.sura_number);
                                } else if (openSurah === sura.sura_number) {
                                    setOpenSurah(null);
                                }
                            }}
                        >
                            <summary
                                onClick={(e) => {
                                    e.preventDefault(); // Prevent default behavior
                                    toggleSurah(sura.sura_number);
                                }}
                                className="p-4 flex justify-between items-center cursor-pointer list-none"
                            >
                                <h2 className="font-bold text-lg text-slate-800 dark:text-slate-100">
                                    {`${sura.sura_number} - ${getSurahNameAr(sura.sura_number, surahList)}`}
                                </h2>
                                <ChevronDownIcon className="w-6 h-6 text-slate-400 group-open:rotate-180 transition-transform duration-300" />
                            </summary>
                            <div className="p-4 border-t border-slate-200 dark:border-slate-700">
                                {sura.verses.map(verse => (
                                    <div key={verse.ayah_number} className="mb-4 pb-4 border-b border-slate-100 dark:border-slate-700 last:border-b-0 last:pb-0 last:mb-0">
                                        <p className="font-bold text-green-600 dark:text-green-400 mb-2">الآية: {verse.ayah_number}</p>
                                        {/* Use pre-wrap to preserve newlines from the JSON */}
                                        <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{verse.meaning}</p>
                                    </div>
                                ))}
                            </div>
                        </details>
                    ))}
                </div>
            )}
        </div>
    );
};
