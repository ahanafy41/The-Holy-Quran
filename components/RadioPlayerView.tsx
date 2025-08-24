import React from 'react';
import { useAppContext } from '../context/AppContext';
import { ArrowRightIcon, PauseIcon, PlayIcon, SpeakerWaveIcon } from './Icons';

const RadioPlayerView: React.FC = () => {
  const { selectedRadio, isRadioPlaying, setIsRadioPlaying } = useAppContext();

  if (!selectedRadio) return null;

  return (
    <div className="fixed bottom-16 left-0 right-0 bg-gray-100 dark:bg-gray-900 p-4 border-t dark:border-gray-700 flex items-center justify-between">
      <div>
        <p className="font-bold">{selectedRadio.name}</p>
      </div>
      <div className="flex items-center gap-4">
        <button onClick={() => setIsRadioPlaying(!isRadioPlaying)}>
          {isRadioPlaying ? <PauseIcon /> : <PlayIcon />}
        </button>
        <SpeakerWaveIcon />
      </div>
    </div>
  );
}; 

export default RadioPlayerView;