import React from 'react';
import { useApp } from '../context/AppContext';
import azkarData from '../azkar-data/azkar.json';
import { ShieldIcon } from './Icons';
import { motion } from 'framer-motion';

interface AzkarCategory {
  id: number;
  category: string;
  array: any[];
}

export const AzkarHisnAlMuslimPage: React.FC = () => {
  const { navigateTo } = useApp();

  const handleCategoryClick = (category: AzkarCategory) => {
    navigateTo('azkar-detail', { categoryId: category.id });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-8 text-center">
        <div className="inline-block p-4 bg-blue-500 rounded-2xl mb-4">
            <ShieldIcon className="w-10 h-10 text-white"/>
        </div>
        <h1 tabIndex={-1} className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white focus:outline-none">أذكار حصن المسلم</h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 mt-2">اختر مجموعة من الأذكار</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {azkarData.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <button
              onClick={() => handleCategoryClick(item)}
              className="w-full h-full group p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-sm text-right hover:shadow-lg hover:-translate-y-1.5 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-500/50 dark:focus:ring-blue-400/50"
            >
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">{item.category}</h2>
               <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{item.array.length} أذكار</p>
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
