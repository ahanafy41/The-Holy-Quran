
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Ayah, Surah, QuranDivision } from '../types';
import * as api from '../services/quranApi';
import { useApp } from '../context/AppContext';
import { AyahActionModal } from './AyahActionModal';
import { AyahItem } from './AyahItem';
import { Spinner } from './Spinner';
import { ArrowRightIcon } from './Icons';
import { motion, AnimatePresence } from 'framer-motion';
import { QuranReaderControls } from './QuranReaderControls';

interface DivisionViewProps {
    division: QuranDivision & { title: string, startSurahName?: string };
}

export const DivisionView: React.FC<DivisionViewProps> = ({ division }) => {
    const { settings, setError, error, navigateTo } = useApp();
    const [fetchedSurahs, setFetchedSurahs] = useState<Surah[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedAyah, setSelectedAyah] = useState<Ayah | null>(null);
    const ayahRefs = useRef<Map<number, HTMLDivElement>>(new Map());
    const titleRef = useRef<HTMLHeadingElement>(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            titleRef.current?.focus();
        }, 100);
        return () => clearTimeout(timer);
    }, [division]);

    useEffect(() => {
        const fetchDivisionData = async () => {
            setIsLoading(true);
            setError(null);
            setFetchedSurahs([]);
            try {
                const surahNumbers = Array.from({length: division.end.surah - division.start.surah + 1}, (_, i) => division.start.surah + i);
                const surahs = await Promise.all(surahNumbers.map(num => api.getSurah(num, settings.memorizationReciter)));
                setFetchedSurahs(surahs);
            } catch (e) {
                setError(`فشل تحميل محتوى ${division.title}.`);
            } finally {
                setIsLoading(false);
            }
        };
        fetchDivisionData();
    }, [division, settings.memorizationReciter, setError]);
    
    const handleAyahSelect = (ayah: Ayah) => {
        setSelectedAyah(ayah);
    };

    const handleModalClose = () => {
        setSelectedAyah(null);
    };

    const ayahsInDivision = useMemo(() => {
        const { start, end } = division;
        return fetchedSurahs.flatMap(surah => 
            surah.ayahs.filter(ayah => {
                if (!ayah.surah) return false;
                const inRange = (s: number, a: number) => (s > start.surah || (s === start.surah && a >= start.ayah)) && (s < end.surah || (s === end.surah && a <= end.ayah));
                return inRange(ayah.surah.number, ayah.numberInSurah);
            })
        );
    }, [fetchedSurahs, division]);

    const renderContent = () => {
        if (isLoading) {
            return <div className="text-center p-10 flex items-center justify-center gap-2"><Spinner/> جاري تحميل المحتوى</div>;
        }
        if (error && fetchedSurahs.length === 0) {
            return <div className="text-center p-10 text-red-500" role="alert">{error}</div>;
        }
        if (ayahsInDivision.length === 0 && !isLoading) {
            return <div className="text-center p-10">لم يتم العثور على آيات.</div>;
        }

        let lastRenderedSurah: number | null = null;
        
        return ayahsInDivision.map(ayah => {
            if (!ayah.surah) return null;
            const showSurahHeader = ayah.surah.number !== lastRenderedSurah;
            lastRenderedSurah = ayah.surah.number;
            const isBismillahShown = showSurahHeader && ayah.surah.number !== 1 && ayah.surah.number !== 9 && !(ayah.surah.number === division.start.surah && division.start.ayah > 1);
            
            return (
                <React.Fragment key={ayah.number}>
                    {showSurahHeader && (
                         <div className="border-b-2 border-green-500 pb-4 my-6 text-center pt-6 sticky top-0 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm z-10">
                            <h3 className="font-quran text-3xl md:text-4xl font-bold mb-2">{ayah.surah.name}</h3>
                            <p className="text-md text-slate-600 dark:text-slate-300">{ayah.surah.englishName}</p>
                            {isBismillahShown && (
                                <p className="font-quran text-2xl mt-4">بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</p>
                            )}
                        </div>
                    )}
                    <AyahItem 
                        ayah={ayah}
                        isSelected={selectedAyah?.number === ayah.number}
                        onSelect={() => handleAyahSelect(ayah)}
                        layoutIdPrefix="division"
                        ref={(el: HTMLDivElement | null) => {
                            if (el) ayahRefs.current.set(ayah.number, el);
                            else ayahRefs.current.delete(ayah.number);
                        }}
                    />
                </React.Fragment>
            );
        });
    };

    return (
        <div className="max-w-4xl mx-auto pb-24">
             <header className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6 mb-6 text-center relative">
                <button
                    onClick={() => window.history.back()}
                    className="absolute top-1/2 -translate-y-1/2 right-4 w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    aria-label="الرجوع"
                >
                    <ArrowRightIcon className="w-6 h-6" />
                </button>
                <h2 ref={titleRef} tabIndex={-1} className="text-2xl md:text-3xl font-bold mb-2 focus:outline-none">{division.title}</h2>
                 {division.startSurahName && 
                    <p className="text-lg text-slate-600 dark:text-slate-300">
                        يبدأ من سورة {division.startSurahName}، آية {division.start.ayah}
                    </p>
                 }
            </header>
            <div className="space-y-1">
                {renderContent()}
            </div>
            <AnimatePresence>
                {selectedAyah && <AyahActionModal ayah={selectedAyah} onClose={handleModalClose} />}
            </AnimatePresence>
            <QuranReaderControls division={division} />
        </div>
    );
};