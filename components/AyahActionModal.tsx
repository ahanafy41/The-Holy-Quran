
import React, { useState } from 'react';
import FocusTrap from 'focus-trap-react';
import { Ayah } from '../types';
import { useApp } from '../context/AppContext';
import { PlayIcon, PauseIcon, BookOpenIcon, ClipboardIcon, ShareIcon, SparklesIcon, XMarkIcon, HomeIcon, ArrowRightIcon, SearchIcon, BookmarkIcon } from './Icons';
import { AddBookmarkModal } from './AddBookmarkModal';


interface AyahActionModalProps {
    ayah: Ayah;
    onClose: () => void;
}

export const AyahActionModal: React.FC<AyahActionModalProps> = ({ ayah, onClose }) => {
    const { playAyah, pauseAyah, isPlaying, activeAyah, showTafsir, showAIAssistant, setSuccessMessage, setError, view, navigateTo, showSearch } = useApp();
    const [isBookmarkModalOpen, setIsBookmarkModalOpen] = useState(false);
    const [isFocusTrapActive, setIsFocusTrapActive] = useState(false);

    React.useEffect(() => {
        const timer = setTimeout(() => {
            setIsFocusTrapActive(true);
        }, 50); // Short delay to allow the modal to render and prevent focus racing issues on some devices.
        return () => clearTimeout(timer);
    }, []);

    const handleCopy = async () => {
        const textToCopy = `${ayah.text} (سورة ${ayah.surah?.name}: ${ayah.numberInSurah})`;
        try {
            await navigator.clipboard.writeText(textToCopy);
            setSuccessMessage('تم نسخ الآية!');
        } catch (err) {
            setError('فشل نسخ الآية.');
        }
        onClose();
    };

    const handleShare = async () => {
        const shareData = {
            title: `آية من القرآن الكريم`,
            text: `${ayah.text} (سورة ${ayah.surah?.name}: ${ayah.numberInSurah})`,
            url: window.location.href,
        };
        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                console.error('Error sharing:', err);
            }
        } else {
            handleCopy();
            setSuccessMessage('تم نسخ الآية للمشاركة!');
        }
        onClose();
    };

    const isCurrentlyPlaying = isPlaying && activeAyah?.number === ayah.number;
    const isNestedReadingView = ['reader', 'division'].includes(view);

    const menuItems = [
        { label: isCurrentlyPlaying ? 'إيقاف مؤقت' : 'استماع', icon: isCurrentlyPlaying ? PauseIcon : PlayIcon, action: () => { isCurrentlyPlaying ? pauseAyah() : playAyah(ayah); } },
        { label: 'عرض التفسير', icon: BookOpenIcon, action: () => { showTafsir(ayah); } },
        { label: 'إضافة علامة مرجعية', icon: BookmarkIcon, action: () => setIsBookmarkModalOpen(true) },
        { label: 'اسأل مساعد AI', icon: SparklesIcon, action: () => { showAIAssistant(ayah); } },
        { label: 'نسخ الآية', icon: ClipboardIcon, action: handleCopy },
        { label: 'مشاركة الآية', icon: ShareIcon, action: handleShare },
        { 
            label: isNestedReadingView ? 'الرجوع للفهرس' : 'الرئيسية', 
            icon: isNestedReadingView ? ArrowRightIcon : HomeIcon, 
            action: () => { 
                isNestedReadingView ? navigateTo('index') : navigateTo('home'); 
                onClose(); 
            },
            iconClassName: isNestedReadingView ? 'transform -scale-x-100' : ''
        },
        { label: 'بحث', icon: SearchIcon, action: () => { showSearch(); } },
    ];

    return (
        <>
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" role="presentation">
                <FocusTrap
                    active={isFocusTrapActive}
                    focusTrapOptions={{
                        onDeactivate: onClose,
                        clickOutsideDeactivates: true,
                    }}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="ayah-action-title"
                        aria-describedby="ayah-action-desc"
                    >
                        <header className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center flex-shrink-0">
                            <h2 id="ayah-action-title" className="font-bold text-lg">
                                {`سورة ${ayah.surah?.name} - الآية ${ayah.numberInSurah}`}
                            </h2>
                            <button onClick={onClose} aria-label="إغلاق" className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </header>

                        <div className="p-6 overflow-y-auto space-y-6 text-right">
                            <p id="ayah-action-desc" className="font-quran text-2xl leading-loose bg-slate-100 dark:bg-slate-700/50 p-4 rounded-md">
                                {ayah.text}
                            </p>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {menuItems.map((item) => (
                                    <button
                                        key={item.label}
                                        onClick={item.action}
                                        className="w-full flex items-center justify-start text-right gap-3 p-3 rounded-lg text-md font-medium transition-colors bg-slate-50 hover:bg-slate-100 dark:bg-slate-700/50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-slate-800"
                                    >
                                        <item.icon className={`w-6 h-6 text-green-500 ${ (item as any).iconClassName || ''}`} />
                                        <span>{item.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </FocusTrap>
            </div>
            {isBookmarkModalOpen && <AddBookmarkModal ayah={ayah} onClose={() => { setIsBookmarkModalOpen(false); onClose(); }} />}
        </>
    );
};