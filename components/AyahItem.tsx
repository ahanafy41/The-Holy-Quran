
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ayah } from '../types';
import { useApp } from '../context/AppContext';

interface AyahItemProps {
    ayah: Ayah;
    isSelected: boolean;
    isHighlighted?: boolean;
    onSelect: (event: React.MouseEvent<HTMLDivElement, MouseEvent> | React.KeyboardEvent<HTMLDivElement>) => void;
    layoutIdPrefix: string; // To ensure unique layoutIds across different views
}

export const AyahItem = React.forwardRef<HTMLDivElement, AyahItemProps>(({ ayah, isSelected, isHighlighted, onSelect, layoutIdPrefix }, ref) => {
    const { activeAyah } = useApp();
    const isPlaying = activeAyah?.number === ayah.number;
    const descriptionId = `desc-${layoutIdPrefix}-${ayah.number}`;
    
    const ayahNumberCircle = (
        <div className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-sm font-mono bg-slate-100 dark:bg-slate-700/50 rounded-full group-hover:bg-green-100 dark:group-hover:bg-green-900/50 transition-colors">
            {ayah.numberInSurah}
        </div>
    );

    const outlineAnimation = {
        layoutId: `outline-${layoutIdPrefix}-${ayah.number}`,
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 }
    };

    return (
        <div
            ref={ref}
            onClick={onSelect}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelect(e); }}
            tabIndex={0}
            role="button"
            aria-label={`${ayah.text} - الآية رقم ${ayah.numberInSurah} من سورة ${ayah.surah?.name}.`}
            aria-describedby={descriptionId}
            aria-haspopup="dialog"
            aria-expanded={isSelected}
            className={`group p-4 rounded-xl transition-all duration-300 relative cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-500/50 dark:focus:ring-green-400/50 ${
                isSelected ? 'bg-green-50 dark:bg-green-500/10' :
                isHighlighted ? 'bg-yellow-100 dark:bg-yellow-400/10 ring-2 ring-yellow-400/50' :
                isPlaying ? 'bg-green-50 dark:bg-green-500/10' :
                'hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
        >
            <span id={descriptionId} className="sr-only">للمزيد من الخيارات، اضغط Enter.</span>
            <AnimatePresence>
            {(isSelected || isPlaying) && (
                <motion.div 
                    {...outlineAnimation}
                    className="absolute inset-0 ring-2 ring-green-500 rounded-xl pointer-events-none"
                />
            )}
            </AnimatePresence>
            {ayahNumberCircle}
            <p dir="rtl" className="font-quran text-3xl md:text-4xl leading-loose text-right pr-14" aria-hidden="true">
                {ayah.text}
            </p>
        </div>
    );
});