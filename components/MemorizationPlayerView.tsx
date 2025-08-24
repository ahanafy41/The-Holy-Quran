import React, { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { SavedSection } from '../types';
import { useAppContext } from '../context/AppContext';
import { PlayIcon, PauseIcon, PreviousIcon, NextIcon, ArrowRightIcon } from './Icons';

const MemorizationPlayerView: React.FC = () => {
  const { selectedSavedSection, quran } = useAppContext();
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurfer = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (waveformRef.current) {
      wavesurfer.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: 'rgb(200, 200, 200)',
        progressColor: 'rgb(100, 100, 100)',
      });

      if (selectedSavedSection && selectedSavedSection.ayahs.length > 0) {
        // This is a simplified logic. A real implementation would concatenate audio files.
        const firstAyah = selectedSavedSection.ayahs[0];
        wavesurfer.current.load(firstAyah.audio);
      }
    }

    return () => wavesurfer.current?.destroy();
  }, [selectedSavedSection]);

  if (!selectedSavedSection) return null;

  return (
    <div className="fixed bottom-16 left-0 right-0 bg-gray-100 dark:bg-gray-900 p-4">
      <div ref={waveformRef}></div>
      {/* Player controls */}
    </div>
  );
};

export default MemorizationPlayerView;