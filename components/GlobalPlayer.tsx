import React from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { PlayIcon, PauseIcon, PreviousIcon, NextIcon, CloseIcon } from './Icons';

export const GlobalPlayer: React.FC = () => {
    const {
        globalPlayer,
        playlist,
        currentPlaylistItem,
        isGlobalPlayerPlaying,
        toggleGlobalPlayer,
        playNextInPlaylist,
        playPrevInPlaylist,
        closeGlobalPlayer
    } = useApp();

    if (!globalPlayer.show || !currentPlaylistItem) {
        return null;
    }

    const surah = currentPlaylistItem.surah;
    const currentIndex = playlist.findIndex(item => item.number === currentPlaylistItem.number);
    const isFirst = currentIndex === 0;
    const isLast = currentIndex === playlist.length - 1;

    return (
        <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'tween', ease: 'easeInOut', duration: 0.3 }}
            className="fixed bottom-0 left-0 right-0 z-40"
        >
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-lg-top p-4">
                <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate text-green-600 dark:text-green-400">
                           {surah ? `سورة ${surah.name}` : 'تحميل...'}
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                           الآية {currentPlaylistItem.numberInSurah}
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={playPrevInPlaylist}
                            aria-label="السابق"
                            className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 transition-colors"
                            disabled={isFirst}
                        >
                            <PreviousIcon className="w-6 h-6"/>
                        </button>
                        <button
                            onClick={toggleGlobalPlayer}
                            aria-label={isGlobalPlayerPlaying ? 'إيقاف مؤقت' : 'تشغيل'}
                            className="w-12 h-12 p-2 rounded-full bg-green-600 text-white hover:bg-green-700 transition flex items-center justify-center"
                        >
                            {isGlobalPlayerPlaying ? <PauseIcon className="w-7 h-7"/> : <PlayIcon className="w-7 h-7"/>}
                        </button>
                        <button
                            onClick={playNextInPlaylist}
                            aria-label="التالي"
                            className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 transition-colors"
                            disabled={isLast}
                        >
                            <NextIcon className="w-6 h-6"/>
                        </button>
                    </div>

                    <div className="flex-1 flex justify-end">
                         <button
                            onClick={closeGlobalPlayer}
                            aria-label="إغلاق المشغل"
                            className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        >
                            <CloseIcon className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
