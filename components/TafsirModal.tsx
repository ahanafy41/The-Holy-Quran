import React from 'react';
import { useAppContext } from '../context/AppContext';
import { XMarkIcon } from './Icons';

export const TafsirModal: React.FC = () => {
  const { showTafsirModal, setShowTafsirModal, selectedAyah, quran } = useAppContext();

  if (!showTafsirModal || !selectedAyah) return null;

  const surah = quran.surahs[selectedAyah.surahId - 1];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-end z-50">
      <div className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-t-2xl p-4 flex flex-col h-[80vh]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Tafsir - {surah.englishName}:{selectedAyah.numberInSurah}</h2>
          <button onClick={() => setShowTafsirModal(false)}><XMarkIcon /></button>
        </div>
        <div className="flex-grow overflow-y-auto">
          <p className='font-quranic text-2xl text-right p-4' lang='ar' dir='rtl'>{selectedAyah.text}</p>
          <p className="text-gray-700 dark:text-gray-300">Tafsir content goes here...</p>
        </div>
      </div>
    </div>
  );
};