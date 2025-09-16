
import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { SurahSimple, SavedSection } from '../types';
import { useApp } from '../context/AppContext';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { XMarkIcon } from './Icons';

export const CreateSectionModal: React.FC<{onClose: () => void, onSave: (section: Omit<SavedSection, 'id'>) => void}> = ({ onClose, onSave }) => {
    const { surahList } = useApp();
    const [selectedSurah, setSelectedSurah] = useState<SurahSimple | null>(null);
    const [startAyah, setStartAyah] = useState<number>(1);
    const [endAyah, setEndAyah] = useState<number>(1);
    const [sectionName, setSectionName] = useState('');
    const [error, setError] = useState('');
    const modalRef = useRef<HTMLDivElement>(null);

    useFocusTrap(modalRef, onClose);

    useEffect(() => {
        if (selectedSurah && startAyah && endAyah) {
            const defaultName = `سورة ${selectedSurah.name}, الآيات ${startAyah}-${endAyah}`;
            setSectionName(defaultName);
        }
    }, [selectedSurah, startAyah, endAyah]);

    const handleSurahChange = (surahNum: number) => {
        const surah = surahList.find(s => s.number === surahNum) || null;
        setSelectedSurah(surah);
        setStartAyah(1);
        setEndAyah(surah ? surah.numberOfAyahs : 1);
        setError('');
    };

    const handleStartAyahChange = (ayahNum: number) => {
        setStartAyah(ayahNum);
        if (ayahNum > endAyah) {
            setEndAyah(ayahNum);
        }
    };

    const handleSaveClick = () => {
        if (!sectionName.trim()) { setError('يرجى إدخال اسم للمقطع.'); return; }
        if (!selectedSurah || !startAyah || !endAyah) { setError('يرجى تحديد سورة ونطاق آيات صحيح.'); return; }
        onSave({ name: sectionName.trim(), surahNumber: selectedSurah.number, startAyah, endAyah });
    };

    const modalAnimation = {
        initial: {scale:0.9, opacity:0},
        animate: {scale:1, opacity:1},
        exit: {scale:0.9, opacity:0}
    };
    
    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <motion.div ref={modalRef} {...modalAnimation}
                onClick={e => e.stopPropagation()} className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-lg flex flex-col" role="dialog" aria-modal="true" aria-labelledby="create-section-title">
                <header className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                    <h3 id="create-section-title" className="font-bold text-lg">إضافة مقطع جديد</h3>
                    <button onClick={onClose} aria-label="Close" className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"><XMarkIcon className="w-5 h-5" /></button>
                </header>
                <div className="p-6 space-y-4 text-right">
                    <select value={selectedSurah?.number || ''}
                        onChange={e => handleSurahChange(parseInt(e.target.value))}
                        className="w-full p-2.5 rounded-md bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-right appearance-none focus:outline-none focus:ring-2 focus:ring-green-500">
                        <option value="" disabled>-- اختر سورة --</option>
                        {surahList.map(s => <option key={s.number} value={s.number}>{s.number}. {s.name} ({s.englishName})</option>)}
                    </select>

                    {selectedSurah && (
                        <div className='space-y-4'>
                             <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="startAyah" className="block text-sm font-medium mb-1">من آية:</label>
                                    <select id="startAyah" value={startAyah} onChange={e => handleStartAyahChange(parseInt(e.target.value))}
                                        className="w-full p-2.5 rounded-md bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-right appearance-none focus:outline-none focus:ring-2 focus:ring-green-500">
                                        {Array.from({ length: selectedSurah.numberOfAyahs }, (_, i) => i + 1).map(num => (
                                            <option key={num} value={num}>{num}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="endAyah" className="block text-sm font-medium mb-1">إلى آية:</label>
                                    <select id="endAyah" value={endAyah} onChange={e => setEndAyah(parseInt(e.target.value))}
                                        className="w-full p-2.5 rounded-md bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-right appearance-none focus:outline-none focus:ring-2 focus:ring-green-500">
                                        {Array.from({ length: selectedSurah.numberOfAyahs }, (_, i) => i + 1)
                                            .filter(num => num >= startAyah)
                                            .map(num => (
                                                <option key={num} value={num}>{num}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                             <input type="text" value={sectionName} onChange={e => setSectionName(e.target.value)} placeholder="اسم المقطع (اختياري)"
                                className="w-full p-2.5 rounded-md bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-right focus:outline-none focus:ring-2 focus:ring-green-500" />
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
