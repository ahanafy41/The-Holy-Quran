import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import * as offlineService from '../services/offlineService';
import { CheckCircleIcon, ArrowDownTrayIcon, TrashIcon } from './Icons';
import { Reciter } from '../types';

type DownloadStatus = 'downloaded' | 'downloading' | 'none';

export const OfflineManager: React.FC = () => {
    const { reciters, setSuccessMessage, setError } = useApp();
    
    const [reciterStatuses, setReciterStatuses] = useState<Record<string, DownloadStatus>>({});
    const [reciterProgress, setReciterProgress] = useState<Record<string, number>>({});
    
    const [quranDataStatus, setQuranDataStatus] = useState<DownloadStatus>('none');
    const [quranDataProgress, setQuranDataProgress] = useState(0);

    const updateAllStatuses = useCallback(async () => {
        // Update Quran data status
        if (quranDataStatus !== 'downloading') {
            const isDataDownloaded = await offlineService.isQuranDataDownloaded();
            setQuranDataStatus(isDataDownloaded ? 'downloaded' : 'none');
        }

        // Update reciter statuses
        const downloadedReciters = await offlineService.getDownloadedReciters();
        const newReciterStatuses: Record<string, DownloadStatus> = {};
        reciters.forEach(r => {
             if (reciterStatuses[r.identifier] !== 'downloading') {
                newReciterStatuses[r.identifier] = downloadedReciters.includes(r.identifier) ? 'downloaded' : 'none';
            }
        });
        setReciterStatuses(s => ({...s, ...newReciterStatuses}));
    }, [reciters, reciterStatuses, quranDataStatus]);

    useEffect(() => {
        if (reciters.length > 0) {
           updateAllStatuses();
        }
    }, [reciters, updateAllStatuses]);

    const handleDownloadReciter = async (reciter: Reciter) => {
        setReciterStatuses(s => ({ ...s, [reciter.identifier]: 'downloading' }));
        setReciterProgress(p => ({ ...p, [reciter.identifier]: 0 }));
        try {
            await offlineService.downloadReciter(reciter, (p) => {
                setReciterProgress(prog => ({ ...prog, [reciter.identifier]: p }));
            });
            setSuccessMessage(`تم تنزيل تلاوة الشيخ ${reciter.name} بنجاح.`);
        } catch (e) {
            setError(`فشل تنزيل تلاوة الشيخ ${reciter.name}.`);
        } finally {
            updateAllStatuses();
        }
    };
    
    const handleDeleteReciter = async (reciter: Reciter) => {
        const confirmed = window.confirm(`هل أنت متأكد من حذف بيانات القارئ ${reciter.name}؟`);
        if (confirmed) {
            try {
                await offlineService.deleteReciter(reciter.identifier);
                setSuccessMessage(`تم حذف تلاوة الشيخ ${reciter.name}.`);
            } catch (e) {
                 setError(`فشل حذف تلاوة الشيخ ${reciter.name}.`);
            } finally {
                 updateAllStatuses();
            }
        }
    };

    const handleDownloadQuranData = async () => {
        setQuranDataStatus('downloading');
        setQuranDataProgress(0);
        try {
            await offlineService.downloadQuranData(p => setQuranDataProgress(p));
            setSuccessMessage('تم تنزيل بيانات القرآن والنصوص بنجاح.');
        } catch (e) {
            setError('فشل تنزيل بيانات القرآن.');
        } finally {
            updateAllStatuses();
        }
    };

    const handleDeleteQuranData = async () => {
        const confirmed = window.confirm(`هل أنت متأكد من حذف بيانات القرآن النصية؟ هذا الإجراء لا يمكن التراجع عنه.`);
        if (confirmed) {
            try {
                await offlineService.deleteQuranData();
                setSuccessMessage('تم حذف بيانات القرآن النصية.');
            } catch (e) {
                setError('فشل حذف بيانات القرآن.');
            } finally {
                updateAllStatuses();
            }
        }
    };
    
    return (
        <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
            <h4 className="font-medium mb-3 text-right">إدارة التنزيلات (الاستخدام بدون إنترنت)</h4>
            
            <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                <div className="flex items-center justify-between">
                     <div className="text-right">
                         <h5 className="font-semibold text-sm">بيانات القرآن والنصوص</h5>
                         <p className="text-xs text-slate-500 dark:text-slate-400">للقراءة والبحث (حجم صغير)</p>
                     </div>
                     {quranDataStatus === 'none' && (
                        <button onClick={handleDownloadQuranData} className="p-2 text-blue-600 dark:text-blue-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors" aria-label="تنزيل بيانات القرآن">
                            <ArrowDownTrayIcon className="w-5 h-5" />
                        </button>
                     )}
                     {quranDataStatus === 'downloading' && (
                        <div className="w-16 text-xs font-mono text-center" aria-live="polite">
                            {Math.round(quranDataProgress * 100)}%
                        </div>
                     )}
                     {quranDataStatus === 'downloaded' && (
                         <div className="flex items-center gap-2">
                             <CheckCircleIcon className="w-5 h-5 text-green-500" aria-label="تم التنزيل" />
                             <button onClick={handleDeleteQuranData} className="p-2 text-red-500 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors" aria-label="حذف بيانات القرآن">
                                 <TrashIcon className="w-5 h-5" />
                             </button>
                         </div>
                     )}
                </div>
                {quranDataStatus === 'downloading' && (
                    <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-1.5 mt-2 overflow-hidden">
                       <div className="bg-blue-500 h-1.5 rounded-full transition-all duration-300" style={{ width: `${quranDataProgress * 100}%` }}></div>
                    </div>
                )}
            </div>

            <h5 className="font-semibold text-sm mb-2 text-right">التلاوات الصوتية (أحجام كبيرة)</h5>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-2 border-r-2 border-transparent hover:border-slate-200 dark:hover:border-slate-700">
                {reciters.length === 0 && <p className="text-sm text-slate-500 text-center">جاري تحميل قائمة القراء...</p>}
                {reciters.map(reciter => {
                    const status = reciterStatuses[reciter.identifier] || 'none';
                    const progValue = reciterProgress[reciter.identifier] || 0;

                    return (
                        <div key={reciter.identifier} className="flex items-center justify-between p-2 bg-slate-100 dark:bg-slate-700/50 rounded-lg">
                            <span className="font-semibold text-sm">{reciter.name}</span>
                            {status === 'none' && (
                                <button onClick={() => handleDownloadReciter(reciter)} className="p-2 text-blue-600 dark:text-blue-400 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-full transition-colors" aria-label={`تنزيل ${reciter.name}`}>
                                    <ArrowDownTrayIcon className="w-5 h-5" />
                                </button>
                            )}
                            {status === 'downloading' && (
                                <div className="w-24 flex items-center gap-2" aria-live="polite">
                                    <div className="w-full bg-slate-300 dark:bg-slate-600 rounded-full h-2 overflow-hidden">
                                        <div className="bg-blue-500 h-2 rounded-full transition-all duration-300" style={{ width: `${progValue * 100}%` }}></div>
                                    </div>
                                    <span className="text-xs font-mono">{Math.round(progValue * 100)}%</span>
                                </div>
                            )}
                            {status === 'downloaded' && (
                                <div className="flex items-center gap-2">
                                    <CheckCircleIcon className="w-5 h-5 text-green-500" aria-label="تم التنزيل" />
                                    <button onClick={() => handleDeleteReciter(reciter)} className="p-2 text-red-500 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-full transition-colors" aria-label={`حذف ${reciter.name}`}>
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};