import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { SurahSimple } from '../types';
import { FolderIcon, ChevronLeftIcon, ArrowRightIcon, FlowerIcon } from './Icons';

interface IndexPageProps {
  navigate: (page: string) => void;
}

export const IndexPage: React.FC<IndexPageProps> = ({ navigate }) => {
  const { surahsSimple } = useAppContext();
  const [activeTab, setActiveTab] = useState('surah');

  const lastReadMap = useMemo(() => new Map<number, string>(), []);

  return (
    <div>
      <header className="p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Index</h1>
        <button onClick={() => navigate('home')}><ChevronLeftIcon /></button>
      </header>
      <div className="flex justify-center border-b mb-4">
        <button onClick={() => setActiveTab('surah')} className={`p-2 ${activeTab === 'surah' ? 'border-b-2 border-blue-500' : ''}`}>Surah</button>
        <button onClick={() => setActiveTab('juz')} className={`p-2 ${activeTab === 'juz' ? 'border-b-2 border-blue-500' : ''}`}>Juz</button>
      </div>
      {activeTab === 'surah' && (
        <ul>
          {surahsSimple.map(surah => (
            <li key={surah.number} onClick={() => navigate(`quran/${surah.number}`)} className="flex justify-between items-center p-4 border-b dark:border-gray-700 cursor-pointer">
              <div>
                <p className="font-bold">{surah.number}. {surah.englishName}</p>
                <p className="text-sm text-gray-500">{surah.englishNameTranslation}</p>
              </div>
              <p className="font-quranic text-xl">{surah.name}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};