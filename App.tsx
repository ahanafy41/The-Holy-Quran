import React, { useContext, useEffect } from 'react';
import { AppContext, AppProvider } from './context/AppContext';
import HomePage from './components/HomePage';
import IndexPage from './components/IndexPage';
import AdhkarPage from './components/AdhkarPage';
import HisnAlMuslimPage from './components/HisnAlMuslimPage';
import ListenPage from './components/ListenPage';
import MemorizationPage from './components/MemorizationPage';
import BottomNavBar from './components/BottomNavBar';
import SettingsModal from './components/SettingsModal';
import TafsirModal from './components/TafsirModal';
import QuickAccessMenu from './components/QuickAccessMenu';
import { Toaster } from 'react-hot-toast';

const MainContent: React.FC = () => {
  const context = useContext(AppContext);
  if (!context) return <div>Loading...</div>;

  const { activeTab, settings } = context;

  useEffect(() => {
    document.documentElement.classList.toggle('dark', settings.theme === 'dark');
  }, [settings.theme]);

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'quran':
        return <HomePage />;
      case 'index':
        return <IndexPage />;
      case 'hisn-al-muslim':
        return <HisnAlMuslimPage />;
      case 'adhkar':
        return <AdhkarPage />;
      case 'listen':
        return <ListenPage />;
      case 'memorization':
        return <MemorizationPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen">
      <main className="pb-16">
        {renderActiveTab()}
      </main>
      <BottomNavBar />
      <SettingsModal />
      <TafsirModal />
      <QuickAccessMenu />
      <Toaster position="bottom-center" />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
};

export default App;
