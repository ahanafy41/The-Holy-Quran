
import React, { useState, useEffect, useRef } from 'react';
import { SurahSimple, ListeningReciter } from '../types';
import { useApp } from '../context/AppContext';
import { ArrowRightIcon, PauseIcon, PlayIcon, PreviousIcon, NextIcon } from './Icons';
import { Spinner } from './Spinner';

interface ListenPlayerViewProps {
    reciter: ListeningReciter;
    surah: SurahSimple;
    onBack: () => void;
    onTrackChange: (direction: 'next' | 'prev') => void;
    isFirst: boolean;
    isLast: boolean;
};

export const ListenPlayerView: React.FC<ListenPlayerViewProps> = ({ reciter, surah, onBack, onTrackChange, isFirst, isLast }) => {
    const { pauseAyah: pauseGlobalPlayer } = useApp();
    
    // Player state
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);

    const audioRef = useRef<HTMLAudioElement>(null);
    const titleRef = useRef<HTMLHeadingElement>(null);

    // Stop other players when this component mounts and manage focus
    useEffect(() => {
        const timer = setTimeout(() => {
            titleRef.current?.focus();
        }, 100);

        pauseGlobalPlayer();
        const stopThisPlayer = () => audioRef.current?.pause();
        window.addEventListener('global-player-stop', stopThisPlayer);
        
        return () => {
            clearTimeout(timer);
            window.removeEventListener('global-player-stop', stopThisPlayer);
        }
    }, [pauseGlobalPlayer]);

    // Main effect to handle playback when track changes
    useEffect(() => {
        if (!audioRef.current || !reciter || !surah) return;
        
        const paddedSurah = String(surah.number).padStart(3, '0');
        const audioUrl = `${reciter.server}/${paddedSurah}.mp3`;
        
        audioRef.current.src = audioUrl;
        setIsLoading(true);
        audioRef.current.play().catch(e => {
            console.warn("Autoplay was prevented.", e);
            setIsPlaying(false);
        });

    }, [reciter, surah]);

    // Player controls
    const handlePlayPause = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
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
    
    return (
        <div>
            <audio
                ref={audioRef}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => onTrackChange('next')}
                onLoadedData={() => {
                    if (audioRef.current) {
                        setDuration(audioRef.current.duration);
                        setIsLoading(false);
                    }
                }}
                onTimeUpdate={() => {
                    if (audioRef.current) setProgress(audioRef.current.currentTime);
                }}
                onError={(e) => {
                    console.error("Audio Error:", e);
                    setIsLoading(false);
                }}
                preload="auto"
            />
             <header className="mb-4">
                <div className="flex items-center gap-4 mb-2">
                    <button onClick={onBack} aria-label="الرجوع" className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                        <ArrowRightIcon className="w-6 h-6 transform -scale-x-100" />
                    </button>
                    <h1 ref={titleRef} tabIndex={-1} className="text-2xl font-bold focus:outline-none">{`سورة ${surah.name}`}</h1>
                </div>
                 <p className="text-slate-600 dark:text-slate-400 mr-14">{reciter.name} - {reciter.rewaya}</p>
            </header>

            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 space-y-4">
                <div className="text-center py-16">
                    <p className="font-quran text-6xl">{surah.name}</p>
                </div>
                 <div className="flex items-center gap-2">
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
                    <button onClick={() => onTrackChange('prev')} aria-label="السابق" className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 transition-colors" disabled={isFirst}><PreviousIcon className="w-8 h-8"/></button>
                    <button onClick={handlePlayPause} aria-label={isPlaying ? 'إيقاف مؤقت' : 'تشغيل'} className="w-20 h-20 p-3 rounded-full bg-green-600 text-white hover:bg-green-700 transition mx-2 disabled:bg-slate-400 flex items-center justify-center" disabled={isLoading}>
                        {isLoading ? <Spinner /> : (isPlaying ? <PauseIcon className="w-10 h-10"/> : <PlayIcon className="w-10 h-10"/>)}
                    </button>
                    <button onClick={() => onTrackChange('next')} aria-label="التالي" className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 transition-colors" disabled={isLast}><NextIcon className="w-8 h-8"/></button>
                </div>
            </div>
        </div>
    );
};