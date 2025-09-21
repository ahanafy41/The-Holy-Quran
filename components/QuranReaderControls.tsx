import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { QuranDivision } from '../types';
import { juzs, hizbs, rubs, pages } from '../data/quranicDivisions';
import { ChevronRightIcon, ChevronLeftIcon } from './Icons';

interface ReaderControlsProps {
  division?: QuranDivision; // For DivisionView
}

const divisionMap: { [key: string]: { data: QuranDivision[], label: string } } = {
  'juzs': { data: juzs, label: 'الجزء' },
  'hizbs': { data: hizbs, label: 'الحزب' },
  'rubs': { data: rubs, label: 'الربع' },
  'pages': { data: pages, label: 'الصفحة' },
};

export const QuranReaderControls: React.FC<ReaderControlsProps> = ({ division }) => {
  const { navigationContext, navigateTo, currentSurah, lastReadPosition, surahList, isLoading } = useApp();

  const getCurrentDivisionInfo = () => {
    const context = navigationContext;
    if (!context) return null;

    if (context === 'surahs') {
        if (!currentSurah) return null;
        const currentSurahIndex = surahList.findIndex(s => s.number === currentSurah.number);
        return {
            context: 'surahs',
            label: 'السورة',
            current: currentSurahIndex,
            total: surahList.length,
        };
    }

    const divData = divisionMap[context];
    if (!divData) return null;

    let currentDivisionIndex = -1;

    if (division) { // We are in DivisionView
        currentDivisionIndex = divData.data.findIndex(d => d.number === division.number);
    } else if (lastReadPosition) { // We are in QuranView
        const { surahNumber, ayahNumber } = lastReadPosition;
        currentDivisionIndex = divData.data.findIndex(d =>
            (surahNumber > d.start.surah || (surahNumber === d.start.surah && ayahNumber >= d.start.ayah)) &&
            (surahNumber < d.end.surah || (surahNumber === d.end.surah && ayahNumber <= d.end.ayah))
        );
    }

    if (currentDivisionIndex === -1) return null;

    return {
      context,
      label: divData.label,
      current: currentDivisionIndex,
      total: divData.data.length,
    };
  };

  const info = useMemo(getCurrentDivisionInfo, [navigationContext, currentSurah, lastReadPosition, division, surahList]);

  if (!info) {
    return null;
  }

  const handleNext = () => {
    if (info.current >= info.total - 1) return;
    const nextIndex = info.current + 1;

    if (info.context === 'surahs') {
        const nextSurah = surahList[nextIndex];
        if (nextSurah) {
            navigateTo('reader', { surahNumber: nextSurah.number, navigationContext: 'surahs' });
        }
    } else {
        const divData = divisionMap[info.context].data;
        const nextDivision = divData[nextIndex];
        const surahName = surahList.find(s => s.number === nextDivision.start.surah)?.name;

        // When navigating pages, we want to stay in the reader view
        if (info.context === 'pages') {
            navigateTo('reader', { surahNumber: nextDivision.start.surah, ayahNumber: nextDivision.start.ayah, navigationContext: 'pages' });
        } else {
            navigateTo('division', {
                division: { ...nextDivision, title: `${divisionMap[info.context].label} ${nextDivision.number}`, startSurahName: surahName },
                navigationContext: info.context,
            });
        }
    }
  };

  const handlePrev = () => {
    if (info.current <= 0) return;
    const prevIndex = info.current - 1;

    if (info.context === 'surahs') {
        const prevSurah = surahList[prevIndex];
        if (prevSurah) {
            navigateTo('reader', { surahNumber: prevSurah.number, navigationContext: 'surahs' });
        }
    } else {
        const divData = divisionMap[info.context].data;
        const prevDivision = divData[prevIndex];
        const surahName = surahList.find(s => s.number === prevDivision.start.surah)?.name;

        if (info.context === 'pages') {
            navigateTo('reader', { surahNumber: prevDivision.start.surah, ayahNumber: prevDivision.start.ayah, navigationContext: 'pages' });
        } else {
            navigateTo('division', {
                division: { ...prevDivision, title: `${divisionMap[info.context].label} ${prevDivision.number}`, startSurahName: surahName },
                navigationContext: info.context,
            });
        }
    }
  };

  const isNextDisabled = info.current >= info.total - 1;
  const isPrevDisabled = info.current <= 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-lg border-t border-slate-200 dark:border-slate-700 z-30">
      <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
        <button
          onClick={handlePrev}
          disabled={isPrevDisabled || isLoading}
          aria-label={`${info.label} السابق`}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRightIcon className="w-5 h-5" />
          <span>السابق</span>
        </button>

        <div className="text-center">
            <p className="font-semibold text-slate-800 dark:text-slate-200">{info.label}</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">{info.current + 1} / {info.total}</p>
        </div>

        <button
          onClick={handleNext}
          disabled={isNextDisabled || isLoading}
          aria-label={`${info.label} التالي`}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <span>التالي</span>
          <ChevronLeftIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
