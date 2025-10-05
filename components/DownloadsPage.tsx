import React, { useState, useEffect, useMemo } from 'react';
import * as Downloader from '../services/downloadManager';
import { useApp } from '../context/AppContext';
import { motion } from 'framer-motion';
import { TrashIcon, DownloadIcon, FolderIcon, BookOpenIcon, MicrophoneIcon, ShieldCheckIcon } from './Icons';
import { Spinner } from './Spinner';

function formatBytes(bytes: number, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

const itemIcons: { [key in Downloader.DownloadedItem['type']]: React.FC<{className?: string}> } = {
    surah: BookOpenIcon,
    full_reciter: MicrophoneIcon,
    hadith_book: BookOpenIcon,
    hisn_category: ShieldCheckIcon,
    memorization_section: FolderIcon,
};

const itemTitles: { [key in Downloader.DownloadedItem['type']]: string } = {
    surah: 'سور',
    full_reciter: 'مصاحف كاملة',
    hadith_book: 'كتب حديث',
    hisn_category: 'صوتيات حصن المسلم',
    memorization_section: 'مقاطع الحفظ',
};

export const DownloadsPage: React.FC = () => {
    const [items, setItems] = useState<Downloader.DownloadedItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { setSuccessMessage, setError } = useApp();

    const fetchItems = async () => {
        setIsLoading(true);
        try {
            const allItems = await Downloader.getAllDownloadedItems();
            setItems(allItems);
        } catch (error) {
            console.error("Failed to fetch downloaded items", error);
            setError("فشل في جلب قائمة التحميلات.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, []);

    const handleRemoveItem = async (id: string) => {
        const itemToRemove = items.find(i => i.id === id);
        if (!itemToRemove) return;

        const confirmation = window.confirm(`هل أنت متأكد من حذف "${itemToRemove.name}"؟`);
        if (!confirmation) return;

        try {
            await Downloader.removeDownloadedItem(id);
            setSuccessMessage(`تم حذف "${itemToRemove.name}" بنجاح.`);
            // Refresh the list
            setItems(prevItems => prevItems.filter(item => item.id !== id));
        } catch (error) {
            console.error(`Failed to remove item ${id}`, error);
            setError("حدث خطأ أثناء الحذف.");
        }
    };

    const groupedItems = useMemo(() => {
        return items.reduce((acc, item) => {
            (acc[item.type] = acc[item.type] || []).push(item);
            return acc;
        }, {} as Record<Downloader.DownloadedItem['type'], Downloader.DownloadedItem[]>);
    }, [items]);

    const totalSize = useMemo(() => {
        return items.reduce((sum, item) => sum + (item.size || 0), 0);
    }, [items]);

    if (isLoading) {
        return <div className="text-center p-10"><Spinner /></div>;
    }

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-6">
            <header className="mb-6">
                <h1 className="text-3xl md:text-4xl font-bold">إدارة التحميلات</h1>
                <p className="text-slate-600 dark:text-slate-400">
                    المساحة المستخدمة: <span className="font-bold">{formatBytes(totalSize)}</span>
                </p>
            </header>

            {items.length === 0 ? (
                <div className="text-center p-8 space-y-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm">
                    <DownloadIcon className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600" />
                    <h3 className="text-xl font-semibold">لا توجد عناصر محملة</h3>
                    <p className="text-slate-500 dark:text-slate-400">يمكنك تحميل السور والصوتيات من الأقسام المختلفة لاستخدامها بدون انترنت.</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {Object.entries(groupedItems).map(([type, groupItems]) => {
                        const Icon = itemIcons[type as Downloader.DownloadedItem['type']];
                        const title = itemTitles[type as Downloader.DownloadedItem['type']];
                        return (
                            <section key={type}>
                                <h2 className="text-xl font-bold mb-3 flex items-center gap-3">
                                    <Icon className="w-6 h-6 text-green-500" />
                                    {title}
                                </h2>
                                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm divide-y divide-slate-100 dark:divide-slate-700">
                                    {groupItems.map(item => (
                                        <motion.div
                                            key={item.id}
                                            layout
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0, x: -50 }}
                                            className="p-4 flex items-center justify-between gap-4"
                                        >
                                            <div className="flex-grow">
                                                <p className="font-semibold text-slate-800 dark:text-slate-200">{item.name}</p>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">{formatBytes(item.size)}</p>
                                            </div>
                                            <button
                                                onClick={() => handleRemoveItem(item.id)}
                                                className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full text-red-500 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                                                aria-label={`حذف ${item.name}`}
                                            >
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        </motion.div>
                                    ))}
                                </div>
                            </section>
                        );
                    })}
                </div>
            )}
        </div>
    );
};