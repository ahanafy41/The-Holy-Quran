import React from 'react';
import { HomeIcon, ListIcon, MemorizeIcon, ListenIcon, RadioIcon, BookOpenIcon } from './Icons';
import { Page } from '../types';

interface BottomNavBarProps {
  activePage: Page;
  setActivePage: (page: Page) => void;
}

const NavButton: React.FC<{ // Using a generic NavButton component for cleaner code
  pageName: Page;
  activePage: Page;
  setActivePage: (page: Page) => void;
  Icon: React.ElementType;
  label: string;
}> = ({ pageName, activePage, setActivePage, Icon, label }) => {
  const isActive = activePage === pageName;
  return (
    <button
      onClick={() => setActivePage(pageName)}
      className={`flex flex-col items-center justify-center w-full pt-2 pb-1 transition-colors duration-200 ${
        isActive ? 'text-green-600' : 'text-gray-500 hover:text-green-500'
      }`}
    >
      <Icon className="w-6 h-6 mb-1" />
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
};

const BottomNavBar: React.FC<BottomNavBarProps> = ({ activePage, setActivePage }) => {
  const navItems = [
    { pageName: 'home', Icon: HomeIcon, label: 'الرئيسية' },
    { pageName: 'index', Icon: ListIcon, label: 'الفهرس' },
    { pageName: 'adhkar', Icon: BookOpenIcon, label: 'الأذكار' }, // Added Adhkar button
    { pageName: 'memorization_and_sections', Icon: MemorizeIcon, label: 'الحفظ' },
    { pageName: 'listen', Icon: ListenIcon, label: 'استماع' },
    { pageName: 'radio', Icon: RadioIcon, label: 'الإذاعة' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-top z-50">
      <div className="flex justify-around">
        {navItems.map(item => (
            <NavButton
                key={item.pageName}
                pageName={item.pageName as Page}
                activePage={activePage}
                setActivePage={setActivePage}
                Icon={item.Icon}
                label={item.label}
            />
        ))}
      </div>
    </div>
  );
};

export default BottomNavBar;