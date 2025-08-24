import React from 'react';
import { adhkar } from '../data/adhkar';

const AdhkarPage: React.FC = () => {
  return (
    <div className="p-4 bg-gray-50 text-gray-800 min-h-screen font-sans">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold font-quran text-green-700">الأذكار</h1>
        <p className="text-gray-500">حصن المسلم اليومي</p>
      </div>

      <div className="space-y-8 max-w-3xl mx-auto">
        {adhkar.map((category, index) => (
          <div key={index} className="bg-white p-5 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold font-quran text-green-600 mb-4 pb-2 border-b-2 border-green-100 text-right">
              {category.category}
            </h2>
            <ul className="space-y-4">
              {category.content.map((item, itemIndex) => (
                <li key={itemIndex} className="p-4 bg-green-50 rounded-md flex flex-col items-start">
                  <p className="text-lg text-right font-quran leading-loose mb-3 w-full">{item.text}</p>
                  <div className="text-left">
                    <span className="text-sm font-bold text-white bg-green-500 rounded-full px-3 py-1">
                      تقرأ {item.count} مرات
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdhkarPage;