import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Ayah } from '../types';
import { useApp } from '../context/AppContext';
import { ArrowRightIcon, PauseIcon, PlayIcon, PreviousIcon, NextIcon } from './Icons';
import { Spinner } from './Spinner';

interface Playlist {
    title: string;
    ayahs: Ayah[];
};

export const ListenPlayerView: React.FC<{ playlist: Playlist, onBack: () => void }> = ({ playlist, onBack }) => {
    const { setError, pauseAyah: pauseGlobalPlayer } = useApp();
    const { ayahs, title } = playlist;
    
    // Player state
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [currentAyahIndex, setCurrentAyahIndex] = useState(0);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);

    const audioRef = useRef<HTMLAudioElement>(null);
    const activeAyahRef = useRef<HTMLDivElement>(null);
    const currentSourcesRef = useRef<{ sources: string[], index: number }>({ sources: [], index: 0 });

    // Stop other players when this component mounts
    useEffect(() => {
        pauseGlobalPlayer();
        const stopThisPlayer = () => audioRef.current?.pause();
        window.addEventListener('global-player-stop', stopThisPlayer);
        return () => window.removeEventListener('global-player-stop', stopThisPlayer);
    }, [pauseGlobalPlayer]);

    const playNextAyah = useCallback(() => {
        setCurrentAyahIndex(prevIndex => {
            if (prevIndex < ayahs.length - 1) {
                return prevIndex + 1;
            }
            setIsPlaying(false); // End of playlist
            return prevIndex;
        });
    }, [ayahs.length]);
    
    const loadAndPlay = useCallback((ayah: Ayah) => {
        if (!audioRef.current) return;

        const sources = [ayah.audio, ...(ayah.audioSecondarys || [])].filter(Boolean);
        if (sources.length === 0) {
            setError(`لا توجد مصادر صوتية للآية ${ayah.numberInSurah}.`);
            playNextAyah();
            return;
        }

        currentSourcesRef.current = { sources, index: 0 };
        audioRef.current.src = sources[0];
        setIsLoading(true);
        audioRef.current.play().catch(e => {
            console.warn("Autoplay was prevented. User may need to interact first.", e);
            setIsPlaying(false); // Update UI to show play button if autoplay fails
        });

    }, [playNextAyah, setError]);

    // Main effect to handle playback when index changes
    useEffect(() => {
        if (currentAyahIndex >= 0 && currentAyahIndex < ayahs.length) {
            const ayahToPlay = ayahs[currentAyahIndex];
            loadAndPlay(ayahToPlay);
        }
    }, [currentAyahIndex, ayahs, loadAndPlay]);

    // Effect to scroll active ayah into view
    useEffect(() => {
      activeAyahRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, [currentAyahIndex]);

    const handleError = () => {
        const { sources, index } = currentSourcesRef.current;
        const nextIndex = index + 1;
        if (audioRef.current && nextIndex < sources.length) {
            // Try next source
            currentSourcesRef.current.index = nextIndex;
            audioRef.current.src = sources[nextIndex];
            audioRef.current.play();
        } else {
            // All sources failed for this ayah
            const currentAyah = ayahs[currentAyahIndex];
            setError(`فشل تحميل صوت الآية ${currentAyah.numberInSurah}. سيتم تخطيها.`);
            // Use a short timeout to allow the error toast to appear before skipping
            setTimeout(playNextAyah, 500); 
        }
    };
    
    // Player controls
    const handlePlayPause = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
    };
    const handleNext = () => {
       if (currentAyahIndex < ayahs.length - 1) setCurrentAyahIndex(currentAyahIndex + 1);
    };
    const handlePrevious = () => {
       if (currentAyahIndex > 0) setCurrentAyahIndex(currentAyahIndex - 1);
    };

    const handleSeek = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (audioRef.current) {
            const newTime = Number(event.target.value);
            audioRef.current.currentTime = newTime;
            setProgress(newTime);
        }
    };

    const formatTime = (secs: number) => {
        const minutes = Math.floor(secs / 60) || 0;
        const seconds = Math.floor(secs - minutes * 60) || 0;
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    if (ayahs.length === 0) {
         return (
            <div className="text-center p-8">
                <p>لا يوجد آيات في قائمة التشغيل هذه.</p>
                <button onClick={onBack} className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg">الرجوع</button>
            </div>
        );
    }
    
    return (
        <div className="flex flex-col h-[calc(100vh-8rem)]">
             <audio
                ref={audioRef}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={playNextAyah}
                onLoadedData={() => {
                    if (audioRef.current) {
                        setDuration(audioRef.current.duration);
                        setIsLoading(false);
                    }
                }}
                onTimeUpdate={() => {
                    if (audioRef.current) setProgress(audioRef.current.currentTime);
                }}
                onError={handleError}
                preload="auto"
            />
             <header className="flex items-center gap-4 mb-4 flex-shrink-0">
                <button onClick={onBack} aria-label="الرجوع للاختيار" className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                    <ArrowRightIcon className="w-6 h-6 transform -scale-x-100" />
                </button>
                <div>
                     <h1 className="text-2xl font-bold">{title}</h1>
                     <p className="text-slate-600 dark:text-slate-400">{ayahs.length} آيات</p>
                </div>
            </header>
            
            <div className="flex-grow overflow-y-auto space-y-1 pr-2">
                {ayahs.map((ayah, index) => {
                    const isActive = index === currentAyahIndex;
                    return (
                        <div 
                          key={ayah.number}
                          ref={isActive ? activeAyahRef : null}
                          className={`p-4 rounded-xl transition-colors duration-300 relative ${
                            isActive ? 'bg-green-100 dark:bg-green-500/10 text-green-800 dark:text-green-200' : 'text-slate-700 dark:text-slate-300'
                          }`}
                        >
                           <p dir="rtl" className="font-quran text-3xl leading-loose text-right">
                                {ayah.text}
                                <span className={`font-mono text-xl transition-colors ${isActive ? 'text-green-500' : 'text-slate-400'}`}> ({ayah.numberInSurah})</span>
                           </p>
                        </div>
                    );
                })}
            </div>
            
            <div className="flex-shrink-0 bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-4 mt-4">
                 <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-mono">{formatTime(progress)}</span>
                    <input
                        type="range"
                        min="0"
                        max={duration || 1}
                        value={progress}
                        onChange={handleSeek}
                        className="w-full h-2 bg-slate-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-green-600 [&::-webkit-slider-thumb]:rounded-full"
                        aria-label="Seek audio"
                    />
                    <span className="text-xs font-mono">{formatTime(duration)}</span>
                 </div>
                <div className="flex items-center justify-center gap-4">
                     <button onClick={handlePrevious} aria-label="السابق" className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 transition-colors" disabled={currentAyahIndex === 0}><PreviousIcon className="w-6 h-6"/></button>
                    <button onClick={handlePlayPause} aria-label={isPlaying ? 'إيقاف مؤقت' : 'تشغيل'} className="w-16 h-16 p-3 rounded-full bg-green-600 text-white hover:bg-green-700 transition mx-2 disabled:bg-slate-400 flex items-center justify-center" disabled={isLoading}>
                        {isLoading ? <Spinner /> : (isPlaying ? <PauseIcon className="w-8 h-8"/> : <PlayIcon className="w-8 h-8"/>)}
                    </button>
                    <button onClick={handleNext} aria-label="التالي" className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 transition-colors" disabled={currentAyahIndex === ayahs.length - 1}><NextIcon className="w-6 h-6"/></button>
                </div>
            </div>
        </div>
    );
};
