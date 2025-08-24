import React, { useState, useEffect } from 'react';
import HomePage from './components/HomePage';
import IndexPage from './components/IndexPage';
import ListenPage from './components/ListenPage';
import RadioPage from './components/RadioPage';
import MemorizationAndSectionsPage from './components/MemorizationAndSectionsPage';
import BottomNavBar from './components/BottomNavBar';
import { AppContextProvider } from './context/AppContext';
import OfflineManager from './components/OfflineManager';
import AdhkarPage from './components/AdhkarPage';
import { Page } from './types';

const App = () => {
  const [activePage, setActivePage] = useState<Page>('home');
  const [showInstall, setShowInstall] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const page = urlParams.get('page') as Page;
    if (page) {
      setActivePage(page);
    }
  }, []);
  
  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      console.log('beforeinstallprompt event fired');
      setShowInstall(true); 
    });
  }, []);

  const renderPage = () => {
    switch (activePage) {
      case 'home':
        return <HomePage setActivePage={setActivePage} />;
      case 'index':
        return <IndexPage />;
      case 'listen':
        return <ListenPage />;
      case 'radio':
        return <RadioPage />;
      case 'memorization_and_sections':
        return <MemorizationAndSectionsPage />;
      case 'adhkar':
        return <AdhkarPage />;
      default:
        return <HomePage setActivePage={setActivePage} />;
    }
  };

  return (
    <AppContextProvider>
      <div className="pb-16">
        <OfflineManager />
        {renderPage()}
      </div>
      <BottomNavBar activePage={activePage} setActivePage={setActivePage} />
    </AppContextProvider>
  );
};

export default App;