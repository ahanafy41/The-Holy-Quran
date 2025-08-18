
import React, { useState, useEffect, useRef } from 'react';
import { Ayah } from '../types';
import { useApp } from '../App';
import { AyahActionModal } from './AyahActionModal';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRightIcon } from './Icons';


export const QuranView: React.FC = () => {
    const { currentSurah, isLoading, error, targetAyah, setTargetAyah, navigateTo } = useApp();
    const [selectedAyah, setSelectedAyah] = useState<Ayah | null>(null);
    const [highlightedAyah, setHighlightedAyah] = useState<number | null>(null);
    const ayahRefs = useRef<Map<number, HTMLDivElement>>(new Map());

    useEffect(() => {
        ayahRefs.current.clear();
    }, [currentSurah]);

    const handleAyahSelect = (ayah: Ayah, event: React.MouseEvent<HTMLDivElement> | React.KeyboardEvent<HTMLDivElement>) => {
        setSelectedAyah(ayah);
    };

    const handleModalClose = () => {
        setSelectedAyah(null);
    };

    useEffect(() => {
        if (targetAyah && currentSurah) {
            const timeoutId = setTimeout(() => {
                const element = ayahRefs.current.get(targetAyah);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    setHighlightedAyah(targetAyah);
                    const timer = setTimeout(() => {
                        setHighlightedAyah(null);
                        setTargetAyah(null);
                    }, 2500);
                    return () => clearTimeout(timer);
                } else {
                     setTargetAyah(null);
                }
            }, 100);
            return () => clearTimeout(timeoutId);
        }
    }, [targetAyah, currentSurah, setTargetAyah]);

    if (isLoading && !currentSurah) {
        return <div className="text-center p-10 flex items-center justify-center gap-2"><Spinner/> جاري التحميل...</div>;
    }
    if (error && !currentSurah) {
        return <div className="text-center p-10 text-red-500" role="alert">{error}</div>;
    }
    if (!currentSurah) {
        return (
            <div className="text-center p-10">
                <p className="text-slate-500 mb-4">اختر سورة للبدء من الفهرس.</p>
                <button onClick={() => navigateTo('index')} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold">
                    الذهاب إلى الفهرس
                </button>
            </div>
        );
    }
    
    return (
        <div className="max-w-4xl mx-auto">
             <header className="relative mb-6 text-center">
                <button 
                    onClick={() => navigateTo('index')}
                    aria-label="الرجوع إلى الفهرس"
                    className="absolute top-1/2 -translate-y-1/2 right-0 w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                    <ArrowRightIcon className="w-6 h-6 transform -scale-x-100" />
                </button>
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6">
                    <h2 className="font-quran text-4xl md:text-5xl font-bold mb-2">{currentSurah.name}</h2>
                    <p className="text-lg text-slate-600 dark:text-slate-300">{currentSurah.englishName}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{currentSurah.revelationType} - {currentSurah.ayahs.length} آيات</p>
                     {currentSurah.number !== 1 && currentSurah.number !== 9 && (
                        <p className="font-quran text-2xl mt-4 border-t border-slate-200 dark:border-slate-700 pt-4">بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</p>
                    )}
                </div>
            </header>
            <div className="space-y-1">
                {currentSurah.ayahs.map(ayah => (
                    <AyahItem 
                        key={ayah.number} 
                        ayah={ayah}
                        isSelected={selectedAyah?.number === ayah.number}
                        isHighlighted={highlightedAyah === ayah.numberInSurah}
                        onSelect={(e) => handleAyahSelect(ayah, e)}
                        ref={(el: HTMLDivElement | null) => {
                            if (el) ayahRefs.current.set(ayah.numberInSurah, el);
                            else ayahRefs.current.delete(ayah.numberInSurah);
                        }}
                    />
                ))}
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
    isHighlighted: boolean;
    onSelect: (event: React.MouseEvent<HTMLDivElement, MouseEvent> | React.KeyboardEvent<HTMLDivElement>) => void;
}

const MotionDiv = motion('div');

const AyahItem = React.forwardRef<HTMLDivElement, AyahItemProps>(({ ayah, isSelected, isHighlighted, onSelect }, ref) => {
    const { activeAyah } = useApp();
    const isPlaying = activeAyah?.number === ayah.number;

    const ayahNumberCircle = (
        <div className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-sm font-mono bg-slate-100 dark:bg-slate-700/50 rounded-full group-hover:bg-green-100 dark:group-hover:bg-green-900/50 transition-colors">
            {ayah.numberInSurah}
        </div>
    );

    return (
        <div
            ref={ref}
            onClick={onSelect}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelect(e); }}
            tabIndex={0}
            role="button"
            aria-label={`${ayah.text} - الآية رقم ${ayah.numberInSurah} من سورة ${ayah.surah?.name}.`}
            aria-haspopup="dialog"
            aria-expanded={isSelected}
            className={`group p-4 rounded-xl transition-all duration-300 relative cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-500/50 dark:focus:ring-green-400/50 ${
                isSelected ? 'bg-green-50 dark:bg-green-500/10' :
                isHighlighted ? 'bg-yellow-100 dark:bg-yellow-400/10 ring-2 ring-yellow-400/50' :
                isPlaying ? 'bg-green-50 dark:bg-green-500/10' :
                'hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
        >
            <AnimatePresence>
            {(isSelected || isPlaying) && (
                <MotionDiv 
                    layout
                    layoutId={`outline-${ayah.number}`}
                    className="absolute inset-0 ring-2 ring-green-500 rounded-xl pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
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
