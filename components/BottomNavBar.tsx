
import React from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { HomeIcon, BookOpenIcon, SearchIcon, ArrowRightIcon, HeadphonesIcon, FlowerIcon, RadioIcon, ShieldIcon } from './Icons';

const MotionNav = motion.nav as any;

export const BottomNavBar = () => {
    const { view, navigateTo, showSearch } = useApp();

    const isReadingView = ['index', 'reader', 'division'].includes(view);
    const isListenView = view === 'listen';
    const isRadioView = view === 'radio';
    const isMemorizationView = view === 'memorization';
    const isHisnAlMuslimView = view === 'hisn-al-muslim';
    const isNestedReadingView = ['reader', 'division'].includes(view);

    const handlePrimaryAction = () => {
        if (isNestedReadingView) {
            navigateTo('index');
        } else {
            navigateTo('home');
        }
    };
    
    const navItems = [
        {
            label: isNestedReadingView ? 'رجوع' : 'الرئيسية',
            icon: isNestedReadingView ? ArrowRightIcon : HomeIcon,
            action: handlePrimaryAction,
            className: isNestedReadingView ? 'transform -scale-x-100' : ''
        },
        {
            label: 'تصفح',
            icon: BookOpenIcon,
            action: () => navigateTo('index'),
            isActive: isReadingView
        },
        {
            label: 'استماع',
            icon: HeadphonesIcon,
            action: () => navigateTo('listen'),
            isActive: isListenView
        },
        {
            label: 'راديو',
            icon: RadioIcon,
            action: () => navigateTo('radio'),
            isActive: isRadioView
        },
        {
            label: 'حفظ',
            icon: FlowerIcon,
            action: () => navigateTo('memorization'),
            isActive: isMemorizationView
        },
        {
            label: 'الحصن',
            icon: ShieldIcon,
            action: () => navigateTo('hisn-al-muslim'),
            isActive: isHisnAlMuslimView,
        },
        {
            label: 'أذكار',
            icon: ShieldIcon, // Placeholder icon
            action: () => navigateTo('azkar'),
            isActive: view === 'azkar',
        },
    ];

    return (
        <MotionNav
            initial={{ y: '100%' }}
            animate={{ y: '0%' }}
            exit={{ y: '100%' }}
            transition={{ type: 'tween', ease: 'easeOut', duration: 0.3 }}
            className="fixed bottom-0 right-0 left-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-slate-200 dark:border-slate-700 z-40"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
            role="navigation"
            aria-label="شريط التنقل السفلي"
        >
            <div className="max-w-4xl mx-auto flex justify-around p-1">
                {navItems.map(item => (
                    <button
                        key={item.label}
                        onClick={item.action}
                        aria-label={item.label}
                        className={`flex flex-col items-center justify-center flex-1 h-16 rounded-xl transition-colors duration-200 focus:outline-none focus:bg-green-100/50 dark:focus:bg-green-900/50 ${
                            item.isActive
                                ? 'text-green-600 dark:text-green-400'
                                : 'text-slate-500 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-400'
                        }`}
                    >
                        <item.icon className={`w-6 h-6 mb-1 ${item.className || ''}`} />
                        <span className="text-xs font-semibold">{item.label}</span>
                    </button>
                ))}
                <button
                    key="بحث"
                    onClick={showSearch}
                    aria-label="بحث"
                    className="flex flex-col items-center justify-center flex-1 h-16 rounded-xl transition-colors duration-200 focus:outline-none focus:bg-green-100/50 dark:focus:bg-green-900/50 text-slate-500 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-400"
                >
                    <SearchIcon className="w-6 h-6 mb-1" />
                    <span className="text-xs font-semibold">بحث</span>
                </button>
            </div>
        </MotionNav>
    );
};
