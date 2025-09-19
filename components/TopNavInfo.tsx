import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { pages, juzs, hizbs } from '../data/quranicDivisions';
import { GoToModal } from './GoToModal';

// Helper function to find the division for a given surah and ayah
const findDivisionInfo = (surahNumber: number, ayahNumber: number) => {
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

    const juz = juzs.find(j => {
        if (surahNumber > j.start.surah && surahNumber < j.end.surah) return true;
        if (surahNumber === j.start.surah && ayahNumber >= j.start.ayah) {
             if (surahNumber < j.end.surah || (surahNumber === j.end.surah && ayahNumber <= j.end.ayah)) return true;
        }
        if (surahNumber === p.end.surah && ayahNumber <= p.end.ayah) {
            if (surahNumber > j.start.surah) return true;
        }
        return false;
    });

    const hizb = hizbs.find(h => {
        if (surahNumber > h.start.surah && surahNumber < h.end.surah) return true;
        if (surahNumber === h.start.surah && ayahNumber >= h.start.ayah) {
             if (surahNumber < h.end.surah || (surahNumber === h.end.surah && ayahNumber <= h.end.ayah)) return true;
        }
        if (surahNumber === h.end.surah && ayahNumber <= h.end.ayah) {
            if (surahNumber > h.start.surah) return true;
        }
        return false;
    });


    return {
        pageNumber: page?.number,
        juzNumber: juz?.number,
        hizbNumber: hizb?.number
    };
};


interface TopNavInfoProps {
    topVisibleAyah: number;
}

export const TopNavInfo: React.FC<TopNavInfoProps> = ({ topVisibleAyah }) => {
    const { currentSurah } = useApp();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const divisionInfo = useMemo(() => {
        if (!currentSurah) return { pageNumber: null, juzNumber: null, hizbNumber: null };
        return findDivisionInfo(currentSurah.number, topVisibleAyah);
    }, [currentSurah, topVisibleAyah]);

    return (
        <>
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-3 mt-2 flex justify-between items-center text-sm">
                <div className="flex gap-4 font-semibold text-slate-600 dark:text-slate-300">
                    <span>الجزء: {divisionInfo.juzNumber || '...'}</span>
                    <span>الحزب: {divisionInfo.hizbNumber || '...'}</span>
                    <span>الصفحة: {divisionInfo.pageNumber || '...'}</span>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-4 py-2 bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 rounded-md hover:bg-green-200 dark:hover:bg-green-800 font-semibold transition-colors"
                >
                    اذهب إلى...
                </button>
            </div>
            <AnimatePresence>
                {isModalOpen && <GoToModal onClose={() => setIsModalOpen(false)} />}
            </AnimatePresence>
        </>
    );
};
