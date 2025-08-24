import React from 'react';
import { useParams } from 'react-router-dom'; // Placeholder for routing
import { useAppContext } from '../context/AppContext';
import AyahItem from './AyahItem';
import { ArrowRightIcon } from './Icons';

const QuranView: React.FC = () => {
  const { quran } = useAppContext();
  // Using a placeholder for surah number. A real app would get this from URL.
  const { surahNumber = '1' } = useParams<{ surahNumber: string }>();
  const surah = quran.surahs[parseInt(surahNumber, 10) - 1];

  if (!surah) {
    return <div>Surah not found.</div>;
  }

  return (
    <div>
      <header className="p-4 bg-gray-100 dark:bg-gray-900 border-b dark:border-gray-800 sticky top-0 z-10">
        <h1 className="text-xl font-bold">{surah.englishName} - {surah.name}</h1>
      </header>
      <main>
        {surah.verses.map(ayah => (
          <AyahItem key={ayah.number} ayah={ayah} />
        ))}
      </main>
    </div>
  );
};

export default QuranView;