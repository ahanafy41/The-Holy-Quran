
import React, { useState, useMemo } from 'react';
import { Ayah, SurahSimple, QuranDivision } from '../types';
import * as api from '../services/quranApi';
import { useApp } from '../context/AppContext';
import {
    ArrowRightIcon, ChevronLeftIcon, BookOpenIcon,
} from './Icons';
import { juzs, pages, hizbs } from '../data/quranicDivisions';
import { motion, AnimatePresence } from 'framer-motion';
import { Spinner } from './Spinner';
import { ListenPlayerView } from './ListenPlayerView';


// Define types for clarity
type DivisionItem = SurahSimple | QuranDivision | { name: string; number: number };
interface DivisionConfig {
    id: string;
    title: string;
    items: DivisionItem[];
    itemLabel: string;
    icon: React.FC<{ className?: string }>;
}
type Playlist = {
    title: string;
    ayahs: Ayah[];
};

export const ListenPage: React.FC = () => {
    const { settings, setError, navigateTo } = useApp();
    const [playlist, setPlaylist] = useState<Playlist | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handlePlayRequest = async (item: DivisionItem, config: DivisionConfig) => {
        setIsLoading(true);
        setError(null);
        let ayahs: Ayah[] = [];
        let title = '';

        try {
            if (config.id === 'surahs') {
                const surah = item as SurahSimple;
                const fullSurah = await api.getSurah(surah.number, settings.reciter);
                ayahs = fullSurah.ayahs;
                title = `سورة ${surah.name}`;
            } else {
                const division = item as QuranDivision;
                const surahNumbers = Array.from({ length: division.end.surah - division.start.surah + 1 }, (_, i) => division.start.surah + i);
                const surahPromises = surahNumbers.map(num => api.getSurah(num, settings.reciter));
                const fetchedSurahs = await Promise.all(surahPromises);
                
                ayahs = fetchedSurahs.flatMap(s => s.ayahs).filter(a => {
                    if (!a.surah) return false;
                    const inRange = (sNum: number, aNum: number) => 
                        (sNum > division.start.surah || (sNum === division.start.surah && aNum >= division.start.ayah)) &&
                        (sNum < division.end.surah || (sNum === division.end.surah && aNum <= division.end.ayah));
                    return inRange(a.surah.number, a.numberInSurah);
                });
                title = `${config.itemLabel} ${division.number}`;
            }
            setPlaylist({ title, ayahs });
        } catch (e) {
            setError(`فشل تحميل المقطع الصوتي.`);
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const renderContent = () => {
        if (isLoading) {
            return <div className="text-center p-10 flex items-center justify-center gap-2"><Spinner/> جاري التحميل...</div>;
        }
        if (playlist) {
            return <ListenPlayerView playlist={playlist} onBack={() => setPlaylist(null)} />;
        }
        return (
             <div>
                <header className="flex items-center gap-4 mb-6">
                    <button onClick={() => navigateTo('home')} aria-label="الرجوع للقائمة الرئيسية" className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                        <ArrowRightIcon className="w-6 h-6 transform -scale-x-100" />
                    </button>
                    <h1 className="text-2xl md:text-3xl font-bold">الاستماع للقرآن الكريم</h1>
                </header>
                <SelectionView onPlayRequest={handlePlayRequest} />
            </div>
        );
    };
    
    return (
        <div className="max-w-4xl mx-auto">
            <AnimatePresence mode="wait">
                <motion.div
                    key={playlist ? 'player' : 'selection'}
                    initial={{ opacity: 0, x: playlist ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: playlist ? -20 : 20 }}
                    transition={{ duration: 0.25 }}
                >
                    {renderContent()}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

const SelectionView: React.FC<{onPlayRequest: (item: DivisionItem, config: DivisionConfig) => void}> = ({ onPlayRequest }) => {
    const { surahList } = useApp();
    const [activeList, setActiveList] = useState<DivisionConfig | null>(null);

    const surahMap = useMemo(() => new Map(surahList.map(s => [s.number, s.name])), [surahList]);

    const divisions = useMemo((): DivisionConfig[] => [
        { id: 'surahs', title: 'السور', items: surahList, itemLabel: 'سورة', icon: BookOpenIcon },
        { id: 'juzs', title: 'الأجزاء', items: juzs, itemLabel: 'جزء', icon: BookOpenIcon },
        { id: 'hizbs', title: 'الأحزاب', items: hizbs, itemLabel: 'حزب', icon: BookOpenIcon },
        { id: 'pages', title: 'الصفحات', items: pages, itemLabel: 'صفحة', icon: BookOpenIcon },
    ], [surahList]);

    return (
         <AnimatePresence mode="wait">
            {activeList ? (
                <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <ListView list={activeList} onBack={() => setActiveList(null)} onSelect={(item) => onPlayRequest(item, activeList)} surahMap={surahMap} />
                </motion.div>
            ) : (
                 <motion.div key="index" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <p className="text-slate-600 dark:text-slate-400 mb-6">اختر ما تود الاستماع إليه من الفهارس التالية.</p>
                    <IndexGrid divisions={divisions} onSelect={setActiveList} />
                </motion.div>
            )}
        </AnimatePresence>
    );
};

const IndexGrid: React.FC<{ divisions: DivisionConfig[]; onSelect: (config: DivisionConfig) => void; }> = ({ divisions, onSelect }) => (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        {divisions.map((div) => (
            <button key={div.id} onClick={() => onSelect(div)} className="p-4 md:p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-sm text-center hover:shadow-md hover:-translate-y-1 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-slate-900">
                <div.icon className="w-10 h-10 text-green-500 mx-auto" />
                <h2 className="text-lg font-bold mt-3">{div.title}</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{div.items.length > 0 ? `${div.items.length} ${div.itemLabel}` : 'قريباً'}</p>
            </button>
        ))}
    </div>
);

const ListView: React.FC<{ list: DivisionConfig; onBack: () => void; onSelect: (item: DivisionItem) => void; surahMap: Map<number, string>; }> = ({ list, onBack, onSelect, surahMap }) => (
    <div>
        <header className="flex items-center gap-4 mb-6">
            <button onClick={onBack} aria-label="الرجوع" className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                <ArrowRightIcon className="w-6 h-6 transform -scale-x-100" />
            </button>
            <h1 className="text-2xl md:text-3xl font-bold">{list.title}</h1>
        </header>
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm divide-y divide-slate-100 dark:divide-slate-700">
            {list.items.map((item: any, index: number) => (
                <button key={`${list.id}-${item.number || index}`} onClick={() => onSelect(item)} className="w-full flex items-center justify-between text-right p-4 hover:bg-green-50 dark:hover:bg-slate-700/50 transition-colors group">
                    <div>
                        <p className="font-semibold text-lg text-slate-800 dark:text-slate-200 group-hover:text-green-600 dark:group-hover:text-green-400">
                          {`${list.itemLabel} ${item.number}`}
                          {list.id === 'surahs' && ` - ${item.name}`}
                        </p>
                        {list.id !== 'surahs' && item.start && (
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
