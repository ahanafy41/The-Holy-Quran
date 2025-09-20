import React from 'react';
import { useApp } from '../context/AppContext';
import { Surah } from '../types';
import { ChevronLeftIcon, ChevronRightIcon, NextIcon, PreviousIcon } from './Icons';
import { pages } from '../data/quranicDivisions';
import { findCurrentDivision } from '../utils/text';

interface ReaderFooterProps {
    surah: Surah;
    visibleAyah: number;
}

export const ReaderFooter: React.FC<ReaderFooterProps> = ({ surah, visibleAyah }) => {
    const { navigateTo, surahList } = useApp();

    const currentPage = findCurrentDivision(pages, surah.number, visibleAyah);

    const handleSurahNavigation = (direction: 'next' | 'prev') => {
        const currentSurahIndex = surahList.findIndex(s => s.number === surah.number);
        const nextSurahIndex = direction === 'next' ? currentSurahIndex + 1 : currentSurahIndex - 1;

        if (nextSurahIndex >= 0 && nextSurahIndex < surahList.length) {
            const targetSurah = surahList[nextSurahIndex];
            navigateTo('reader', {
                surahNumber: targetSurah.number,
                ayahNumber: 1,
                source: 'footer'
            });
        }
    };

    const handlePageNavigation = (direction: 'next' | 'prev') => {
        if (currentPage) {
            const targetPageNumber = direction === 'next' ? currentPage.number + 1 : currentPage.number - 1;
            const targetPage = pages.find(p => p.number === targetPageNumber);
            if (targetPage) {
                navigateTo('reader', {
                    surahNumber: targetPage.start.surah,
                    ayahNumber: targetPage.start.ayah,
                    source: 'footer'
                });
            }
        }
    };

    const NavButton = ({ onClick, disabled, 'aria-label': ariaLabel, children }: { onClick: () => void, disabled: boolean, 'aria-label': string, children: React.ReactNode }) => (
        <button
            onClick={onClick}
            disabled={disabled}
            aria-label={ariaLabel}
            className="flex flex-col items-center justify-center w-20 h-full p-2 rounded-lg transition-colors hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
        >
            {children}
        </button>
    );

    return (
        <nav
            aria-label="شريط التنقل في القراءة"
            className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-slate-200 dark:border-slate-700 z-30"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
            <div className="max-w-4xl mx-auto h-16 flex justify-around items-center px-2">
                <NavButton
                    onClick={() => handleSurahNavigation('prev')}
                    disabled={surah.number === 1}
                    aria-label="السورة السابقة"
                >
                    <PreviousIcon className="w-6 h-6" />
                    <span className="text-xs mt-1">السورة</span>
                </NavButton>

                <NavButton
                    onClick={() => handlePageNavigation('prev')}
                    disabled={!currentPage || currentPage.number === 1}
                    aria-label="الصفحة السابقة"
                >
                    <ChevronRightIcon className="w-7 h-7" />
                     <span className="text-xs mt-1">صفحة</span>
                </NavButton>

                <div className="text-center">
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        صفحة {currentPage?.number || '...'}
                    </p>
                </div>

                <NavButton
                    onClick={() => handlePageNavigation('next')}
                    disabled={!currentPage || currentPage.number === 604}
                    aria-label="الصفحة التالية"
                >
                    <ChevronLeftIcon className="w-7 h-7" />
                     <span className="text-xs mt-1">صفحة</span>
                </NavButton>

                <NavButton
                    onClick={() => handleSurahNavigation('next')}
                    disabled={surah.number === 114}
                    aria-label="السورة التالية"
                >
                    <NextIcon className="w-6 h-6" />
                    <span className="text-xs mt-1">السورة</span>
                </NavButton>
            </div>
        </nav>
    );
};
