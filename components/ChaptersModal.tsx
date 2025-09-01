
import React from 'react';
import type { HadithChapter } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

interface ChaptersModalProps {
    chapters: HadithChapter[];
    onClose: () => void;
    onSelectChapter: (chapter: HadithChapter) => void;
}

export const ChaptersModal: React.FC<ChaptersModalProps> = ({ chapters, onClose, onSelectChapter }) => {
    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                onClick={onClose}
            >
                <motion.div
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -50, opacity: 0 }}
                    className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md max-h-[80vh] flex flex-col"
                    onClick={(e) => e.stopPropagation()}
                >
                    <header className="p-4 border-b border-slate-200 dark:border-slate-700">
                        <h2 className="text-xl font-bold text-right">الأبواب</h2>
                    </header>
                    <div className="overflow-y-auto p-4">
                        <div className="divide-y divide-slate-100 dark:divide-slate-700">
                            {chapters.map(chapter => (
                                <button
                                    key={chapter.id}
                                    onClick={() => onSelectChapter(chapter)}
                                    className="w-full text-right p-4 hover:bg-green-50 dark:hover:bg-slate-700/50 transition-colors group"
                                >
                                    <p className="font-semibold text-lg text-slate-800 dark:text-slate-200 group-hover:text-green-600 dark:group-hover:text-green-400">
                                        {chapter.arabic}
                                    </p>
                                </button>
                            ))}
                        </div>
                    </div>
                    <footer className="p-4 border-t border-slate-200 dark:border-slate-700">
                        <button
                            onClick={onClose}
                            className="w-full h-12 bg-slate-100 dark:bg-slate-700 rounded-xl font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                        >
                            إغلاق
                        </button>
                    </footer>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};
