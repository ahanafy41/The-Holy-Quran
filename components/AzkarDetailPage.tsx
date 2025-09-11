import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import azkarData from '../azkar-data/azkar.json';
import { ChevronRightIcon, PlayIcon, PauseIcon } from './Icons';
import { motion } from 'framer-motion';

interface Zikr {
    id: number;
    text: string;
    count: number;
    audio: string;
    filename: string;
}

interface AzkarCategory {
    id: number;
    category: string;
    audio: string;
    filename: string;
    array: Zikr[];
}

export const AzkarDetailPage: React.FC = () => {
    const { navigateTo, viewParams, playAzkarAudio, stopAzkarAudio, activeAzkarAudio, isPlaying } = useApp() as any; // Using 'as any' for now
    const [category, setCategory] = useState<AzkarCategory | null>(null);

    useEffect(() => {
        if (viewParams?.categoryId) {
            const cat = azkarData.find(c => c.id === viewParams.categoryId);
            setCategory(cat || null);
        }
    }, [viewParams]);

    if (!category) {
        return (
            <div className="text-center">
                <h1 className="text-2xl font-bold">لم يتم العثور على القسم</h1>
                <button onClick={() => navigateTo('azkar-hisn-al-muslim')} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
                    العودة إلى الأقسام
                </button>
            </div>
        );
    }

    const handlePlayPause = (audioPath: string) => {
        const fullAudioPath = `/azkar-data${audioPath}`;
        if (activeAzkarAudio === fullAudioPath && isPlaying) {
            stopAzkarAudio();
        } else {
            playAzkarAudio(fullAudioPath, fullAudioPath);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <header className="mb-8 flex items-center justify-between">
                 <button
                    onClick={() => navigateTo('azkar-hisn-al-muslim')}
                    className="flex items-center gap-1 text-blue-500 hover:underline"
                >
                    <ChevronRightIcon className="w-5 h-5 transform rotate-180" />
                    <span>العودة</span>
                </button>
                <h1 tabIndex={-1} className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white focus:outline-none text-right">
                    {category.category}
                </h1>
            </header>

            <div className="space-y-4">
                {category.array.map((zikr, index) => (
                    <motion.div
                        key={zikr.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6"
                    >
                        <p className="text-xl leading-relaxed text-slate-800 dark:text-slate-200 mb-4 font-arabic" style={{direction: 'rtl'}}>
                            {zikr.text}
                        </p>
                        <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
                            <span className="font-bold text-blue-500 bg-blue-100 dark:bg-blue-900 dark:text-blue-300 px-3 py-1 rounded-full">
                                يقرأ {zikr.count} مرات
                            </span>
                            <button
                                onClick={() => handlePlayPause(zikr.audio)}
                                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                aria-label="تشغيل الصوت"
                            >
                                {activeAzkarAudio === `/azkar-data${zikr.audio}` && isPlaying ? (
                                    <PauseIcon className="w-6 h-6 text-blue-500" />
                                ) : (
                                    <PlayIcon className="w-6 h-6 text-blue-500" />
                                )}
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};
