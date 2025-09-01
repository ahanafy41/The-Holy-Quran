
import React, { useState } from 'react';
import FocusTrap from 'focus-trap-react';
import { useApp } from '../context/AppContext';
import { Ayah } from '../types';
import { BookmarkIcon, XMarkIcon } from './Icons';
import { motion } from 'framer-motion';

interface AddBookmarkModalProps {
    ayah: Ayah;
    onClose: () => void;
}

export const AddBookmarkModal: React.FC<AddBookmarkModalProps> = ({ ayah, onClose }) => {
    const { addBookmark } = useApp();
    const [name, setName] = useState(`سورة ${ayah.surah?.name}, آية ${ayah.numberInSurah}`);

    const handleSave = () => {
        if (name.trim() && ayah.surah) {
            addBookmark({ 
                name: name.trim(), 
                surahNumber: ayah.surah.number, 
                ayahNumber: ayah.numberInSurah 
            });
            onClose();
        }
    };

    const modalAnimation = {
        initial: { scale: 0.9, opacity: 0 },
        animate: { scale: 1, opacity: 1 },
        exit: { scale: 0.9, opacity: 0 },
        transition: { type: 'spring', damping: 15, stiffness: 200 }
    } as const;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" role="presentation">
            <FocusTrap
                active
                focusTrapOptions={{
                    onDeactivate: onClose,
                    clickOutsideDeactivates: true,
                }}
            >
                <motion.div
                    {...modalAnimation}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md flex flex-col"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="add-bookmark-title"
                >
                    <header className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                        <h2 id="add-bookmark-title" className="font-bold text-lg flex items-center gap-2">
                            <BookmarkIcon className="w-6 h-6 text-blue-500" />
                            إضافة علامة مرجعية
                        </h2>
                        <button onClick={onClose} aria-label="إغلاق" className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
                            <XMarkIcon className="w-5 h-5" />
                        </button>
                    </header>

                    <div className="p-6 space-y-4">
                        <div>
                            <label htmlFor="bookmark-name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">اسم العلامة</label>
                            <input 
                                type="text"
                                id="bookmark-name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                            />
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            {`سيتم حفظ الموضع: سورة ${ayah.surah?.name}, الآية ${ayah.numberInSurah}`}
                        </p>
                    </div>

                    <footer className="p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
                        <button onClick={onClose} className="px-4 py-2 rounded-md text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700">إلغاء</button>
                        <button onClick={handleSave} className="px-4 py-2 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-slate-800">حفظ</button>
                    </footer>
                </motion.div>
            </FocusTrap>
        </div>
    );
};
