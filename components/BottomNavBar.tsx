import React from 'react';
import { FolderIcon, HeadphonesIcon, FlowerIcon, MicrophoneIcon, XIcon } from './Icons';

interface BottomNavBarProps {
  currentPage: string;
  navigate: (page: string) => void;
}

const BottomNavBar: React.FC<BottomNavBarProps> = ({ currentPage, navigate }) => {
  const navItems = [
    { name: 'Index', icon: <FolderIcon />, page: 'index' },
    { name: 'Listen', icon: <HeadphonesIcon />, page: 'listen' },
    { name: 'Home', icon: <FlowerIcon />, page: 'home' },
    { name: 'Memorize', icon: <MicrophoneIcon />, page: 'memorization' },
    { name: 'Radio', icon: <XIcon />, page: 'radio' }, // Placeholder for Radio icon
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t dark:border-gray-700 flex justify-around p-2">
      {navItems.map((item) => (
        <button
          key={item.page}
          onClick={() => navigate(item.page)}
          className={`flex flex-col items-center text-xs ${currentPage === item.page ? 'text-blue-500' : 'text-gray-500'}`}>
          {item.icon}
          <span>{item.name}</span>
        </button>
      ))}
    </div>
  );
};

export default BottomNavBar;