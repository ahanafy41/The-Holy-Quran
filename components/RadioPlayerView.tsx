
import React, { useState, useEffect, useRef } from 'react';
import { RadioStation } from '../types';
import { useApp } from '../context/AppContext';
import { ArrowRightIcon, PauseIcon, PlayIcon, SpeakerWaveIcon, SpeakerXMarkIcon } from './Icons';
import { Spinner } from './Spinner';

const AudioVisualizer: React.FC<{ isPlaying: boolean }> = ({ isPlaying }) => {
    return (
        <div className={`flex justify-center items-center h-24 space-x-2 ${isPlaying ? 'playing' : ''}`}>
            {Array.from({ length: 5 }).map((_, i) => (
                <style key={i}>{`
                    .bar-${i} { animation-delay: ${i * 150}ms; }
                `}</style>
            ))}
             <div className="bar bar-0 w-3 h-4 bg-green-500 rounded-full"></div>
             <div className="bar bar-1 w-3 h-10 bg-green-500 rounded-full"></div>
             <div className="bar bar-2 w-3 h-20 bg-green-500 rounded-full"></div>
             <div className="bar bar-3 w-3 h-10 bg-green-500 rounded-full"></div>
             <div className="bar bar-4 w-3 h-4 bg-green-500 rounded-full"></div>
             <style>{`
                @keyframes sound {
                    0% { height: 0.25rem; }
                    50% { height: 5rem; }
                    100% { height: 0.25rem; }
                }
                .bar {
                    animation: sound 1.2s ease-in-out infinite;
                    animation-play-state: paused;
                }
                .playing .bar {
                    animation-play-state: running;
                }
             `}</style>
        </div>
    );
};

export const RadioPlayerView: React.FC<{ station: RadioStation, onBack: () => void }> = ({ station, onBack }) => {
    const { pauseAyah: pauseGlobalPlayer } = useApp();
    
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isMuted, setIsMuted] = useState(false);

    const audioRef = useRef<HTMLAudioElement>(null);
    const titleRef = useRef<HTMLHeadingElement>(null);

    useEffect(() => {
        const timer = setTimeout(() => titleRef.current?.focus(), 100);
        pauseGlobalPlayer();
        const stopThisPlayer = () => audioRef.current?.pause();
        window.addEventListener('global-player-stop', stopThisPlayer);
        
        return () => {
            clearTimeout(timer);
            window.removeEventListener('global-player-stop', stopThisPlayer);
        }
    }, [pauseGlobalPlayer]);

    useEffect(() => {
        if (!audioRef.current || !station) return;
        
        audioRef.current.src = station.url;
        setIsLoading(true);
        audioRef.current.play().catch(e => {
            console.warn("Autoplay was prevented.", e);
            setIsPlaying(false);
            setIsLoading(false);
        });

    }, [station]);

    const handlePlayPause = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            // For live streams, it's sometimes better to reload the source
            // to ensure it connects correctly after a pause.
            audioRef.current.load(); 
            audioRef.current.play();
            setIsLoading(true);
        }
    };
    
    const handleMuteToggle = () => {
        if (audioRef.current) {
            audioRef.current.muted = !audioRef.current.muted;
            setIsMuted(audioRef.current.muted);
        }
    };
    
    return (
        <div>
            <audio
                ref={audioRef}
                onPlay={() => { setIsPlaying(true); setIsLoading(false); }}
                onPause={() => setIsPlaying(false)}
                onWaiting={() => setIsLoading(true)}
                onCanPlay={() => setIsLoading(false)}
                onError={(e) => {
                    console.error("Audio Error:", e);
                    setIsLoading(false);
                    setIsPlaying(false);
                }}
                preload="auto"
            />
             <header className="mb-4">
                <div className="flex items-center gap-4 mb-2">
                    <button onClick={onBack} aria-label="الرجوع" className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                        <ArrowRightIcon className="w-6 h-6 transform -scale-x-100" />
                    </button>
                    <h1 ref={titleRef} tabIndex={-1} className="text-2xl font-bold focus:outline-none">الراديو</h1>
                </div>
            </header>

            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 space-y-4">
                <div className="text-center py-8">
                    <h2 className="text-xl font-bold mb-4">{station.name}</h2>
                    <AudioVisualizer isPlaying={isPlaying && !isLoading} />
                </div>
                
                <div className="flex items-center justify-center gap-4">
                    <button onClick={handleMuteToggle} aria-label={isMuted ? 'إلغاء كتم الصوت' : 'كتم الصوت'} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-500">
                        {isMuted ? <SpeakerXMarkIcon className="w-8 h-8"/> : <SpeakerWaveIcon className="w-8 h-8"/>}
                    </button>
                    <button onClick={handlePlayPause} aria-label={isPlaying ? 'إيقاف' : 'تشغيل'} className="w-20 h-20 p-3 rounded-full bg-green-600 text-white hover:bg-green-700 transition mx-2 flex items-center justify-center">
                        {isLoading ? <Spinner /> : (isPlaying ? <PauseIcon className="w-10 h-10"/> : <PlayIcon className="w-10 h-10"/>)}
                    </button>
                    <div className="w-12 h-12" /> {/* Spacer */}
                </div>
            </div>
        </div>
    );
};
