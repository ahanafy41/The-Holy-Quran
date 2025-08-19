
import React, { useEffect } from 'react';
import { XMarkIcon, CheckCircleIcon } from './Icons';
import { motion } from 'framer-motion';


interface SuccessToastProps {
    message: string;
    onClose: () => void;
    duration?: number;
}

const MotionDiv = motion.div;

export const SuccessToast: React.FC<SuccessToastProps> = ({ message, onClose, duration = 4000 }) => {
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
            role="status"
            aria-live="polite"
            className="fixed bottom-24 md:bottom-4 right-4 z-[100] p-4 max-w-sm w-full bg-green-600 text-white rounded-xl shadow-2xl flex items-center justify-between gap-4"
        >
            <CheckCircleIcon className="w-6 h-6 flex-shrink-0" />
            <span className="flex-grow font-semibold text-right">{message}</span>
            <button
                onClick={onClose}
                className="p-1 -mr-2 rounded-full hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-white flex-shrink-0"
                aria-label="إغلاق الإشعار"
            >
                <XMarkIcon className="w-5 h-5" />
            </button>
        </MotionDiv>
    );
};
