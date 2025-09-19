import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { pages } from '../data/quranicDivisions';
import { HeadphonesIcon, PreviousIcon, NextIcon } from './Icons';

// Helper function to find the page number for a given surah and ayah
const findPageForAyah = (surahNumber: number, ayahNumber: number): number | null => {
    const page = pages.find(p => {
        if (surahNumber > p.start.surah && surahNumber < p.end.surah) return true;
        if (surahNumber === p.start.surah && ayahNumber >= p.start.ayah) {
             if (surahNumber < p.end.surah || (surahNumber === p.end.surah && ayahNumber <= p.end.ayah)) return true;
        }
        if (surahNumber === p.end.surah && ayahNumber <= p.end.ayah) {
            if (surahNumber > p.start.surah) return true;
        }
        return false;
    });
    return page ? page.number : null;
};

interface QuranViewBottomNavProps {
    topVisibleAyah: number;
}

export const QuranViewBottomNav: React.FC<QuranViewBottomNavProps> = ({ topVisibleAyah }) => {
    const { currentSurah, loadPlaylist, navigateTo, getAyahsForDivision } = useApp();
    const [isListenMenuOpen, setIsListenMenuOpen] = useState(false);

    const handleListenPage = async () => {
        if (!currentSurah) return;

        const currentPageNumber = findPageForAyah(currentSurah.number, topVisibleAyah);
        if (currentPageNumber) {
            const pageDivision = pages.find(p => p.number === currentPageNumber);
            if (pageDivision) {
                try {
                    const pageAyahs = await getAyahsForDivision(pageDivision);
                    loadPlaylist(pageAyahs, true);
                } catch (error) {
                    console.error("Failed to get ayahs for page", error);
                }
            }
        }
    };

    const handleNextPage = () => {
        if (!currentSurah) return;
        const currentPageNumber = findPageForAyah(currentSurah.number, topVisibleAyah);
        if (currentPageNumber && currentPageNumber < 604) {
            const nextPage = pages.find(p => p.number === currentPageNumber + 1);
            if (nextPage) {
                navigateTo('reader', { surahNumber: nextPage.start.surah, ayahNumber: nextPage.start.ayah });
            }
        }
    };

    const handlePrevPage = () => {
        if (!currentSurah) return;
        const currentPageNumber = findPageForAyah(currentSurah.number, topVisibleAyah);
        if (currentPageNumber && currentPageNumber > 1) {
            const prevPage = pages.find(p => p.number === currentPageNumber - 1);
            if (prevPage) {
                navigateTo('reader', { surahNumber: prevPage.start.surah, ayahNumber: prevPage.start.ayah });
            }
        }
    };

    return (
        <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'tween', ease: 'easeOut', duration: 0.3 }}
            className="fixed bottom-0 right-0 left-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-slate-200 dark:border-slate-700 z-30"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
            <div className="max-w-4xl mx-auto flex justify-between items-center p-2">
                 <button onClick={handlePrevPage} aria-label="الصفحة السابقة" className="p-3 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                    <PreviousIcon className="w-7 h-7"/>
                </button>

                <button onClick={handleListenPage} aria-label="استماع" className="p-3 rounded-full bg-green-600 text-white hover:bg-green-700 transition-transform active:scale-95">
                    <HeadphonesIcon className="w-8 h-8"/>
                </button>

                 <button onClick={handleNextPage} aria-label="الصفحة التالية" className="p-3 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                    <NextIcon className="w-7 h-7"/>
                </button>
            </div>
        </motion.div>
    );
};
