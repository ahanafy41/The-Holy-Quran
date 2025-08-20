

import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { XMarkIcon, ArrowDownTrayIcon } from './Icons';
import { SettingSelect } from './SettingSelect';
import { OfflineManager } from './OfflineManager';
import { ManualInstallInstructions } from './ManualInstallInstructions';

export const SettingsModal: React.FC<{onClose: () => void}> = ({ onClose }) => {
    const { settings, updateSettings, reciters, tafsirInfoList, apiKey, updateApiKey, isStandalone, canInstall, triggerInstall } = useApp();
    const modalRef = useRef<HTMLDivElement>(null);
    const [localApiKey, setLocalApiKey] = useState(apiKey || '');

    const handleSaveAndClose = () => {
        updateApiKey(localApiKey);
        onClose();
    };
    
    useFocusTrap(modalRef, handleSaveAndClose);

    const modalAnimation = {
        initial: {scale: 0.95, opacity: 0},
        animate: {scale: 1, opacity: 1},
        exit: {scale: 0.95, opacity: 0}
    };
    
    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={handleSaveAndClose}>
            <motion.div ref={modalRef} {...modalAnimation}
             onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] flex flex-col" role="dialog" aria-modal="true" aria-labelledby="settings-title">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                    <h3 id="settings-title" className="font-bold text-lg">الإعدادات</h3>
                    <button onClick={handleSaveAndClose} aria-label="Close settings" className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"><XMarkIcon className="w-5 h-5" /></button>
                </div>
                <div className="p-6 space-y-6 overflow-y-auto text-right">
                     {!isStandalone && (
                        <div className="pb-6 border-b border-slate-200 dark:border-slate-700">
                            <h4 className="font-medium mb-3">تثبيت التطبيق</h4>
                            {canInstall ? (
                                <>
                                    <button
                                        onClick={() => {
                                            triggerInstall();
                                            onClose();
                                        }}
                                        className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-green-600 text-white rounded-lg shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-slate-800 transition-colors"
                                    >
                                        <ArrowDownTrayIcon className="w-6 h-6" />
                                        <span className="font-semibold">تثبيت التطبيق على الجهاز</span>
                                    </button>
                                     <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 text-center">
                                        احصل على تجربة استخدام أفضل ووصول أسرع للتطبيق من شاشتك الرئيسية.
                                    </p>
                                </>
                            ) : (
                                <ManualInstallInstructions />
                            )}
                        </div>
                    )}
                     <SettingSelect id="reciter" label="القارئ" value={settings.reciter} onChange={(e) => updateSettings({ reciter: e.target.value })}>
                        {reciters.map(r => <option key={r.identifier} value={r.identifier}>{r.name}</option>)}
                     </SettingSelect>
                     <SettingSelect id="tafsir" label="التفسير" value={settings.tafsir} onChange={(e) => updateSettings({ tafsir: e.target.value })}>
                        {tafsirInfoList.map(t => <option key={t.identifier} value={t.identifier}>{t.name}</option>)}
                     </SettingSelect>

                     <OfflineManager />

                     <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
                        <h4 className="font-medium mb-3">إعدادات الذكاء الاصطناعي</h4>
                        <div className="space-y-2">
                            <label htmlFor="apiKey" className="block text-sm font-medium">مفتاح Gemini API</label>
                            <input
                                type="password"
                                id="apiKey"
                                value={localApiKey}
                                onChange={(e) => setLocalApiKey(e.target.value)}
                                placeholder="أدخل مفتاحك هنا"
                                className="w-full p-2.5 rounded-md bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-green-500 ltr-input"
                                dir="ltr"
                            />
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                مفتاح API الخاص بك يُحفظ محلياً في متصفحك فقط.
                                <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-green-600 dark:text-green-500 hover:underline">
                                    {' '}الحصول على مفتاح
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
                 <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 text-left">
                    <button onClick={handleSaveAndClose} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-slate-800">تم</button>
                </div>
            </motion.div>
        </div>
    );
};
