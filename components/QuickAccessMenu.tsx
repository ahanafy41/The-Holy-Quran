import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FocusTrap from 'focus-trap-react';
import { useApp } from '../context/AppContext';
import { SparklesIcon, XMarkIcon, ArrowRightIcon, HomeIcon, SearchIcon, ArrowUpIcon } from './Icons';

const MotionDiv = motion.div as any;
const MotionButton = motion.button as any;

export const QuickAccessMenu = () => {
    const { view, navigateTo, showSearch, scrollToTop } = useApp();
    const [isOpen, setIsOpen] = useState(false);
    const fabRef = useRef<HTMLButtonElement>(null);

    const isNestedView = ['reader', 'division', 'listen', 'memorization'].includes(view);

    const handleBackOrHome = () => {
        if (['reader', 'division'].includes(view)) {
            navigateTo('index');
        } else {
            navigateTo('home');
        }
        setIsOpen(false);
    };

    const menuItems = [
        {
            label: isNestedView ? 'رجوع' : 'الرئيسية',
            icon: isNestedView ? ArrowRightIcon : HomeIcon,
            action: handleBackOrHome,
            className: isNestedView ? 'transform -scale-x-100' : ''
        },
        {
            label: 'لأعلى',
            icon: ArrowUpIcon,
            action: () => {
                scrollToTop();
                setIsOpen(false);
            }
        },
        {
            label: 'بحث',
            icon: SearchIcon,
            action: () => {
                showSearch();
                setIsOpen(false);
            }
        },
    ];
    
    // Close menu on view change
    useEffect(() => {
        setIsOpen(false);
    }, [view]);

    const fabVariants = {
        closed: { scale: 1, rotate: 0 },
        open: { scale: 1.1, rotate: -45 }
    };

    const menuVariants = {
        closed: { opacity: 0, y: 20, pointerEvents: 'none' as const },
        open: { opacity: 1, y: 0, pointerEvents: 'auto' as const }
    };

    const itemVariants = {
        closed: { opacity: 0, y: 15 },
        open: { opacity: 1, y: 0 }
    };

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                     <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setIsOpen(false)} />
                )}
            </AnimatePresence>
            <div
                className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom))] left-4 z-50"
                aria-label="قائمة الإجراءات السريعة"
            >
                <FocusTrap
                    active={isOpen}
                    focusTrapOptions={{
                        onDeactivate: () => fabRef.current?.focus(),
                        clickOutsideDeactivates: true,
                        escapeDeactivates: true,
                        initialFocus: false, // Let framer-motion handle the animation first
                    }}
                >
                    <MotionDiv
                        variants={menuVariants}
                        initial="closed"
                        animate={isOpen ? 'open' : 'closed'}
                        transition={{ staggerChildren: 0.05, delayChildren: 0.1 }}
                        className="flex flex-col items-start gap-3 mb-3"
                        role={isOpen ? "menu" : undefined}
                        aria-hidden={!isOpen}
                    >
                        {menuItems.map((item, index) => (
                            <MotionDiv key={item.label} variants={itemVariants} className="flex items-center gap-3">
                                <button
                                    onClick={item.action}
                                    className="w-12 h-12 bg-white dark:bg-slate-700 rounded-full shadow-lg flex items-center justify-center text-slate-600 dark:text-slate-200 hover:bg-green-50 dark:hover:bg-green-900/50 hover:text-green-600 dark:hover:text-green-400 transition-all focus:outline-none focus:ring-2 focus:ring-green-500"
                                    aria-label={item.label}
                                    tabIndex={isOpen ? 0 : -1}
                                    role={isOpen ? "menuitem" : undefined}
                                >
                                    <item.icon className={`w-6 h-6 ${item.className || ''}`} />
                                </button>
                                <div className="px-3 py-1 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-semibold rounded-md shadow-md">
                                    {item.label}
                                </div>
                            </MotionDiv>
                        ))}
                    </MotionDiv>
                </FocusTrap>

                <MotionButton
                    ref={fabRef}
                    onClick={() => setIsOpen(!isOpen)}
                    variants={fabVariants}
                    animate={isOpen ? 'open' : 'closed'}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-16 h-16 bg-green-600 text-white rounded-full shadow-2xl flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-green-500/50"
                    aria-label="فتح قائمة الإجراءات السريعة"
                    aria-haspopup="true"
                    aria-expanded={isOpen}
                >
                    <MotionDiv animate={{ rotate: isOpen ? 45 : 0 }}>
                         <SparklesIcon className="w-8 h-8"/>
                    </MotionDiv>
                </MotionButton>
            </div>
        </>
    );
};