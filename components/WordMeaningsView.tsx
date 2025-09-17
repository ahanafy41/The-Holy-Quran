import React, { useState, useEffect } from 'react';
import { Ayah, WordMeaning } from '../types';
import { getWordMeaningsForSurah } from '../services/quranApi';
import { Spinner } from './Spinner';

interface WordMeaningsViewProps {
    ayah: Ayah;
}

export const WordMeaningsView: React.FC<WordMeaningsViewProps> = ({ ayah }) => {
    const [meanings, setMeanings] = useState<WordMeaning[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchMeanings = async () => {
            if (!ayah.surah) {
                setError('معلومات السورة غير متوفرة.');
                setIsLoading(false);
                return;
            }
            setIsLoading(true);
            try {
                const allMeaningsForSurah = await getWordMeaningsForSurah(ayah.surah.number);

                // Filter the meanings to only those for the current verse.
                const meaningsForVerse = allMeaningsForSurah.filter(m => m.verse === String(ayah.numberInSurah));

                setMeanings(meaningsForVerse);
            } catch (err) {
                setError('لا يمكن تحميل معاني الكلمات.');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMeanings();
    }, [ayah]);

    if (isLoading) {
        return <div className="text-center p-4" role="status"><Spinner /></div>;
    }

    if (error) {
        return <div className="text-center p-4 text-red-500" role="alert">{error}</div>;
    }

    if (meanings.length === 0) {
        return <div className="text-center p-4 text-slate-500">لا توجد معانٍ مسجلة لهذه الآية.</div>;
    }

    return (
        <div className="p-4" dir="rtl">
            <h3 className="text-lg font-bold mb-4 text-slate-800 dark:text-slate-200" id="word-meanings-heading">معاني كلمات الآية {ayah.numberInSurah}</h3>
            <dl aria-labelledby="word-meanings-heading" className="space-y-3">
                {meanings.map((meaning, index) => (
                    <div key={index} className="flex flex-col">
                        <dt className="font-bold text-lg text-green-700 dark:text-green-400">{meaning.word}</dt>
                        <dd className="text-slate-700 dark:text-slate-300 mr-4 border-r-2 border-green-500 pr-2">{meaning.meaning}</dd>
                    </div>
                ))}
            </dl>
        </div>
    );
};
