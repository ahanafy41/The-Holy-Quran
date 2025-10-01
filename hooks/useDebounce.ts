
import { useState, useEffect } from 'react';

/**
 * Custom hook that debounces a value.
 *
 * @template T The type of the value to debounce.
 * @param {T} value The value to be debounced.
 * @param {number} delay The delay in milliseconds before the value is updated.
 * @returns {T} The debounced value.
 */
export const useDebounce = <T,>(value: T, delay: number): T => {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
};
