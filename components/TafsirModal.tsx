
import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { XMarkIcon } from './Icons';
import { Spinner } from './Spinner';
import { Ayah, Tafsir } from '../types';

interface TafsirModalProps {
    content: {
        ayah: Ayah;
        tafsir: Tafsir | null;
        surahNumber: number;
        surahName: string;
        tafsirName?: string;
        isLoading: boolean;
        error?: string;
    };
    onClose: () => void;
}

export const TafsirModal: React.FC<TafsirModalProps> = ({ content, onClose }) => {
    const modalRef = useRef<HTMLDivElement>(null);
    useFocusTrap(modalRef, onClose);

    const modalAnimation = {
        initial: {scale: 0.95, opacity: 0},
        animate: {scale: 1, opacity: 1},
        exit: {scale: 0.95, opacity: 0}
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <motion.div ref={modalRef} {...modalAnimation}
              onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col" role="dialog" aria-modal="true" aria-labelledby="tafsir-title">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                    <h3 id="tafsir-title" className="font-bold text-lg">{content.tafsirName || 'التفسير'} - الآية {content.surahNumber}:{content.ayah.numberInSurah}</h3>
                    <button onClick={onClose} aria-label="Close Tafsir" className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"><XMarkIcon className="w-5 h-5" /></button>
                </div>
                <div className="p-6 overflow-y-auto space-y-4 text-right">
                    <div className="font-quran text-2xl leading-loose bg-slate-100 dark:bg-slate-700/50 p-4 rounded-md">{content.ayah.text}</div>
                    {content.isLoading && <div className="text-center p-4 flex justify-center items-center gap-2"><Spinner/> ...جاري تحميل التفسير</div>}
                    {content.error && <div className="text-center p-4 text-red-500" role="alert">{content.error}</div>}
                    {content.tafsir && <div className="text-lg leading-relaxed prose dark:prose-invert max-w-none">{content.tafsir.text}</div>}
                </div>
                 <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 text-left">
                    <button onClick={onClose} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-slate-800">إغلاق</button>
                </div>
            </motion.div>
        </div>
    );
};
