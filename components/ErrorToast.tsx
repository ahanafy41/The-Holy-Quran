
import React, { useEffect } from 'react';
import { XMarkIcon } from './Icons';
import { motion } from 'framer-motion';


/**
 * @interface ErrorToastProps
 * @description Defines the props for the ErrorToast component.
 */
interface ErrorToastProps {
    /** The error message to be displayed. */
    message: string;
    /** A callback function to be invoked when the toast should be closed. */
    onClose: () => void;
    /** The duration in milliseconds for which the toast should be visible. Defaults to 6000. */
    duration?: number;
}

/**
 * `ErrorToast` is a component that displays an error message in a toast notification.
 * The toast appears with an animation, stays on screen for a specified duration,
 * and then automatically calls the `onClose` callback to dismiss itself.
 *
 * @component
 * @param {ErrorToastProps} props - The props for the component.
 * @returns {React.ReactElement} A toast notification for displaying errors.
 */
export const ErrorToast: React.FC<ErrorToastProps> = ({ message, onClose, duration = 6000 }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);
        return () => clearTimeout(timer);
    }, [onClose, duration]);

    const toastAnimation = {
        initial: { opacity: 0, y: 50, scale: 0.3 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: 20, scale: 0.5 },
    };

    return (
        <motion.div
            {...toastAnimation}
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
        </motion.div>
    );
};
