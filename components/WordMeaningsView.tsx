import React, { useState, useEffect } from 'react';
import { Ayah, ApiWord, ApiVerse } from '../types';
import { getWordMeaningsForSurah } from '../services/quranApi';
import { Spinner } from './Spinner';

interface WordMeaningsViewProps {
    ayah: Ayah;
}

export const WordMeaningsView: React.FC<WordMeaningsViewProps> = ({ ayah }) => {
    const [words, setWords] = useState<ApiWord[]>([]);
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
                const allVersesInSurah = await getWordMeaningsForSurah(ayah.surah.number);

                const currentVerse = allVersesInSurah.find(v => v.verse_number === ayah.numberInSurah);

                if (currentVerse) {
                    const wordsWithMeanings = currentVerse.words.filter(
                        w => w.char_type_name === 'word' && w.meaning && w.meaning.trim() !== ''
                    );
                    setWords(wordsWithMeanings);
                } else {
                    setWords([]);
                }

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

    if (words.length === 0) {
        return <div className="text-center p-4 text-slate-500">لا توجد معانٍ مسجلة لهذه الآية.</div>;
    }

    return (
        <div className="p-4" dir="rtl">
            <h3 className="text-lg font-bold mb-4 text-slate-800 dark:text-slate-200" id="word-meanings-heading">معاني كلمات الآية {ayah.numberInSurah}</h3>
            <dl aria-labelledby="word-meanings-heading" className="space-y-3">
                {words.map((word) => (
                    <div key={word.id} className="flex flex-col">
                        <dt className="font-bold text-lg text-green-700 dark:text-green-400">{word.text_uthmani}</dt>
                        <dd className="text-slate-700 dark:text-slate-300 mr-4 border-r-2 border-green-500 pr-2">{word.meaning}</dd>
                    </div>
                ))}
            </dl>
        </div>
    );
};
