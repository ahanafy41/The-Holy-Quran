import React from 'react';
import { useLocation } from 'react-router-dom'; // Assuming react-router is used for path
import { QuranDivision } from '../types';
import { useAppContext } from '../context/AppContext';
import AyahItem from './AyahItem';
import { ArrowRightIcon } from './Icons';

const DivisionView: React.FC = () => {
    const { quran } = useAppContext();
    // This is a placeholder for getting division info. In a real app this would be more robust.
    const division: QuranDivision = { id: 1, name: 'Juz 1', type: 'juz', start: 1, end: 141 };

    const getAyahsForDivision = () => {
        let ayahs = [];
        for (const surah of quran.surahs) {
            for (const ayah of surah.verses) {
                if (ayah.number >= division.start && ayah.number <= division.end) {
                    ayahs.push(ayah);
                }
            }
        }
        return ayahs;
    };

    const ayahs = getAyahsForDivision();

    return (
        <div>
            <header className="p-4 bg-gray-100 dark:bg-gray-900 border-b dark:border-gray-800 sticky top-0 z-10">
                <h1 className="text-xl font-bold">{division.name}</h1>
            </header>
            <main>
                {ayahs.map(ayah => (
                    <AyahItem key={ayah.number} ayah={ayah} />
                ))}
            </main>
        </div>
    );
};

export default DivisionView;