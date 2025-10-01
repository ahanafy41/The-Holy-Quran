
import { useEffect, useRef } from 'react';

/**
 * A custom hook to trap focus within a designated HTML element.
 * It also provides a way to close the element (e.g., a modal) by pressing the Escape key.
 * When the component unmounts, focus is returned to the element that originally triggered the focus trap.
 *
 * @param {React.RefObject<HTMLElement>} ref - A ref to the container element that should trap focus.
 * @param {() => void} onClose - A callback function to be invoked when the 'Escape' key is pressed.
 */
export const useFocusTrap = (ref: React.RefObject<HTMLElement>, onClose: () => void) => {
    const triggerRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        triggerRef.current = document.activeElement as HTMLElement;
        const focusableElements = ref.current?.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements?.[0];
        firstElement?.focus();

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'Tab' && ref.current) {
                const elements = Array.from(focusableElements || []);
                if (elements.length === 0) return;
                const first = elements[0];
                const last = elements[elements.length - 1];
                if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); } 
                else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            triggerRef.current?.focus();
        };
    }, [ref, onClose]);
};
