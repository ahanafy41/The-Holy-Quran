
import { useEffect, useRef } from 'react';

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
