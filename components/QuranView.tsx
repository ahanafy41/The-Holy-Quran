
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Ayah } from '../types';
import { useApp } from '../context/AppContext';
import { AyahActionModal } from './AyahActionModal';
import { AyahItem } from './AyahItem';
import { Spinner } from './Spinner';
import { ArrowRightIcon } from './Icons';
import { QuranReaderControls } from './QuranReaderControls';


/**
 * `QuranView` is the main component for displaying the text of a single Surah.
 * It handles rendering the list of ayahs, managing interactions like selection,
 * scrolling to a specific ayah, and automatically tracking the user's last read position.
 *
 * @component
 * @example
 * return <QuranView />
 */
export const QuranView: React.FC = () => {
    const { currentSurah, isLoading, error, targetAyah, setTargetAyah, navigateTo, updateLastReadPosition } = useApp();

    /** State to hold the currently selected ayah, which triggers the action modal. */
    const [selectedAyah, setSelectedAyah] = useState<Ayah | null>(null);
    /** State to temporarily highlight an ayah, e.g., when navigating from a search result. */
    const [highlightedAyah, setHighlightedAyah] = useState<number | null>(null);

    /** A ref to a map of ayah numbers to their corresponding DOM elements for direct access (e.g., for scrolling). */
    const ayahRefs = useRef<Map<number, HTMLDivElement>>(new Map());
    /** A ref to the surah title element for setting focus on navigation. */
    const titleRef = useRef<HTMLHeadingElement>(null);
    /** A ref to the IntersectionObserver instance used for tracking which ayah is on screen. */
    const observerRef = useRef<IntersectionObserver | null>(null);
    /** A ref to a timeout used to debounce the last-read position updates. */
    const lastReadTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        ayahRefs.current.clear();
    }, [currentSurah?.number]);

    useEffect(() => {
        // Set focus to the title when the surah changes, for accessibility.
        const timer = setTimeout(() => {
            titleRef.current?.focus();
        }, 100);
        return () => clearTimeout(timer);
    }, [currentSurah?.number]);

    /**
     * Sets the selected ayah, which will trigger the AyahActionModal to open.
     * @param {Ayah} ayah - The ayah that was selected by the user.
     */
    const handleAyahSelect = (ayah: Ayah) => {
        setSelectedAyah(ayah);
    };

    /**
     * Clears the selected ayah, closing the AyahActionModal.
     */
    const handleModalClose = () => {
        setSelectedAyah(null);
    };

    /**
     * The callback for the IntersectionObserver. It determines the topmost visible ayah
     * and, after a short delay, updates the global last-read position.
     * @param {IntersectionObserverEntry[]} entries - The list of observed entries.
     */
    const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
        if (lastReadTimeoutRef.current) {
            clearTimeout(lastReadTimeoutRef.current);
        }

        lastReadTimeoutRef.current = setTimeout(() => {
            const topEntry = entries.reduce((max, entry) => 
                (entry.intersectionRatio > max.intersectionRatio) ? entry : max, 
                entries[0]
            );

            if (topEntry && topEntry.isIntersecting && currentSurah) {
                const ayahNumber = parseInt(topEntry.target.getAttribute('data-ayah-number') || '0', 10);
                if (ayahNumber) {
                    updateLastReadPosition(currentSurah.number, ayahNumber);
                }
            }
        }, 500); // Debounce to avoid rapid updates

    }, [currentSurah, updateLastReadPosition]);

    useEffect(() => {
        if (observerRef.current) {
            observerRef.current.disconnect();
        }

        observerRef.current = new IntersectionObserver(handleIntersection, {
            root: null, // viewport
            rootMargin: '0px',
            threshold: 0.5 // Trigger when 50% of the element is visible
        });

        const observer = observerRef.current;
        ayahRefs.current.forEach(el => {
            if (el) observer.observe(el);
        });

        return () => {
            if (observer) {
                observer.disconnect();
            }
            if (lastReadTimeoutRef.current) {
                clearTimeout(lastReadTimeoutRef.current);
            }
        };
    }, [currentSurah, handleIntersection]);

    useEffect(() => {
        if (targetAyah && currentSurah) {
            const timeoutId = setTimeout(() => {
                const element = ayahRefs.current.get(targetAyah);
                if (element) {
                    element.scrollIntoView({ behavior: 'auto', block: 'center' });
                    setHighlightedAyah(targetAyah);
                    const timer = setTimeout(() => {
                        setHighlightedAyah(null);
                        setTargetAyah(null);
                    }, 2500);
                    return () => clearTimeout(timer);
                } else {
                     setTargetAyah(null);
                }
            }, 100);
            return () => clearTimeout(timeoutId);
        }
    }, [targetAyah, currentSurah, setTargetAyah]);

    if (isLoading && !currentSurah) {
        return <div className="text-center p-10 flex items-center justify-center gap-2"><Spinner/> جاري التحميل...</div>;
    }
    if (error && !currentSurah) {
        return <div className="text-center p-10 text-red-500" role="alert">{error}</div>;
    }
    if (!currentSurah) {
        return (
            <div className="text-center p-10">
                <p className="text-slate-500 mb-4">اختر سورة للبدء من الفهرس.</p>
                <button onClick={() => navigateTo('index')} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold">
                    الذهاب إلى الفهرس
                </button>
            </div>
        );
    }
    
    return (
        <div className="max-w-4xl mx-auto pb-24">
             <header className="mb-6 text-center sticky top-0 z-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md pt-4">
                <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6">
                    <button
                        onClick={() => window.history.back()}
                        className="absolute top-1/2 -translate-y-1/2 right-4 w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        aria-label="الرجوع"
                    >
                        <ArrowRightIcon className="w-6 h-6" />
                    </button>
                    <h2 ref={titleRef} tabIndex={-1} className="font-quran text-4xl md:text-5xl font-bold mb-2 focus:outline-none">{currentSurah.name}</h2>
                    <p className="text-lg text-slate-600 dark:text-slate-300">{currentSurah.englishName}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{currentSurah.revelationType} - {currentSurah.ayahs.length} آيات</p>
                </div>
            </header>
            <div className="space-y-1">
                {currentSurah.ayahs.map(ayah => (
                    <div key={ayah.number} data-ayah-number={ayah.numberInSurah} ref={(el) => {
                        if (el) ayahRefs.current.set(ayah.numberInSurah, el);
                        else ayahRefs.current.delete(ayah.numberInSurah);
                    }}>
                        <AyahItem 
                            ayah={ayah}
                            isSelected={selectedAyah?.number === ayah.number}
                            isHighlighted={highlightedAyah === ayah.numberInSurah}
                            onSelect={() => handleAyahSelect(ayah)}
                            layoutIdPrefix="quran"
                        />
                    </div>
                ))}
            </div>

            {selectedAyah && <AyahActionModal ayah={selectedAyah} onClose={handleModalClose} />}
            <QuranReaderControls />
        </div>
    );
};
