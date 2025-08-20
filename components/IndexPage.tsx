
import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { juzs, pages, hizbs, rubs } from '../data/quranicDivisions';
import { QuranDivision, SurahSimple, SavedSection } from '../types';
import { BookOpenIcon, FolderIcon, ChevronLeftIcon, ArrowRightIcon, FlowerIcon } from './Icons';
import { motion, AnimatePresence } from 'framer-motion';


// Define types for clarity
type DivisionItem = SurahSimple | QuranDivision | { name: string; number: number } | SavedSection;
interface DivisionConfig {
    id: string;
    title: string;
    items: DivisionItem[];
    itemLabel: string;
    icon: React.FC<{ className?: string }>;
}

export const IndexPage: React.FC = () => {
    const { surahList, navigateTo, savedSections } = useApp();
    const [activeList, setActiveList] = useState<DivisionConfig | null>(null);

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
    
    const handleBack = () => {
        if(activeList) {
            setActiveList(null);
        } else {
            navigateTo('home');
        }
    }
    
    const listAnimation = { initial: { opacity: 0, x: 10 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -10 } };
    const indexAnimation = { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } };

    return (
        <div className="max-w-4xl mx-auto">
             <header className="flex items-center gap-4 mb-6">
                <button onClick={handleBack} aria-label="الرجوع" className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                    <ArrowRightIcon className="w-6 h-6 transform -scale-x-100" />
                </button>
                <div>
                     <h1 className="text-3xl md:text-4xl font-bold">فهرس القرآن</h1>
                     <p className="text-slate-600 dark:text-slate-400">تصفح حسب السور، الأجزاء، الصفحات، والمزيد.</p>
                </div>
            </header>
            <AnimatePresence mode="wait">
                {activeList ? (
                    <motion.div key="list" {...listAnimation}>
                        <ListView list={activeList} onBack={() => setActiveList(null)} navigateTo={navigateTo as any} surahMap={surahMap} />
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

// Index Grid View
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

// List View for a selected division
const ListView: React.FC<{ list: DivisionConfig; onBack: () => void; navigateTo: Function; surahMap: Map<number, string>; }> = ({ list, onBack, navigateTo, surahMap }) => {

    const handleItemClick = (item: any) => {
        if (list.id === 'surahs') {
            navigateTo('reader', { surahNumber: item.number });
        } else {
            const surahName = surahMap.get(item.start.surah);
            navigateTo('division', {
                division: { ...item, title: `${list.itemLabel} ${item.number}`, startSurahName: surahName }
            });
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">{list.title}</h2>
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm divide-y divide-slate-100 dark:divide-slate-700">
                {list.items.map((item: any, index: number) => (
                    <button key={`${list.id}-${item.number || index}`} onClick={() => handleItemClick(item)} className="w-full flex items-center justify-between text-right p-4 hover:bg-green-50 dark:hover:bg-slate-700/50 transition-colors group">
                        <div>
                            <p className="font-semibold text-lg text-slate-800 dark:text-slate-200 group-hover:text-green-600 dark:group-hover:text-green-400">
                              {`${list.itemLabel} ${item.number}`}
                              {list.id === 'surahs' && ` - ${item.name}`}
                            </p>
                            {list.id !== 'surahs' && list.id !== 'pages' && item.start && (
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    يبدأ من: سورة {surahMap.get(item.start.surah)}، آية {item.start.ayah}
                                </p>
                            )}
                        </div>
                        <ChevronLeftIcon className="w-5 h-5 text-slate-400 group-hover:text-green-500 transition-colors" />
                    </button>
                ))}
            </div>
        </div>
    );
};
