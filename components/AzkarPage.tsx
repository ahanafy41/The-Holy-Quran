import React, { useEffect, useState } from 'react';
import azkarData from '../azkar-data/azkar.json';

interface AzkarSection {
  text: string[];
  footnote: string[];
}

interface Azkar {
  [title: string]: AzkarSection;
}

const AzkarPage: React.FC = () => {
  const [azkar, setAzkar] = useState<Azkar>({});

  useEffect(() => {
    setAzkar(azkarData);
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">حصن المسلم</h1>
      <div className="space-y-8">
        {Object.entries(azkar).map(([title, section]) => (
          <div key={title} className="p-4 border rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-2">{title}</h2>
            <div className="space-y-2">
              {section.text.map((text, index) => (
                <p key={index} className="text-gray-700 dark:text-gray-300">{text}</p>
              ))}
            </div>
            <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              {section.footnote.map((note, index) => (
                <p key={index}><em>{note}</em></p>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-8 text-center text-gray-500 dark:text-gray-400">
        <p>ميزة الصوت غير متوفرة حالياً.</p>
      </div>
    </div>
  );
};

export default AzkarPage;
