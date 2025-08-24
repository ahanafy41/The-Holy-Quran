import React from 'react';
import { SurahSimple, ListeningReciter } from '../types';
import { useAppContext } from '../context/AppContext';
import { ArrowRightIcon, PauseIcon, PlayIcon, PreviousIcon, NextIcon } from './Icons';

const ListenPlayerView: React.FC = () => {
  const { selectedSurah } = useAppContext();

  if (!selectedSurah) {
    return null;
  }

  return (
    <div className="fixed bottom-16 left-0 right-0 bg-gray-100 dark:bg-gray-900 p-4 border-t dark:border-gray-700 flex items-center justify-between">
      <div>
        <p className="font-bold">{selectedSurah.englishName}</p>
        <p className="text-sm">Now Playing</p>
      </div>
      <div className="flex items-center gap-4">
        <button><PreviousIcon /></button>
        <button><PlayIcon /></button>
        <button><NextIcon /></button>
      </div>
    </div>
  );
};

export default ListenPlayerView;