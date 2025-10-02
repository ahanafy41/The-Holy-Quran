
import React from 'react';
import { Ayah } from '../types';
import { useApp } from '../context/AppContext';

/**
 * @interface AyahItemProps
 * @description Props for the AyahItem component.
 */
interface AyahItemProps {
    /** The Ayah object containing the text and metadata. */
    ayah: Ayah;
    /** A boolean indicating if the ayah is currently selected, triggering the action modal. */
    isSelected: boolean;
    /** An optional boolean to indicate if the ayah should be visually highlighted (e.g., from a search result). */
    isHighlighted?: boolean;
    /** Callback function triggered when the user clicks or presses Enter/Space on the item. */
    onSelect: (event: React.MouseEvent<HTMLDivElement, MouseEvent> | React.KeyboardEvent<HTMLDivElement>) => void;
    /** A prefix for the layoutId to ensure unique animation IDs across different views where AyahItem might be used. */
    layoutIdPrefix: string;
}

/**
 * `AyahItemComponent` is a presentational component that displays a single Ayah (verse) of the Quran.
 * It handles different visual states: selected, highlighted, and currently playing.
 * It is memoized using `React.memo` to prevent unnecessary re-renders.
 * The component is also wrapped in `React.forwardRef` to allow parent components to get a ref to the underlying `div` element.
 *
 * @component
 * @param {AyahItemProps} props - The props for the component.
 * @param {React.Ref<HTMLDivElement>} ref - The forwarded ref.
 * @returns {React.ReactElement} A single ayah item.
 */
const AyahItemComponent = React.forwardRef<HTMLDivElement, AyahItemProps>(({ ayah, isSelected, isHighlighted, onSelect, layoutIdPrefix }, ref) => {
    const { activeAyah } = useApp();
    const isPlaying = activeAyah?.number === ayah.number;
    const descriptionId = `desc-${layoutIdPrefix}-${ayah.number}`;
    
    const ayahNumberCircle = (
        <div className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-sm font-mono bg-slate-100 dark:bg-slate-700/50 rounded-full group-hover:bg-green-100 dark:group-hover:bg-green-900/50 transition-colors">
            {ayah.numberInSurah}
        </div>
    );

    return (
        <div
            ref={ref}
            onClick={onSelect}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelect(e); }}
            tabIndex={0}
            role="button"
            aria-roledescription="Verse"
            className={`group p-4 rounded-xl transition-all duration-300 relative cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-500/50 dark:focus:ring-green-400/50 ${
                isSelected ? 'bg-green-50 dark:bg-green-500/10' :
                isHighlighted ? 'bg-yellow-100 dark:bg-yellow-400/10 ring-2 ring-yellow-400/50' :
                isPlaying ? 'bg-green-50 dark:bg-green-500/10' :
                'hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
        >
            {(isSelected || isPlaying) && (
                <div
                    className="absolute inset-0 ring-2 ring-green-500 rounded-xl pointer-events-none"
                />
            )}
            {ayahNumberCircle}
            <p dir="rtl" className="font-quran text-3xl md:text-4xl leading-loose text-right pr-14">
                {ayah.text}
            </p>
        </div>
    );
});

/**
 * A memoized version of the `AyahItemComponent` to optimize performance by preventing
 * unnecessary re-renders when props have not changed.
 */
export const AyahItem = React.memo(AyahItemComponent);