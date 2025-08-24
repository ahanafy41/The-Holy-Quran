import React from 'react';
import { useAppContext } from '../context/AppContext';
import { HeadphonesIcon, FlowerIcon, CogIcon, SunIcon, MoonIcon } from './Icons';

interface HomePageProps {
  navigate: (page: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ navigate }) => {
  const { currentTheme, setCurrentTheme, setShowSettingsModal } = useAppContext();

  const toggleTheme = () => {
    setCurrentTheme(currentTheme === 'light' ? 'dark' : 'light');
  };

  return (
    <div className="p-4">
      <header className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-2">
          <FlowerIcon />
          <h1 className="text-2xl font-bold">The Holy Quran</h1>
        </div>
        <div>
          <button onClick={toggleTheme} className="p-2">
            {currentTheme === 'light' ? <MoonIcon /> : <SunIcon />}
          </button>
          <button onClick={() => setShowSettingsModal(true)} className="p-2">
            <CogIcon />
          </button>
        </div>
      </header>
      <main className="grid grid-cols-2 gap-4">
        <button onClick={() => navigate('index')} className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg flex flex-col items-center gap-2">
          <FlowerIcon />
          <span>Read Quran</span>
        </button>
        <button onClick={() => navigate('listen')} className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg flex flex-col items-center gap-2">
          <HeadphonesIcon />
          <span>Listen</span>
        </button>
      </main>
    </div>
  );
};