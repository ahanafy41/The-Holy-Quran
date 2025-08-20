import React, { useState, useEffect, useCallback, useRef } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { Ayah, SavedSection } from '../types';
import { useApp } from '../context/AppContext';
import { PlayIcon, PauseIcon, PreviousIcon, NextIcon, ArrowRightIcon } from './Icons';
import { SettingSelect as BaseSettingSelect } from './SettingSelect';

interface PlayerPlaylist {
    section: SavedSection;
    ayahs: Ayah[];
};

// A local, un-exported version of the SettingSelect component with a smaller label
const SettingSelect: React.FC<React.PropsWithChildren<{id: string; label: string; value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;}>> = ({id, label, children, ...props}) => (
    <div>
        <label htmlFor={id} className="block text-xs font-medium mb-1 text-slate-600 dark:text-slate-400">{label}</label>
        <select id={id} {...props} className="w-full p-2 rounded-md bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-green-500">
            {children}
        </select>
    </div>
);


export const MemorizationPlayerView: React.FC<{ playlist: PlayerPlaylist, onBack: () => void }> = ({ playlist, onBack }) => {
    console.log('[Mem DEBUG] MemorizationPlayerView component rendered.');
    const { setError } = useApp();
    const { ayahs, section } = playlist;

    // UI State
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentAyahIndex, setCurrentAyahIndex] = useState(0);
    const [repetitionCount, setRepetitionCount] = useState(1);
    
    // Settings State
    const [repetitions, setRepetitions] = useState(3);
    const [delay, setDelay] = useState(3); // seconds
    const [playbackRate, setPlaybackRate] = useState(1);
    
    // Refs
    const wavesurferRef = useRef<WaveSurfer | null>(null);
    const waveformContainerRef = useRef<HTMLDivElement>(null);
    const timeoutRef = useRef<number | undefined>(undefined);
    const repetitionCounterRef = useRef(1);
    
    // New refs for event-based error handling
    const audioSourcesRef = useRef<{ sources: string[], index: number }>({ sources: [], index: 0 });
    const currentAyahForErrorHandlerRef = useRef<Ayah | null>(null);
    
    const playAyah = useCallback((index: number) => {
        const ws = wavesurferRef.current;
        console.log(`[Mem DEBUG] playAyah called for index: ${index}.`);

        if (index < 0 || index >= ayahs.length || !ws) {
            console.warn(`[Mem DEBUG] Aborting playAyah: Invalid index or wavesurfer not ready. Index: ${index}, WS Ready: ${!!ws}`);
            setIsPlaying(false);
            return;
        }

        setCurrentAyahIndex(index);
        setRepetitionCount(1);
        repetitionCounterRef.current = 1;

        const ayah = ayahs[index];
        currentAyahForErrorHandlerRef.current = ayah;
        console.log(`[Mem DEBUG] Loading ayah: ${ayah.surah?.name} ${ayah.numberInSurah}`, ayah);
        const sources = [ayah.audio, ...(ayah.audioSecondarys || [])].filter(Boolean);
        console.log(`[Mem DEBUG] Audio sources for this ayah:`, sources);
        
        if (sources.length === 0) {
            const errorMsg = `لا توجد مصادر صوتية للآية ${ayah.numberInSurah}`;
            console.error(`[Mem DEBUG] ${errorMsg}`);
            setError(errorMsg);
            return;
        }
        
        audioSourcesRef.current = { sources: sources, index: 0 };
        console.log(`[Mem DEBUG] Attempting to load source 1/${sources.length}: ${sources[0]}`);
        ws.load(sources[0]);

    }, [ayahs, setError]);
    
    // Effect to create and destroy the WaveSurfer instance
    useEffect(() => {
        if (!waveformContainerRef.current) return;
        console.log('[Mem DEBUG] Initializing WaveSurfer instance.');

        const ws = WaveSurfer.create({
            container: waveformContainerRef.current,
            height: 60,
            waveColor: '#d4d4d8',
            progressColor: '#16a34a',
            barWidth: 2,
            barGap: 1,
            barRadius: 2,
            mediaControls: false,
        });
        wavesurferRef.current = ws;

        ws.on('play', () => {
            console.log('[Mem DEBUG] Event: play');
            setIsPlaying(true);
        });
        ws.on('pause', () => {
            console.log('[Mem DEBUG] Event: pause');
            setIsPlaying(false);
        });
        ws.on('ready', (duration) => { 
            console.log('[Mem DEBUG] Event: ready. Playing audio.');
            ws.play(); 
        });

        const onError = (err: Error) => {
            console.error('[Mem DEBUG] Event: error from WaveSurfer:', err);
            audioSourcesRef.current.index++;
            const { sources, index } = audioSourcesRef.current;
            if (index < sources.length) {
                console.warn(`[Mem DEBUG] Trying next source ${index + 1}/${sources.length}: ${sources[index]}`);
                ws.load(sources[index]);
            } else {
                const ayah = currentAyahForErrorHandlerRef.current;
                const errorMsg = `فشل تحميل الصوت للآية ${ayah?.numberInSurah}`;
                console.error(`[Mem DEBUG] ${errorMsg}`);
                setError(errorMsg);
                setIsPlaying(false);
            }
        };
        ws.on('error', onError);

        if (ayahs.length > 0) {
            console.log('[Mem DEBUG] Kickstarting playback, calling playAyah(0).');
            playAyah(0);
        }

        return () => {
            console.log('[Mem DEBUG] Destroying WaveSurfer instance.');
            clearTimeout(timeoutRef.current);
            ws.destroy();
        };
    }, [ayahs, playAyah, setError]);

    // Effect to manage the 'finish' event handler with fresh state
    useEffect(() => {
        const ws = wavesurferRef.current;
        if (!ws) return;

        const finishHandler = () => {
            console.log(`[Mem DEBUG] Event: finish. Repetition count: ${repetitionCounterRef.current}/${repetitions}`);
            clearTimeout(timeoutRef.current);
            if (repetitionCounterRef.current < repetitions) {
                console.log(`[Mem DEBUG] Repeating ayah after ${delay}s delay.`);
                timeoutRef.current = window.setTimeout(() => {
                    ws.play(0);
                }, delay * 1000);
                repetitionCounterRef.current += 1;
                setRepetitionCount(c => c + 1);
            } else {
                const nextIndex = currentAyahIndex + 1;
                if (nextIndex < ayahs.length) {
                    console.log(`[Mem DEBUG] Moving to next ayah after ${delay}s delay. Index: ${nextIndex}`);
                    timeoutRef.current = window.setTimeout(() => {
                        playAyah(nextIndex);
                    }, delay * 1000);
                } else {
                    console.log('[Mem DEBUG] End of memorization playlist.');
                    setIsPlaying(false); // End of playlist
                }
            }
        };

        ws.on('finish', finishHandler);

        return () => {
            ws.un('finish', finishHandler);
        };
    }, [repetitions, delay, currentAyahIndex, ayahs.length, playAyah]);
    
    useEffect(() => {
        wavesurferRef.current?.setPlaybackRate(playbackRate);
    }, [playbackRate]);

    const handlePlayPause = () => wavesurferRef.current?.playPause();
    const handleNext = () => {
        if(currentAyahIndex < ayahs.length - 1) playAyah(currentAyahIndex + 1);
    }
    const handlePrevious = () => {
        if(currentAyahIndex > 0) playAyah(currentAyahIndex - 1);
    }

    const currentAyah = ayahs[currentAyahIndex];
    
    return (
        <div className="flex flex-col h-[calc(100vh-8rem)]">
             <header className="flex items-center gap-4 mb-4 flex-shrink-0">
                <button onClick={onBack} aria-label="الرجوع للاختيار" className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                    <ArrowRightIcon className="w-6 h-6 transform -scale-x-100" />
                </button>
                <div>
                     <h1 className="text-2xl font-bold">{section.name}</h1>
                     <p className="text-slate-600 dark:text-slate-400">الآية {currentAyahIndex + 1} من {ayahs.length} | التكرار {repetitionCount} من {repetitions}</p>
                </div>
            </header>
            
            <div className="flex-grow flex flex-col justify-center p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-inner">
                 <p dir="rtl" className="font-quran text-4xl md:text-5xl text-center mb-auto pt-8">
                     {currentAyah?.text}
                 </p>
                 <div ref={waveformContainerRef} className="w-full mt-auto pb-4" />
             </div>
            
            <div className="flex-shrink-0 bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-4 mt-4 space-y-4">
                 <div className="flex items-center justify-center gap-4">
                     <button onClick={handlePrevious} aria-label="السابق" disabled={currentAyahIndex === 0} className="p-3 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 transition"><PreviousIcon className="w-6 h-6"/></button>
                    <button onClick={handlePlayPause} aria-label={isPlaying ? 'إيقاف مؤقت' : 'تشغيل'} className="p-4 rounded-full bg-green-600 text-white hover:bg-green-700 transition mx-4">
                        {isPlaying ? <PauseIcon className="w-10 h-10"/> : <PlayIcon className="w-10 h-10"/>}
                    </button>
                    <button onClick={handleNext} aria-label="التالي" disabled={currentAyahIndex >= ayahs.length - 1} className="p-3 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 transition"><NextIcon className="w-6 h-6"/></button>
                </div>
                <div className="border-t border-slate-200 dark:border-slate-700 pt-4 grid grid-cols-3 gap-3 text-sm">
                    <SettingSelect id="repetitions" label="التكرار" value={String(repetitions)} onChange={(e) => setRepetitions(parseInt(e.target.value, 10))}>
                        {Array.from({ length: 20 }, (_, i) => i + 1).map(num => {
                            let unit;
                            if (num === 1) unit = 'مرة';
                            else if (num === 2) unit = 'مرتان';
                            else unit = 'مرات';
                            return <option key={num} value={num}>{`${num} ${unit}`}</option>;
                        })}
                    </SettingSelect>
                    <SettingSelect id="delay" label="التأخير" value={String(delay)} onChange={(e) => setDelay(parseInt(e.target.value, 10))}>
                        {Array.from({ length: 11 }, (_, i) => i).map(num => {
                            let unit;
                            if (num === 0) return <option key={num} value={num}>بلا تأخير</option>;
                            if (num === 1) unit = 'ثانية';
                            else if (num === 2) unit = 'ثانيتان';
                            else unit = 'ثوان';
                            return <option key={num} value={num}>{`${num} ${unit}`}</option>;
                        })}
                    </SettingSelect>
                     <SettingSelect id="playbackRate" label="السرعة" value={String(playbackRate)} onChange={e => setPlaybackRate(parseFloat(e.target.value))}>
                        <option value="0.75">0.75x</option>
                        <option value="1">1x</option>
                        <option value="1.25">1.25x</option>
                        <option value="1.5">1.5x</option>
                     </SettingSelect>
                </div>
            </div>
        </div>
    );
};