import React from 'react';
import { useApp } from '../context/AppContext';
import { Surah } from '../types';
import { ChevronLeftIcon, ChevronRightIcon, NextIcon, PreviousIcon } from './Icons';
import { pages, juzs, hizbs, rubs } from '../data/quranicDivisions';
import { findCurrentDivision } from '../utils/text';

interface QuranReaderFooterProps {
    surah: Surah;
    visibleAyah: number;
}

export const QuranReaderFooter: React.FC<QuranReaderFooterProps> = ({ surah, visibleAyah }) => {
    const { navigateTo } = useApp();

    const currentPage = findCurrentDivision(pages, surah.number, visibleAyah);
    const currentJuz = findCurrentDivision(juzs, surah.number, visibleAyah);
    const currentHizb = findCurrentDivision(hizbs, surah.number, visibleAyah);
    const currentRub = findCurrentDivision(rubs, surah.number, visibleAyah);

    const handleNavigation = (type: 'page' | 'juz' | 'hizb' | 'rub', direction: 'next' | 'prev') => {
        let currentDivision, allDivisions;
        switch (type) {
            case 'page':
                currentDivision = currentPage;
                allDivisions = pages;
                break;
            case 'juz':
                currentDivision = currentJuz;
                allDivisions = juzs;
                break;
            case 'hizb':
                currentDivision = currentHizb;
                allDivisions = hizbs;
                break;
            case 'rub':
                currentDivision = currentRub;
                allDivisions = rubs;
                break;
        }

        if (currentDivision) {
            const targetNumber = direction === 'next' ? currentDivision.number + 1 : currentDivision.number - 1;
            const targetDivision = allDivisions.find(d => d.number === targetNumber);
            if (targetDivision) {
                navigateTo('reader', { surahNumber: targetDivision.start.surah, ayahNumber: targetDivision.start.ayah, division: undefined });
            }
        }
    };

    const NavButton = ({ onClick, children, disabled }: { onClick: () => void, children: React.ReactNode, disabled?: boolean }) => (
        <button
            onClick={onClick}
            disabled={disabled}
            className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {children}
        </button>
    );

    const DivisionNavigator = ({ type, division, onPrev, onNext }: { type: string, division: any, onPrev: () => void, onNext: () => void }) => (
        <div className="flex items-center justify-center gap-2">
            <NavButton onClick={onPrev} disabled={!division || division.number === 1}>
                <PreviousIcon className="w-5 h-5" />
            </NavButton>
            <div className="text-center text-xs font-semibold w-20">
                <span className="text-slate-500">{type}</span>
                <p className="font-bold text-slate-800 dark:text-slate-200">{division?.number || '...'}</p>
            </div>
            <NavButton onClick={onNext} disabled={!division || division.number === (type === 'Juz' ? 30 : type === 'Hizb' ? 60 : 240)}>
                <NextIcon className="w-5 h-5" />
            </NavButton>
        </div>
    );

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-slate-200 dark:border-slate-700 z-30"
             style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
            <div className="max-w-4xl mx-auto px-2 py-1">
                <div className="flex justify-between items-center mb-1">
                    <NavButton onClick={() => handleNavigation('page', 'prev')} disabled={!currentPage || currentPage.number === 1}>
                        <ChevronRightIcon className="w-6 h-6" />
                    </NavButton>
                    <div className="text-sm text-center text-slate-600 dark:text-slate-300 font-semibold">
                        <p>Page {currentPage?.number || '...'}/604</p>
                    </div>
                    <NavButton onClick={() => handleNavigation('page', 'next')} disabled={!currentPage || currentPage.number === 604}>
                        <ChevronLeftIcon className="w-6 h-6" />
                    </NavButton>
                </div>
                <div className="grid grid-cols-3 gap-1">
                    <DivisionNavigator type="Juz" division={currentJuz} onPrev={() => handleNavigation('juz', 'prev')} onNext={() => handleNavigation('juz', 'next')} />
                    <DivisionNavigator type="Hizb" division={currentHizb} onPrev={() => handleNavigation('hizb', 'prev')} onNext={() => handleNavigation('hizb', 'next')} />
                    <DivisionNavigator type="Rub" division={currentRub} onPrev={() => handleNavigation('rub', 'prev')} onNext={() => handleNavigation('rub', 'next')} />
                </div>
            </div>
        </div>
    );
};
