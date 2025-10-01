
import React, { useEffect } from 'react';
import { XMarkIcon, CheckCircleIcon } from './Icons';
import { motion } from 'framer-motion';


/**
 * @interface SuccessToastProps
 * @description Defines the props for the SuccessToast component.
 */
interface SuccessToastProps {
    /** The success message to be displayed. */
    message: string;
    /** A callback function to be invoked when the toast should be closed. */
    onClose: () => void;
    /** The duration in milliseconds for which the toast should be visible. Defaults to 4000. */
    duration?: number;
}

/**
 * `SuccessToast` is a component that displays a success message in a toast notification.
 * The toast appears with an animation, stays on screen for a specified duration,
 * and then automatically calls the `onClose` callback to dismiss itself.
 *
 * @component
 * @param {SuccessToastProps} props - The props for the component.
 * @returns {React.ReactElement} A toast notification for displaying success messages.
 */
export const SuccessToast: React.FC<SuccessToastProps> = ({ message, onClose, duration = 4000 }) => {
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
        </motion.div>
    );
};
