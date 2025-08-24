import React from 'react';
import { SurahSimple, ListeningReciter } from '../types';
import { useAppContext } from '../context/AppContext';
import { ChevronLeftIcon, ArrowRightIcon, SpeakerWaveIcon } from './Icons';

interface ListenPageProps {
  navigate: (page: string) => void;
}

export const ListenPage: React.FC<ListenPageProps> = ({ navigate }) => {
  const { surahsSimple, setSelectedSurah, reciters, selectedReciter, setSelectedReciter } = useAppContext();

  const handleSurahSelect = (surah: SurahSimple) => {
    setSelectedSurah(surah);
  };

  return (
    <div>
      <header className="p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Listen</h1>
        <button onClick={() => navigate('home')}><ChevronLeftIcon /></button>
      </header>
      <div className="p-4">
        {/* Reciter Selection UI */}
      </div>
      <ul>
        {surahsSimple.map(surah => (
          <li key={surah.number} onClick={() => handleSurahSelect(surah)} className="flex justify-between items-center p-4 border-b dark:border-gray-700 cursor-pointer">
            <div>
              <p className="font-bold">{surah.number}. {surah.englishName}</p>
              <p className="text-sm text-gray-500">{surah.revelationType} - {surah.numberOfAyahs} ayahs</p>
            </div>
            <SpeakerWaveIcon />
          </li>
        ))}
      </ul>
    </div>
  );
};