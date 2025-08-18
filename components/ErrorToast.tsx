
import React, { useEffect } from 'react';
import { XMarkIcon } from './Icons';
import { motion } from 'framer-motion';


interface ErrorToastProps {
    message: string;
    onClose: () => void;
    duration?: number;
}

const MotionDiv = motion("div");

export const ErrorToast: React.FC<ErrorToastProps> = ({ message, onClose, duration = 6000 }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);
        return () => clearTimeout(timer);
    }, [onClose, duration]);

    return (
        <MotionDiv
            layout
            initial={{ opacity: 0, y: 50, scale: 0.3 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.5 }}
            role="alert"
            aria-live="assertive"
            className="fixed bottom-24 md:bottom-4 right-4 z-[100] p-4 max-w-sm w-full bg-red-600 text-white rounded-xl shadow-2xl flex items-start justify-between gap-4"
        >
            <span className="flex-grow font-semibold">{message}</span>
            <button
                onClick={onClose}
                className="p-1 -mr-2 -mt-2 rounded-full hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-white flex-shrink-0"
                aria-label="إغلاق رسالة الخطأ"
            >
                <XMarkIcon className="w-5 h-5" />
            </button>
        </MotionDiv>
    );
};
