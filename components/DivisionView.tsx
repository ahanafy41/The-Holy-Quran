
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Ayah, Surah, QuranDivision } from '../types';
import * as api from '../services/quranApi';
import { useApp } from '../App';
import { AyahActionModal } from './AyahActionModal';
import { ArrowRightIcon } from './Icons';
import { motion, AnimatePresence } from 'framer-motion';

interface DivisionViewProps {
    division: QuranDivision & { title: string, startSurahName?: string };
}

export const DivisionView: React.FC<DivisionViewProps> = ({ division }) => {
    const { settings, setError, error, navigateTo } = useApp();
    const [fetchedSurahs, setFetchedSurahs] = useState<Surah[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedAyah, setSelectedAyah] = useState<Ayah | null>(null);
    const ayahRefs = useRef<Map<number, HTMLDivElement>>(new Map());

    useEffect(() => {
        const fetchDivisionData = async () => {
            setIsLoading(true);
            setError(null);
            setFetchedSurahs([]);
            try {
                const surahNumbers = Array.from({length: division.end.surah - division.start.surah + 1}, (_, i) => division.start.surah + i);
                const surahs = await Promise.all(surahNumbers.map(num => api.getSurah(num, settings.reciter)));
                setFetchedSurahs(surahs);
            } catch (e) {
                setError(`فشل تحميل محتوى ${division.title}.`);
            } finally {
                setIsLoading(false);
            }
        };
        fetchDivisionData();
    }, [division, settings.reciter, setError]);
    
    const handleAyahSelect = (ayah: Ayah, event: React.MouseEvent<HTMLDivElement> | React.KeyboardEvent<HTMLDivElement>) => {
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
                        onSelect={(e) => handleAyahSelect(ayah, e)}
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
        <div className="max-w-4xl mx-auto">
             <header className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6 mb-6 text-center">
                <button 
                    onClick={() => navigateTo('index')}
                    aria-label="الرجوع إلى الفهرس"
                    className="absolute top-1/2 -translate-y-1/2 right-4 w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                    <ArrowRightIcon className="w-6 h-6 transform -scale-x-100" />
                </button>
                <h2 className="text-2xl md:text-3xl font-bold mb-2">{division.title}</h2>
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
        </div>
    );
};

interface AyahItemProps {
    ayah: Ayah;
    isSelected: boolean;
    onSelect: (event: React.MouseEvent<HTMLDivElement, MouseEvent> | React.KeyboardEvent<HTMLDivElement>) => void;
}

const MotionDiv = motion('div');

const AyahItem = React.forwardRef<HTMLDivElement, AyahItemProps>(({ ayah, isSelected, onSelect }, ref) => {
    const { activeAyah } = useApp();
    const isPlaying = activeAyah?.number === ayah.number;

    const ayahNumberCircle = (
        <div className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-sm font-mono bg-slate-100 dark:bg-slate-700/50 rounded-full group-hover:bg-green-100 dark:group-hover:bg-green-900/50 transition-colors">
            {ayah.numberInSurah}
        </div>
    );

    return (
        <div ref={ref}
            onClick={onSelect}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelect(e); }}
            tabIndex={0}
            role="button"
            aria-label={`${ayah.text} - الآية رقم ${ayah.numberInSurah} من سورة ${ayah.surah?.name}.`}
            aria-haspopup="dialog"
            aria-expanded={isSelected}
            className={`group p-4 rounded-xl transition-all duration-300 relative cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-500/50 dark:focus:ring-green-400/50 ${
                isSelected ? 'bg-green-50 dark:bg-green-500/10' :
                isPlaying ? 'bg-green-50 dark:bg-green-500/10' :
                'hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}>
            <AnimatePresence>
            {(isSelected || isPlaying) && (
                <MotionDiv 
                    layout
                    layoutId={`outline-div-${ayah.number}`}
                    className="absolute inset-0 ring-2 ring-green-500 rounded-xl pointer-events-none"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                />
            )}
            </AnimatePresence>
            {ayahNumberCircle}
            <p dir="rtl" className="font-quran text-3xl md:text-4xl leading-loose text-right pr-14" aria-hidden="true">
                {ayah.text}
            </p>
        </div>
    );
});


const Spinner: React.FC = () => (
    <svg className="animate-spin h-5 w-5 text-slate-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);
