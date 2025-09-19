import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Surah, SurahSimple } from '../types';
import { ChevronLeftIcon, ChevronRightIcon, NextIcon, PreviousIcon, ChevronUpIcon, ChevronDownIcon } from './Icons';
import { pages, juzs, hizbs, rubs } from '../data/quranicDivisions';
import { findCurrentDivision } from '../utils/text';
import { AnimatePresence, motion } from 'framer-motion';

interface QuranReaderFooterProps {
    surah: Surah;
    visibleAyah: number;
}

export const QuranReaderFooter: React.FC<QuranReaderFooterProps> = ({ surah, visibleAyah }) => {
    const { navigateTo, surahList } = useApp();
    const [isExpanded, setIsExpanded] = useState(false);

    const currentPage = findCurrentDivision(pages, surah.number, visibleAyah);
    const currentJuz = findCurrentDivision(juzs, surah.number, visibleAyah);
    const currentHizb = findCurrentDivision(hizbs, surah.number, visibleAyah);
    const currentRub = findCurrentDivision(rubs, surah.number, visibleAyah);

    const handleNavigation = (type: 'page' | 'juz' | 'hizb' | 'rub' | 'surah', direction: 'next' | 'prev') => {
        let targetSurah: number | undefined;
        let targetAyah: number | undefined;

        if (type === 'surah') {
            const currentSurahIndex = surahList.findIndex(s => s.number === surah.number);
            const nextSurahIndex = direction === 'next' ? currentSurahIndex + 1 : currentSurahIndex - 1;
            if (nextSurahIndex >= 0 && nextSurahIndex < surahList.length) {
                targetSurah = surahList[nextSurahIndex].number;
                targetAyah = 1;
            }
        } else {
            let currentDivision, allDivisions;
            switch (type) {
                case 'page': currentDivision = currentPage; allDivisions = pages; break;
                case 'juz': currentDivision = currentJuz; allDivisions = juzs; break;
                case 'hizb': currentDivision = currentHizb; allDivisions = hizbs; break;
                case 'rub': currentDivision = currentRub; allDivisions = rubs; break;
            }
            if (currentDivision) {
                const targetNumber = direction === 'next' ? currentDivision.number + 1 : currentDivision.number - 1;
                const targetDivision = allDivisions.find(d => d.number === targetNumber);
                if (targetDivision) {
                    targetSurah = targetDivision.start.surah;
                    targetAyah = targetDivision.start.ayah;
                }
            }
        }

        if (targetSurah !== undefined && targetAyah !== undefined) {
            navigateTo('reader', { surahNumber: targetSurah, ayahNumber: targetAyah, source: 'footer' });
        }
    };

    const NavButton = ({ onClick, children, disabled, 'aria-label': ariaLabel, className = '' }: { onClick: () => void, children: React.ReactNode, disabled?: boolean, 'aria-label': string, className?: string }) => (
        <button
            onClick={onClick}
            disabled={disabled}
            aria-label={ariaLabel}
            className={`flex items-center justify-center rounded-lg transition-colors hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        >
            {children}
        </button>
    );

    const DivisionNavigator = ({ label, division, onPrev, onNext, max, currentVal }: { label: string, division: any, onPrev: () => void, onNext: () => void, max: number, currentVal?: number }) => (
        <div className="flex items-center justify-between w-full">
            <NavButton onClick={onPrev} disabled={!division || currentVal === 1} aria-label={`${label} السابق`} className="h-10 w-10">
                <PreviousIcon className="w-6 h-6" />
            </NavButton>
            <div className="text-center text-sm font-semibold">
                <p className="font-bold text-slate-800 dark:text-slate-200">{label} {currentVal || '...'}</p>
            </div>
            <NavButton onClick={onNext} disabled={!division || currentVal === max} aria-label={`${label} التالي`} className="h-10 w-10">
                <NextIcon className="w-6 h-6" />
            </NavButton>
        </div>
    );

    return (
        <div
            role="navigation"
            aria-label="شريط التنقل في صفحة القراءة"
            className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-slate-200 dark:border-slate-700 z-30"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
            <div className="max-w-4xl mx-auto px-2 py-1">
                {/* Main Page Navigator */}
                <div className="flex justify-between items-center h-16">
                     <NavButton onClick={() => handleNavigation('page', 'prev')} disabled={!currentPage || currentPage.number === 1} aria-label="الصفحة السابقة" className="h-14 w-14">
                        <ChevronRightIcon className="w-8 h-8" />
                    </NavButton>
                    <button onClick={() => setIsExpanded(!isExpanded)} className="text-center" aria-expanded={isExpanded}>
                        <p className="text-sm font-semibold">صفحة {currentPage?.number || '...'}/604</p>
                        <div className="flex items-center justify-center text-xs text-slate-500">
                            <span>خيارات إضافية</span>
                            {isExpanded ? <ChevronDownIcon className="w-4 h-4 ml-1" /> : <ChevronUpIcon className="w-4 h-4 ml-1" />}
                        </div>
                    </button>
                    <NavButton onClick={() => handleNavigation('page', 'next')} disabled={!currentPage || currentPage.number === 604} aria-label="الصفحة التالية" className="h-14 w-14">
                        <ChevronLeftIcon className="w-8 h-8" />
                    </NavButton>
                </div>

                {/* Expandable Section */}
                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="py-2 space-y-2 border-t border-slate-200 dark:border-slate-700 mt-1">
                                <DivisionNavigator label="سورة" division={surah} onPrev={() => handleNavigation('surah', 'prev')} onNext={() => handleNavigation('surah', 'next')} max={114} currentVal={surah?.number} />
                                <DivisionNavigator label="الجزء" division={currentJuz} onPrev={() => handleNavigation('juz', 'prev')} onNext={() => handleNavigation('juz', 'next')} max={30} currentVal={currentJuz?.number} />
                                <DivisionNavigator label="الحزب" division={currentHizb} onPrev={() => handleNavigation('hizb', 'prev')} onNext={() => handleNavigation('hizb', 'next')} max={60} currentVal={currentHizb?.number}/>
                                <DivisionNavigator label="الربع" division={currentRub} onPrev={() => handleNavigation('rub', 'prev')} onNext={() => handleNavigation('rub', 'next')} max={240} currentVal={currentRub?.number}/>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};
