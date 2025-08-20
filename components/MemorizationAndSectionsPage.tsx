
import React, { useState, useMemo, useEffect } from 'react';
import { Ayah, SavedSection, SurahSimple } from '../types';
import * as api from '../services/quranApi';
import { useApp } from '../context/AppContext';
import { FlowerIcon, PlayIcon, ArrowRightIcon, BookOpenIcon, TrashIcon, MicrophoneIcon } from './Icons';
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
            const surahData = await api.getSurah(section.surahNumber, settings.reciter);
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
            const surahData = await api.getSurah(section.surahNumber, settings.reciter);
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
                    initial={{ opacity: 0, x: (playlist || samiaPlaylist) ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: (playlist || samiaPlaylist) ? -20 : 20 }}
                    transition={{ duration: 0.25 }}
                >
                    {renderContent()}
                </motion.div>
            </AnimatePresence>
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
    
    const { surahList, navigateTo } = useApp();
    const surahMap = useMemo(() => new Map(surahList.map(s => [s.number, s.name])), [surahList]);

    return (
        <div className="space-y-6">
            <header className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                     <button onClick={() => navigateTo('home')} aria-label="الرجوع للقائمة الرئيسية" className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                        <ArrowRightIcon className="w-6 h-6 transform -scale-x-100" />
                    </button>
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold">الحفظ والمراجعة</h1>
                        <p className="text-slate-600 dark:text-slate-400">أنشئ وراجع مقاطعك المحفوظة.</p>
                    </div>
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
                        <div key={section.id} className="p-4 flex flex-wrap items-center justify-between gap-4 group">
                             <div className="text-right flex-grow">
                                <h3 className="font-bold text-lg text-green-600 dark:text-green-500">{section.name}</h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    سورة {surahMap.get(section.surahNumber) || '...'} | الآيات: {section.startAyah} - {section.endAyah}
                                </p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                                <button onClick={() => onRemoveSection(section.id)} aria-label={`حذف مقطع ${section.name}`}
                                    className="w-9 h-9 flex items-center justify-center rounded-full text-slate-400 hover:bg-red-100 hover:text-red-500 dark:hover:bg-red-900/50 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100">
                                    <TrashIcon className="w-5 h-5"/>
                                </button>
                                <button onClick={() => onReadSection(section)} aria-label={`قراءة مقطع ${section.name}`}
                                    className="w-9 h-9 flex items-center justify-center rounded-full text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-700 transition-colors">
                                    <BookOpenIcon className="w-5 h-5"/>
                                </button>
                                 <button onClick={() => onStartSamia(section)} aria-label={`تسميع مقطع ${section.name}`}
                                    className="px-3 py-2 text-sm font-semibold flex items-center gap-2 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:hover:bg-blue-500/30 transition-colors">
                                    <MicrophoneIcon className="w-4 h-4" />
                                    <span>تسميع</span>
                                </button>
                                <button onClick={() => onStartListening(section)} aria-label={`بدء الحفظ لمقطع ${section.name}`}
                                    className="px-3 py-2 text-sm font-semibold flex items-center gap-2 bg-green-100 text-green-700 rounded-full hover:bg-green-200 dark:bg-green-500/20 dark:text-green-300 dark:hover:bg-green-500/30 transition-colors">
                                    <PlayIcon className="w-4 h-4" />
                                    <span>استماع</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
