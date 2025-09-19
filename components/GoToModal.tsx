import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { juzs, hizbs, pages } from '../data/quranicDivisions';
import { CloseIcon } from './Icons';

interface GoToModalProps {
    onClose: () => void;
}

type GoToTab = 'juz' | 'page';

export const GoToModal: React.FC<GoToModalProps> = ({ onClose }) => {
    const { navigateTo } = useApp();
    const [activeTab, setActiveTab] = useState<GoToTab>('juz');
    const [pageInput, setPageInput] = useState('');

    const handleJuzSelect = (juzNumber: number) => {
        const juz = juzs.find(j => j.number === juzNumber);
        if (juz) {
            navigateTo('reader', { surahNumber: juz.start.surah, ayahNumber: juz.start.ayah });
            onClose();
        }
    };

    const handlePageSelect = () => {
        const pageNumber = parseInt(pageInput, 10);
        if (pageNumber >= 1 && pageNumber <= 604) {
            const page = pages.find(p => p.number === pageNumber);
            if (page) {
                navigateTo('reader', { surahNumber: page.start.surah, ayahNumber: page.start.ayah });
                onClose();
            }
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md"
                onClick={e => e.stopPropagation()}
            >
                <header className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-xl font-bold">اذهب إلى</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </header>

                <div className="p-4">
                    <div className="flex border-b border-slate-200 dark:border-slate-700 mb-4">
                        <button onClick={() => setActiveTab('juz')} className={`px-4 py-2 font-semibold ${activeTab === 'juz' ? 'border-b-2 border-green-500 text-green-600' : 'text-slate-500'}`}>
                            الجزء
                        </button>
                        <button onClick={() => setActiveTab('page')} className={`px-4 py-2 font-semibold ${activeTab === 'page' ? 'border-b-2 border-green-500 text-green-600' : 'text-slate-500'}`}>
                            الصفحة
                        </button>
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            {activeTab === 'juz' && (
                                <div className="grid grid-cols-5 gap-2 text-center max-h-64 overflow-y-auto">
                                    {juzs.map(juz => (
                                        <button key={juz.number} onClick={() => handleJuzSelect(juz.number)} className="p-3 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-green-100 dark:hover:bg-green-700 font-mono">
                                            {juz.number}
                                        </button>
                                    ))}
                                </div>
                            )}
                             {activeTab === 'page' && (
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        min="1"
                                        max="604"
                                        value={pageInput}
                                        onChange={(e) => setPageInput(e.target.value)}
                                        placeholder="رقم الصفحة (1-604)"
                                        className="flex-grow h-12 px-4 text-right bg-white dark:bg-slate-700 rounded-xl shadow-sm border-2 border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                                    />
                                    <button onClick={handlePageSelect} className="px-6 h-12 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700">
                                        اذهب
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </motion.div>
        </motion.div>
    );
};
