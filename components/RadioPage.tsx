
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { RadioStation } from '../types';
import { useApp } from '../context/AppContext';
import { SearchIcon, ChevronLeftIcon, ArrowRightIcon } from './Icons';
import { motion, AnimatePresence } from 'framer-motion';
import { Spinner } from './Spinner';
import { RadioPlayerView } from './RadioPlayerView';

type View = 'list' | 'player';

export const RadioPage: React.FC = () => {
    const { radioStations, isLoading } = useApp();
    const [view, setView] = useState<View>('list');
    const [selectedStation, setSelectedStation] = useState<RadioStation | null>(null);

    const handleStationSelect = (station: RadioStation) => {
        setSelectedStation(station);
        setView('player');
    };
    
    const handleBack = () => {
        setView('list');
        setSelectedStation(null);
    };
    
    const renderContent = () => {
        if (view === 'player' && selectedStation) {
            return <RadioPlayerView station={selectedStation} onBack={handleBack} />;
        }
        return <RadioListView stations={radioStations} onSelect={handleStationSelect} isLoading={isLoading} />;
    };
    
    const viewAnimation = {
        initial: { opacity: 0, x: 20 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -20 },
        transition: { duration: 0.25 }
    };
    
    return (
        <div className="max-w-4xl mx-auto">
             <AnimatePresence mode="wait">
                <motion.div
                    key={view}
                    {...viewAnimation}
                >
                    {renderContent()}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

const RadioListView: React.FC<{stations: RadioStation[], onSelect: (r: RadioStation) => void, isLoading: boolean}> = ({ stations, onSelect, isLoading }) => {
    const titleRef = useRef<HTMLHeadingElement>(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => {
            titleRef.current?.focus();
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    const filteredStations = useMemo(() => {
        if (!searchQuery.trim()) {
            return stations;
        }
        return stations.filter(station =>
            station.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [stations, searchQuery]);

    if (isLoading) {
        return <div className="text-center p-10 flex items-center justify-center gap-2"><Spinner/> جاري تحميل الإذاعات...</div>;
    }

    if (stations.length === 0 && !searchQuery) {
        return (
            <div className="text-center p-10">
                <h2 className="text-xl font-semibold mb-2">لم يتم العثور على إذاعات</h2>
                <p className="text-slate-500">قد تكون هناك مشكلة في الاتصال بالإنترنت أو أن الـ API لا يستجيب.</p>
            </div>
        );
    }
    
    return (
        <div>
            <header className="mb-6 space-y-4">
                <h1 ref={titleRef} tabIndex={-1} className="text-2xl md:text-3xl font-bold focus:outline-none">إذاعات القرآن الكريم</h1>
                <div className="relative">
                    <input
                        type="search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="ابحث عن إذاعة..."
                        className="w-full h-12 px-4 pr-11 text-right bg-white dark:bg-slate-800 rounded-xl shadow-sm border-2 border-transparent focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                        aria-label="ابحث عن إذاعة"
                    />
                    <div className="absolute top-0 right-0 h-12 w-12 flex items-center justify-center text-slate-400 dark:text-slate-500 pointer-events-none">
                        <SearchIcon className="w-5 h-5" />
                    </div>
                </div>
            </header>
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm">
                {filteredStations.length > 0 ? (
                    <div className="divide-y divide-slate-100 dark:divide-slate-700 max-h-[calc(100vh-20rem)] overflow-y-auto">
                        {filteredStations.map(station => (
                            <button key={station.id} onClick={() => onSelect(station)} className="w-full flex items-center justify-between text-right p-4 hover:bg-green-50 dark:hover:bg-slate-700/50 transition-colors group">
                                <p className="font-semibold text-lg text-slate-800 dark:text-slate-200 group-hover:text-green-600 dark:group-hover:text-green-400">
                                    {station.name}
                                </p>
                                <ChevronLeftIcon className="w-5 h-5 text-slate-400 group-hover:text-green-500 transition-colors" />
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                        <p>لم يتم العثور على نتائج للبحث "{searchQuery}"</p>
                    </div>
                )}
            </div>
        </div>
    )
}
