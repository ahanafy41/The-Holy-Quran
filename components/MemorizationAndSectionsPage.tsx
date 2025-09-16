
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Ayah, SavedSection, SurahSimple } from '../types';
import * as api from '../services/quranApi';
import { useApp } from '../context/AppContext';
import { FlowerIcon, BookOpenIcon, TrashIcon, MicrophoneIcon, ThreeDotsVerticalIcon } from './Icons';
import { motion, AnimatePresence } from 'framer-motion';
import { SamiaSessionModal } from './SamiaSessionModal';
import { Spinner } from './Spinner';
import { CreateSectionModal } from './CreateSectionModal';
import { MemorizationPlayerView } from './MemorizationPlayerView';


type PlayerPlaylist = {
    section: SavedSection;
    ayahs: Ayah[];
};

export const MemorizationAndSectionsPage: React.FC = () => {
    const { savedSections, settings, setError, addSavedSection, removeSavedSection, navigateTo, surahList, apiKey, showSettings, pauseAyah: pauseGlobalPlayer } = useApp();
    const [playlist, setPlaylist] = useState<PlayerPlaylist | null>(null);
    const [samiaPlaylist, setSamiaPlaylist] = useState<PlayerPlaylist | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    // Stop the global player when this view is active
    useEffect(() => {
        pauseGlobalPlayer();
    }, [playlist, samiaPlaylist, pauseGlobalPlayer]);

    const handleStartListening = async (section: SavedSection) => {
        setIsLoading(true);
        setError(null);
        try {
            const surahData = await api.getSurah(section.surahNumber, settings.memorizationReciter);
            const sectionAyahs = surahData.ayahs.filter(
                ayah => ayah.numberInSurah >= section.startAyah && ayah.numberInSurah <= section.endAyah
            );
            setPlaylist({ section, ayahs: sectionAyahs });
        } catch (e) {
            setError('فشل تحميل المقطع للاستماع.');
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleStartSamia = async (section: SavedSection) => {
        if (!apiKey) {
            setError('يرجى إدخال مفتاح API الخاص بك في الإعدادات لاستخدام ميزة التسميع.');
            showSettings();
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            // We don't need reciter for Samia mode, but getSurah requires it. We can use any valid one.
            const surahData = await api.getSurah(section.surahNumber, settings.memorizationReciter);
            const sectionAyahs = surahData.ayahs.filter(
                ayah => ayah.numberInSurah >= section.startAyah && ayah.numberInSurah <= section.endAyah
            );
            setSamiaPlaylist({ section, ayahs: sectionAyahs });
        } catch (e) {
            setError('فشل تحميل بيانات المقطع للتسميع.');
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleReadSection = (section: SavedSection) => {
        const surahInfo = surahList.find(s => s.number === section.surahNumber);
        const title = `${section.name} (سورة ${surahInfo?.name || section.surahNumber})`;
        navigateTo('division', {
            division: {
                number: 0,
                start: { surah: section.surahNumber, ayah: section.startAyah },
                end: { surah: section.surahNumber, ayah: section.endAyah },
                title: title,
                startSurahName: surahInfo?.name,
            }
        });
    };

    const renderContent = () => {
        if (isLoading) {
            return <div className="text-center p-10 flex items-center justify-center gap-2"><Spinner/> جاري التحضير...</div>;
        }
         if (samiaPlaylist) {
            return <SamiaSessionModal playlist={samiaPlaylist} onClose={() => setSamiaPlaylist(null)} />;
        }
        if (playlist) {
            return <MemorizationPlayerView playlist={playlist} onBack={() => setPlaylist(null)} />;
        }
        return (
            <SectionListView 
                savedSections={savedSections} 
                onStartListening={handleStartListening}
                onStartSamia={handleStartSamia}
                onReadSection={handleReadSection}
                onAddSection={() => setIsCreating(true)}
                onRemoveSection={removeSavedSection}
            />
        );
    };

    const viewAnimation = {
        initial: { opacity: 0, x: (playlist || samiaPlaylist) ? 20 : -20 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: (playlist || samiaPlaylist) ? -20 : 20 },
        transition: { duration: 0.25 }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <AnimatePresence>
                {isCreating && (
                    <CreateSectionModal 
                        onClose={() => setIsCreating(false)} 
                        onSave={(section) => {
                            addSavedSection(section);
                            setIsCreating(false);
                        }}
                    />
                )}
            </AnimatePresence>
            <AnimatePresence mode="wait">
                <motion.div
                    key={playlist ? 'player' : samiaPlaylist ? 'samia' : 'selection'}
                    {...viewAnimation}
                >
                    {renderContent()}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

const OptionsMenu: React.FC<{
    section: SavedSection;
    onRead: () => void;
    onSamia: () => void;
    onRemove: () => void;
    onClose: () => void;
}> = ({ section, onRead, onSamia, onRemove, onClose }) => {
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    return (
        <div ref={menuRef} className="absolute z-10 left-4 mt-2 w-48 bg-white dark:bg-slate-700 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                <button onClick={onRead} className="w-full text-right flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600" role="menuitem">
                    <BookOpenIcon className="w-5 h-5" />
                    <span>قراءة</span>
                </button>
                <button onClick={onSamia} className="w-full text-right flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600" role="menuitem">
                    <MicrophoneIcon className="w-5 h-5" />
                    <span>تسميع</span>
                </button>
                <div className="border-t border-slate-100 dark:border-slate-600 my-1" />
                <button onClick={onRemove} className="w-full text-right flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/40" role="menuitem">
                    <TrashIcon className="w-5 h-5" />
                    <span>حذف</span>
                </button>
            </div>
        </div>
    );
};


const SectionListView: React.FC<{
    savedSections: SavedSection[];
    onStartListening: (section: SavedSection) => void;
    onStartSamia: (section: SavedSection) => void;
    onReadSection: (section: SavedSection) => void;
    onAddSection: () => void;
    onRemoveSection: (id: string) => void;
}> = ({ savedSections, onStartListening, onStartSamia, onReadSection, onAddSection, onRemoveSection }) => {
    
    const { surahList } = useApp();
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const surahMap = useMemo(() => new Map(surahList.map(s => [s.number, s.name])), [surahList]);
    const titleRef = useRef<HTMLHeadingElement>(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            titleRef.current?.focus();
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    const handleMenuToggle = (event: React.MouseEvent, sectionId: string) => {
        event.stopPropagation();
        setOpenMenuId(prevId => (prevId === sectionId ? null : sectionId));
    };

    return (
        <div className="space-y-6">
            <header className="flex justify-between items-center">
                <div>
                    <h1 ref={titleRef} tabIndex={-1} className="text-3xl md:text-4xl font-bold focus:outline-none">الحفظ والمراجعة</h1>
                    <p className="text-slate-600 dark:text-slate-400">أنشئ وراجع مقاطعك المحفوظة.</p>
                </div>
                <button onClick={onAddSection} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition-colors flex-shrink-0">
                   إضافة مقطع
                </button>
            </header>
            
            {savedSections.length === 0 ? (
                <div className="text-center p-8 space-y-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm">
                    <FlowerIcon className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600" />
                    <h3 className="text-xl font-semibold">لا توجد مقاطع محفوظة</h3>
                    <p className="text-slate-500 dark:text-slate-400">انقر على "إضافة مقطع" لإنشاء مقطعك الأول.</p>
                </div>
            ) : (
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm divide-y divide-slate-100 dark:divide-slate-700">
                    {savedSections.map(section => (
                        <div key={section.id} className="relative p-4 flex items-center justify-between gap-4 group hover:bg-green-50 dark:hover:bg-slate-700/50 transition-colors">
                            <button onClick={() => onStartListening(section)} className="text-right flex-grow">
                                <h3 className="font-bold text-lg text-green-600 dark:text-green-500">{section.name}</h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    سورة {surahMap.get(section.surahNumber) || '...'} | الآيات: {section.startAyah} - {section.endAyah}
                                </p>
                            </button>
                            <div className="relative flex items-center gap-2 flex-shrink-0">
                                 <button
                                    onClick={(e) => handleMenuToggle(e, section.id)}
                                    aria-label={`خيارات مقطع ${section.name}`}
                                    className="w-9 h-9 flex items-center justify-center rounded-full text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-700 transition-colors">
                                    <ThreeDotsVerticalIcon className="w-5 h-5"/>
                                </button>
                                <AnimatePresence>
                                    {openMenuId === section.id && (
                                        <motion.div initial={{opacity: 0, y: -10}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: -10}} className="absolute top-full right-0">
                                            <OptionsMenu
                                                section={section}
                                                onRead={() => { onReadSection(section); setOpenMenuId(null); }}
                                                onSamia={() => { onStartSamia(section); setOpenMenuId(null); }}
                                                onRemove={() => { onRemoveSection(section.id); setOpenMenuId(null); }}
                                                onClose={() => setOpenMenuId(null)}
                                            />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};