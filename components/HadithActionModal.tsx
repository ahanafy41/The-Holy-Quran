import React, { useState } from 'react';
import FocusTrap from 'focus-trap-react';
import { Hadith } from '../types';
import { useApp } from '../context/AppContext';
import { SparklesIcon, XMarkIcon } from './Icons';

/**
 * @interface HadithActionModalProps
 * @description Defines the props for the HadithActionModal component.
 */
interface HadithActionModalProps {
    /** The Hadith object for which the actions are being displayed. */
    hadith: Hadith;
    /** The name of the book the hadith belongs to. */
    bookName: string;
    /** A callback function to be invoked when the modal should be closed. */
    onClose: () => void;
}

/**
 * `HadithActionModal` is a component that presents a modal dialog with a menu of actions
 * that can be performed on a selected hadith.
 *
 * @component
 * @param {HadithActionModalProps} props - The props for the component.
 * @returns {React.ReactElement} A modal dialog with actions for a specific hadith.
 */
export const HadithActionModal: React.FC<HadithActionModalProps> = ({ hadith, bookName, onClose }) => {
    const { showAIAssistant } = useApp();
    const [isFocusTrapActive, setIsFocusTrapActive] = useState(false);

    React.useEffect(() => {
        const timer = setTimeout(() => {
            setIsFocusTrapActive(true);
        }, 50);
        return () => clearTimeout(timer);
    }, []);

    const handleExplain = () => {
        showAIAssistant({
            text: hadith.arabic,
            title: `كتاب ${bookName} - الحديث رقم ${hadith.idInBook}`,
            type: 'hadith',
        });
        onClose();
    };

    const menuItems = [
        { label: 'اشرح بالذكاء الاصطناعي', icon: SparklesIcon, action: handleExplain },
    ];

    return (
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
                    aria-labelledby="hadith-action-title"
                    aria-describedby="hadith-action-desc"
                >
                    <header className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center flex-shrink-0">
                        <h2 id="hadith-action-title" className="font-bold text-lg">
                            {`كتاب ${bookName} - الحديث رقم ${hadith.idInBook}`}
                        </h2>
                        <button onClick={onClose} aria-label="إغلاق" className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
                            <XMarkIcon className="w-5 h-5" />
                        </button>
                    </header>

                    <div className="p-6 overflow-y-auto space-y-6 text-right">
                        <p id="hadith-action-desc" className="font-serif text-lg leading-loose bg-slate-100 dark:bg-slate-700/50 p-4 rounded-md">
                            {hadith.arabic}
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {menuItems.map((item) => (
                                <button
                                    key={item.label}
                                    onClick={item.action}
                                    className="w-full flex items-center justify-start text-right gap-3 p-3 rounded-lg text-md font-medium transition-colors bg-slate-50 hover:bg-slate-100 dark:bg-slate-700/50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-slate-800"
                                >
                                    <item.icon className="w-6 h-6 text-green-500" />
                                    <span>{item.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </FocusTrap>
        </div>
    );
};