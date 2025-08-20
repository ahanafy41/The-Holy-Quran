
import React, { useState, useEffect, useRef } from 'react';
import { Ayah } from '../types';
import { useApp } from '../context/AppContext';
import { AyahActionModal } from './AyahActionModal';
import { AyahItem } from './AyahItem';
import { Spinner } from './Spinner';
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

    const handleAyahSelect = (ayah: Ayah) => {
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
                        onSelect={() => handleAyahSelect(ayah)}
                        layoutIdPrefix="quran"
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
