
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { juzs, pages, hizbs, rubs } from '../data/quranicDivisions';
import * as api from '../services/quranApi';
import { QuranDivision, SurahSimple, SavedSection } from '../types';
import { BookOpenIcon, FolderIcon, ChevronLeftIcon, ArrowRightIcon, FlowerIcon } from './Icons';
import { motion, AnimatePresence } from 'framer-motion';
import { AdvancedSearch } from './AdvancedSearch';
import SmartDownloadButton from './SmartDownloadButton';


/**
 * @typedef {SurahSimple | QuranDivision | { name: string; number: number } | SavedSection} DivisionItem
 * @description A union type representing the different kinds of items that can be displayed in a division list.
 */
type DivisionItem = SurahSimple | QuranDivision | { name: string; number: number } | SavedSection;

/**
 * @interface DivisionConfig
 * @description Defines the configuration for a specific type of Quranic division (e.g., "Surahs", "Juzs").
 * @property {string} id - A unique identifier for the division type.
 * @property {string} title - The display title for the division (e.g., "السور").
 * @property {DivisionItem[]} items - An array of the items belonging to this division.
 * @property {string} itemLabel - The singular label for an item in this division (e.g., "سورة").
 * @property {React.FC<{ className?: string }>} icon - The icon component to be displayed for this division in the grid.
 */
interface DivisionConfig {
    id: string;
    title: string;
    items: DivisionItem[];
    itemLabel: string;
    icon: React.FC<{ className?: string }>;
}

/**
 * `IndexPage` serves as the main navigation hub for browsing the Quran.
 * It allows users to select a division type (like Surah, Juz, or Page) and then view a list of items within that division.
 * It manages the state between showing the main grid of division types and the detailed list view for a selected type.
 *
 * @component
 * @returns {React.ReactElement} The main index page component.
 */
export const IndexPage: React.FC = () => {
    const { surahList } = useApp();
    const [activeList, setActiveList] = useState<DivisionConfig | null>(null);
    const titleRef = useRef<HTMLHeadingElement>(null);

    useEffect(() => {
        if (!activeList) {
            const timer = setTimeout(() => {
                titleRef.current?.focus();
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [activeList]);

    const surahMap = useMemo(() => new Map(surahList.map(s => [s.number, s.name])), [surahList]);

    const divisions = useMemo((): DivisionConfig[] => [
        { id: 'surahs', title: 'السور', items: surahList, itemLabel: 'سورة', icon: BookOpenIcon },
        { id: 'juzs', title: 'الأجزاء', items: juzs, itemLabel: 'جزء', icon: BookOpenIcon },
        { id: 'hizbs', title: 'الأحزاب', items: hizbs, itemLabel: 'حزب', icon: BookOpenIcon },
        { id: 'rubs', title: 'الأرباع', items: rubs, itemLabel: 'ربع', icon: BookOpenIcon },
        { id: 'pages', title: 'الصفحات', items: pages, itemLabel: 'صفحة', icon: BookOpenIcon },
    ], [surahList]);

    const handleDivisionSelect = (div: DivisionConfig) => {
        setActiveList(div);
    };
    
    const listAnimation = { initial: { opacity: 0, x: 10 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -10 } };
    const indexAnimation = { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } };

    return (
        <div className="max-w-4xl mx-auto">
             <header className="mb-6">
                <div>
                     <h1 ref={titleRef} tabIndex={-1} className="text-3xl md:text-4xl font-bold focus:outline-none">فهرس القرآن</h1>
                     <p className="text-slate-600 dark:text-slate-400">تصفح حسب السور، الأجزاء، الصفحات، والمزيد.</p>
                </div>
            </header>

            <AdvancedSearch />

            <AnimatePresence mode="wait">
                {activeList ? (
                    <motion.div key="list" {...listAnimation}>
                        <ListView list={activeList} onBack={() => setActiveList(null)} surahMap={surahMap} />
                    </motion.div>
                ) : (
                    <motion.div key="index" {...indexAnimation}>
                        <IndexGrid divisions={divisions} onSelect={handleDivisionSelect} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

/**
 * `IndexGrid` is a presentational component that displays a grid of buttons for each Quranic division type.
 *
 * @component
 * @param {{ divisions: DivisionConfig[]; onSelect: (config: DivisionConfig) => void; }} props - The component props.
 * @param {DivisionConfig[]} props.divisions - The array of division configurations to display.
 * @param {(config: DivisionConfig) => void} props.onSelect - Callback function triggered when a division is selected.
 * @returns {React.ReactElement} A grid of division selection buttons.
 */
const IndexGrid: React.FC<{ divisions: DivisionConfig[]; onSelect: (config: DivisionConfig) => void; }> = ({ divisions, onSelect }) => (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        {divisions.map((div) => (
            <button key={div.id} onClick={() => onSelect(div)} className="p-4 md:p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-sm text-center hover:shadow-md hover:-translate-y-1 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-slate-900">
                <div.icon className="w-10 h-10 text-green-500 mx-auto" />
                <h2 className="text-lg font-bold mt-3">{div.title}</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{div.items.length > 0 ? `${div.items.length} ${div.itemLabel}` : 'فارغ'}</p>
            </button>
        ))}
    </div>
);

/**
 * `ListView` is a presentational component that displays a list of items for a selected division type (e.g., all Surahs, all Juzs).
 * It provides a back button to return to the `IndexGrid` and handles navigation when an item is selected.
 *
 * @component
 * @param {{ list: DivisionConfig; onBack: () => void; surahMap: Map<number, string>; }} props - The component props.
 * @param {DivisionConfig} props.list - The configuration object for the list to be displayed.
 * @param {() => void} props.onBack - Callback function to go back to the index grid.
 * @param {Map<number, string>} props.surahMap - A map of surah numbers to their names, for displaying context.
 * @returns {React.ReactElement} A component displaying a list of division items.
 */
const ListView: React.FC<{ list: DivisionConfig; onBack: () => void; surahMap: Map<number, string>; }> = ({ list, onBack, surahMap }) => {
    const listTitleRef = useRef<HTMLHeadingElement>(null);
    const { navigateTo, settings } = useApp();

    useEffect(() => {
        const timer = setTimeout(() => {
            listTitleRef.current?.focus();
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    const handleItemClick = (item: any) => {
        if (list.id === 'surahs') {
            navigateTo('reader', { surahNumber: item.number, navigationContext: 'surahs' });
        } else {
            const surahName = surahMap.get(item.start.surah);
            navigateTo('division', {
                division: { ...item, title: `${list.itemLabel} ${item.number}`, startSurahName: surahName },
                navigationContext: list.id,
            });
        }
    };

    return (
        <div>
            <header className="flex items-center gap-4 mb-4">
                <button onClick={onBack} aria-label="الرجوع إلى الفهرس" className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                    <ArrowRightIcon className="w-6 h-6" />
                </button>
                <h2 ref={listTitleRef} tabIndex={-1} className="text-2xl font-bold focus:outline-none">{list.title}</h2>
            </header>
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm divide-y divide-slate-100 dark:divide-slate-700">
                {list.items.map((item: any, index: number) => (
                    list.id === 'surahs' ? (
                        <div key={`surah-${item.number}`} className="w-full flex items-center justify-between text-right p-4 group">
                            <button onClick={() => handleItemClick(item)} className="flex-grow text-right">
                                <div>
                                    <p className="font-semibold text-lg text-slate-800 dark:text-slate-200 group-hover:text-green-600 dark:group-hover:text-green-400">
                                        {item.name}
                                    </p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        {item.revelationType === 'Medinan' ? 'مدنية' : 'مكية'} - {item.numberOfAyahs} آيات
                                    </p>
                                </div>
                            </button>
                            <div className="flex-shrink-0 ml-4">
                                <SmartDownloadButton
                                    itemId={`surah-${item.number}`}
                                    itemName={`سورة ${item.name}`}
                                    itemType="surah"
                                    getUrlsToDownload={async () => {
                                        const reciter = settings.memorizationReciter;
                                        const surahData = await api.getSurah(item.number, reciter);
                                        const surahApiUrl = `https://api.alquran.cloud/v1/surah/${item.number}/${reciter}`;
                                        const audioUrls = surahData.ayahs.flatMap(ayah => [ayah.audio, ...(ayah.audioSecondarys || [])]).filter(Boolean);
                                        return [surahApiUrl, ...audioUrls];
                                    }}
                                />
                            </div>
                        </div>
                    ) : (
                        <button key={`${list.id}-${item.number || index}`} onClick={() => handleItemClick(item)} className="w-full flex items-center justify-between text-right p-4 hover:bg-green-50 dark:hover:bg-slate-700/50 transition-colors group">
                            <div>
                                <p className="font-semibold text-lg text-slate-800 dark:text-slate-200 group-hover:text-green-600 dark:group-hover:text-green-400">
                                  {`${list.itemLabel} ${item.number}`}
                                </p>
                                {list.id !== 'pages' && item.start && (
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        يبدأ من: سورة {surahMap.get(item.start.surah)}، آية {item.start.ayah}
                                    </p>
                                )}
                            </div>
                            <ChevronLeftIcon className="w-5 h-5 text-slate-400 group-hover:text-green-500 transition-colors" />
                        </button>
                    )
                ))}
            </div>
        </div>
    );
};
