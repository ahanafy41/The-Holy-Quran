import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { Icons } from './Icons';

const BottomNavBar: React.FC = () => {
  const context = useContext(AppContext);
  if (!context) return null;

  const { activeTab, setActiveTab } = context;

  const navItems = [
    { name: 'quran', label: 'القرآن', icon: Icons.Book },
    { name: 'index', label: 'الفهرس', icon: Icons.List },
    { name: 'memorization', label: 'الحفظ', icon: Icons.BrainCircuit },
    { name: 'hisn-al-muslim', label: 'حصن المسلم', icon: Icons.Shield },
    { name: 'adhkar', label: 'أذكار', icon: Icons.Moon },
    { name: 'listen', label: 'استماع', icon: Icons.Headphones },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 shadow-[0_-2px_5px_rgba(0,0,0,0.1)] dark:shadow-[0_-2px_5px_rgba(0,0,0,0.3)] flex justify-around p-2 border-t border-gray-200 dark:border-gray-700">
      {navItems.map((item) => (
        <button
          key={item.name}
          onClick={() => setActiveTab(item.name as any)}
          className={`flex flex-col items-center justify-center w-1/6 text-gray-500 dark:text-gray-400 transition-colors duration-200 hover:text-blue-500 dark:hover:text-blue-400 ${
            activeTab === item.name ? 'text-blue-600 dark:text-blue-400' : ''
          }`}
        >
          <item.icon className="h-6 w-6 mb-1" />
          <span className="text-xs font-medium">{item.label}</span>
        </button>
      ))}
    </div>
  );
};

export default BottomNavBar;
