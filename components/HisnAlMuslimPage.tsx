import React, { useState } from 'react';
import { adhkarByCategory } from '../data/adhkar';
import { Icons } from './Icons';

const HisnAlMuslimPage: React.FC = () => {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const toggleCategory = (category: string) => {
    setExpandedCategory(expandedCategory === category ? null : category);
  };

  return (
    <div className="p-4 pb-20 bg-white dark:bg-gray-900 min-h-screen text-gray-900 dark:text-gray-100">
      <h1 className="text-3xl font-bold text-center mb-6 font-arabic">حصن المسلم</h1>
      {Object.entries(adhkarByCategory).map(([category, adhkarList]) => (
        <div key={category} className="mb-4 rounded-lg overflow-hidden shadow-md bg-gray-50 dark:bg-gray-800">
          <button
            onClick={() => toggleCategory(category)}
            className="w-full text-right bg-gray-100 dark:bg-gray-700 p-4 flex justify-between items-center transition-colors duration-200"
          >
            <span className="font-semibold font-arabic text-lg">{category}</span>
            <Icons.ChevronDown className={`transform transition-transform duration-300 ${expandedCategory === category ? 'rotate-180' : ''}`} />
          </button>
          {expandedCategory === category && (
            <div className="p-4">
              {adhkarList.map((adhkar, index) => (
                <div key={index} className="mb-6 border-b border-gray-200 dark:border-gray-600 pb-4 last:border-b-0 last:pb-0">
                  <p className="text-xl font-arabic leading-loose mb-2">{adhkar.zekr}</p>
                  {adhkar.description && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 italic font-arabic">{adhkar.description}</p>}
                  {adhkar.count && <p className="text-md text-blue-500 dark:text-blue-400 mt-2 font-semibold">التكرار: {adhkar.count}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default HisnAlMuslimPage;
