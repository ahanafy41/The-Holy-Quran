import React from 'react';
import { useAppContext } from '../context/AppContext';
import { SparklesIcon, XMarkIcon, ArrowRightIcon, ArrowUpIcon } from './Icons';

export const QuickAccessMenu: React.FC = () => {
  const { showQuickAccessMenu, setShowQuickAccessMenu } = useAppContext();

  if (!showQuickAccessMenu) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" onClick={() => setShowQuickAccessMenu(false)}>
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg" onClick={e => e.stopPropagation()}>
        <h2 className="text-lg font-bold mb-4">Quick Access</h2>
        {/* Menu items */}
        <button className="w-full flex justify-between items-center p-2"><span>Go to Top</span><ArrowUpIcon /></button>
      </div>
    </div>
  );
};