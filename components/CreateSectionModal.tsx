
import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { SurahSimple, SavedSection } from '../types';
import { useApp } from '../context/AppContext';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { XMarkIcon } from './Icons';

export const CreateSectionModal: React.FC<{onClose: () => void, onSave: (section: Omit<SavedSection, 'id'>) => void}> = ({ onClose, onSave }) => {
    const { surahList } = useApp();
    const [selectedSurah, setSelectedSurah] = useState<SurahSimple | null>(null);
    const [startAyah, setStartAyah] = useState<number | null>(null);
    const [endAyah, setEndAyah] = useState<number | null>(null);
    const [sectionName, setSectionName] = useState('');
    const [error, setError] = useState('');
    const modalRef = useRef<HTMLDivElement>(null);

    useFocusTrap(modalRef, onClose);

    const handleAyahClick = (ayahNum: number) => {
        setError('');
        if (startAyah === null || (startAyah !== null && endAyah !== null)) {
            setStartAyah(ayahNum);
            setEndAyah(null);
        } else {
            if (ayahNum < startAyah) { setEndAyah(startAyah); setStartAyah(ayahNum); }
            else { setEndAyah(ayahNum); }
        }
    };

    const handleSaveClick = () => {
        if (!sectionName.trim()) { setError('يرجى إدخال اسم للمقطع.'); return; }
        if (!selectedSurah || startAyah === null || endAyah === null) { setError('يرجى تحديد سورة ونطاق آيات صحيح.'); return; }
        onSave({ name: sectionName.trim(), surahNumber: selectedSurah.number, startAyah, endAyah });
    };
    
    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <motion.div ref={modalRef} initial={{scale:0.9, opacity:0}} animate={{scale:1, opacity:1}} exit={{scale:0.9, opacity:0}}
                onClick={e => e.stopPropagation()} className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-lg flex flex-col" role="dialog" aria-modal="true" aria-labelledby="create-section-title">
                <header className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                    <h3 id="create-section-title" className="font-bold text-lg">إضافة مقطع جديد</h3>
                    <button onClick={onClose} aria-label="Close" className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"><XMarkIcon className="w-5 h-5" /></button>
                </header>
                <div className="p-6 space-y-4 text-right">
                    <input type="text" value={sectionName} onChange={e => setSectionName(e.target.value)} placeholder="اسم المقطع (مثال: مراجعة الأسبوع)"
                        className="w-full p-2.5 rounded-md bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-right focus:outline-none focus:ring-2 focus:ring-green-500" />
                    <select value={selectedSurah?.number || ''}
                        onChange={e => {
                            const surah = surahList.find(s => s.number === parseInt(e.target.value)) || null;
                            setSelectedSurah(surah);
                            setStartAyah(null); setEndAyah(null);
                        }}
                        className="w-full p-2.5 rounded-md bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-right appearance-none focus:outline-none focus:ring-2 focus:ring-green-500">
                        <option value="" disabled>-- اختر سورة --</option>
                        {surahList.map(s => <option key={s.number} value={s.number}>{s.number}. {s.name} ({s.englishName})</option>)}
                    </select>

                    {selectedSurah && (
                        <div>
                            <p className="text-sm font-medium mb-2 text-right">اختر بداية ونهاية المقطع:</p>
                            <div className="grid grid-cols-7 sm:grid-cols-10 gap-1.5 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700 max-h-52 overflow-y-auto">
                                {Array.from({ length: selectedSurah.numberOfAyahs }, (_, i) => i + 1).map(num => {
                                    const isSelected = startAyah !== null && endAyah !== null && num >= startAyah && num <= endAyah;
                                    const isEndpoint = num === startAyah || num === endAyah;
                                    return (
                                        <button key={num} onClick={() => handleAyahClick(num)} aria-pressed={isSelected}
                                            className={`p-1.5 h-9 rounded text-sm font-mono transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-green-500
                                            ${isEndpoint ? 'bg-green-600 text-white font-bold' : isSelected ? 'bg-green-200 dark:bg-green-800/60' : 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600'}`}>
                                            {num}
                                        </button>
                                    );
                                })}
                            </div>
                            {startAyah && <div aria-live="polite" className="text-right text-sm mt-2 text-slate-600 dark:text-slate-400">
                                {endAyah ? `المحدد: من الآية ${startAyah} إلى ${endAyah}`: `البداية: الآية ${startAyah}. اختر آية النهاية.`}
                            </div>}
                        </div>
                    )}
                </div>
                {error && <p className="text-red-500 text-sm text-center px-6 pb-2" role="alert">{error}</p>}
                <footer className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500 font-semibold">إلغاء</button>
                    <button onClick={handleSaveClick} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold">حفظ المقطع</button>
                </footer>
            </motion.div>
        </div>
    );
};
