import React from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { BookOpenIcon, HeadphonesIcon, ShieldIcon, MenuIcon, BookmarkIcon } from './Icons'; // Assuming Hadith uses BookOpenIcon, Hisn uses ShieldIcon

const MotionNav = motion.nav as any;

/**
 * `BottomNavBar` is the primary navigation component for the application, typically displayed at the bottom of the screen on mobile devices.
 * It provides quick access to the main features of the app, such as the Quran index, listening, Hadith, and more.
 * The active tab is highlighted based on the current view from the `useApp` context.
 *
 * @component
 * @returns {React.ReactElement} The bottom navigation bar component.
 */
export const BottomNavBar = () => {
    const { view, navigateTo, showSettings } = useApp();

    // Define the navigation items based on the final agreed-upon design
    const navItems = [
        {
            label: 'القرآن',
            icon: BookOpenIcon,
            action: () => navigateTo('index'),
            targetView: 'index',
        },
        {
            label: 'الاستماع',
            icon: HeadphonesIcon,
            action: () => navigateTo('listen'),
            targetView: 'listen',
        },
        {
            label: 'الحديث',
            icon: BookOpenIcon, // Re-using BookOpenIcon for Hadith
            action: () => navigateTo('hadith'),
            targetView: 'hadith',
        },
        {
            label: 'حصن المسلم',
            icon: ShieldIcon,
            action: () => navigateTo('hisn-al-muslim'),
            targetView: 'hisn-al-muslim',
        },
        {
            label: 'المزيد',
            icon: MenuIcon,
            action: () => navigateTo('more'),
            targetView: 'more',
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
                {navItems.map(item => {
                    // This logic determines which views should light up the 'index' (Quran) tab.
                    const isReadingRelatedView = ['index', 'reader', 'division'].includes(view);
                    const isActive = item.targetView === 'index' ? isReadingRelatedView : view === item.targetView;

                    return (
                        <button
                            key={item.label}
                            onClick={item.action}
                            aria-label={item.label}
                            className={`flex flex-col items-center justify-center flex-1 h-16 rounded-xl transition-colors duration-200 focus:outline-none focus:bg-green-100/50 dark:focus:bg-green-900/50 ${
                                isActive
                                    ? 'text-green-600 dark:text-green-400'
                                    : 'text-slate-500 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-400'
                            }`}
                        >
                            <item.icon className="w-6 h-6 mb-1" />
                            <span className="text-xs font-semibold">{item.label}</span>
                        </button>
                    );
                })}
            </div>
        </MotionNav>
    );
};
