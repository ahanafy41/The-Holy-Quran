import { AppProvider, useAppContext } from './context/AppContext';
import { HomePage } from './components/HomePage';
import { IndexPage } from './components/IndexPage';
import BottomNavBar from './components/BottomNavBar';
import QuranView from './components/QuranView';
import { ListenPage } from './components/ListenPage';
import DivisionView from './components/DivisionView';
import { SettingsModal } from './components/SettingsModal';
import { TafsirModal } from './components/TafsirModal';
import { QuickAccessMenu } from './components/QuickAccessMenu';
import ListenPlayerView from './components/ListenPlayerView';
import RadioPlayerView from './components/RadioPlayerView';
import MemorizationPlayerView from './components/MemorizationPlayerView';
import { useEffect, useState } from 'react';
import AIAssistantModal from './components/AIAssistantModal';
import { AdhkarPage } from './components/AdhkarPage';
import { HisnAlMuslimPage } from './components/HisnAlMuslimPage';
import { RadioPage } from './components/RadioPage';
import { MemorizationAndSectionsPage } from './components/MemorizationAndSectionsPage';

function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const { showSettingsModal, showTafsirModal, showQuickAccessMenu, showAIAssistantModal } = useAppContext();

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.substring(1) || "home";
      setCurrentPage(path);
    };
    window.addEventListener('popstate', handlePopState);
    handlePopState();
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (page: string) => {
    window.history.pushState(null, '', `/${page}`);
    setCurrentPage(page);
  };

  const renderPage = () => {
    if (currentPage.startsWith('division/')) return <DivisionView />;
    if (currentPage.startsWith('quran/')) return <QuranView />;

    switch (currentPage) {
      case "home": return <HomePage navigate={navigate} />;
      case "index": return <IndexPage navigate={navigate} />;
      case "listen": return <ListenPage navigate={navigate} />;
      case "memorization": return <MemorizationAndSectionsPage navigate={navigate} />;
      case "radio": return <RadioPage navigate={navigate} />;
      case "adhkar": return <AdhkarPage />;
      case "hisn-al-muslim": return <HisnAlMuslimPage />;
      default: return <HomePage navigate={navigate} />;
    }
  };

  return (
    <>
      <div className="font-sans pb-16">
        {renderPage()}
      </div>
      <BottomNavBar currentPage={currentPage} navigate={navigate} />
      <ListenPlayerView />
      <RadioPlayerView />
      <MemorizationPlayerView />
      {showSettingsModal && <SettingsModal />}
      {showTafsirModal && <TafsirModal />}
      {showQuickAccessMenu && <QuickAccessMenu />}
      {showAIAssistantModal && <AIAssistantModal />}
    </>
  );
}

function AppWrapper() {
  return (
    <AppProvider>
      <App />
    </AppProvider>
  )
}

export default AppWrapper;