
import React, { useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { BookOpenIcon, HeadphonesIcon, FlowerIcon, SearchIcon, CogIcon, SunIcon, MoonIcon, RadioIcon } from './Icons';

export const HomePage: React.FC = () => {
    const { navigateTo, showSearch, showSettings, settings, updateSettings } = useApp();
    const titleRef = useRef<HTMLHeadingElement>(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            titleRef.current?.focus();
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    const menuItems = [
        {
            title: "تصفح وقراءة",
            description: "اقرأ القرآن الكريم كاملاً",
            icon: BookOpenIcon,
            action: () => navigateTo('index'),
            color: 'text-sky-500',
        },
        {
            title: "الاستماع",
            description: "استمع لتلاوات عطرة",
            icon: HeadphonesIcon,
            action: () => navigateTo('listen'),
            color: 'text-amber-500',
        },
        {
            title: "الراديو",
            description: "استمع لإذاعات القرآن الكريم",
            icon: RadioIcon,
            action: () => navigateTo('radio'),
            color: 'text-rose-500',
        },
        {
            title: "الحفظ والمراجعة",
            description: "نظّم وردك اليومي",
            icon: FlowerIcon,
            action: () => navigateTo('memorization'),
            color: 'text-emerald-500',
        },
        {
            title: "البحث",
            description: "ابحث عن آية أو كلمة",
            icon: SearchIcon,
            action: showSearch,
            color: 'text-violet-500',
        },
    ];

    return (
        <div className="max-w-4xl mx-auto text-center">
            <header className="mb-8 md:mb-12">
                <div className="inline-block p-4 bg-green-500 rounded-2xl mb-4">
                    <BookOpenIcon className="w-10 h-10 text-white"/>
                </div>
                <h1 ref={titleRef} tabIndex={-1} className="text-4xl md:text-5xl font-bold text-slate-800 dark:text-white focus:outline-none">القرآن الكريم</h1>
                <p className="text-lg text-slate-600 dark:text-slate-400 mt-2">رفيقك لدراسة وتدبر القرآن</p>
            </header>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {menuItems.map((item, index) => (
                    <button 
                        key={item.title}
                        onClick={item.action}
                        className={`group p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-sm text-right hover:shadow-lg hover:-translate-y-1.5 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-green-500/50 dark:focus:ring-green-400/50 ${index === 4 && 'lg:col-span-3'}`}
                    >
                        <item.icon className={`w-10 h-10 mb-3 ${item.color}`} />
                        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">{item.title}</h2>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">{item.description}</p>
                    </button>
                ))}
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                 <button 
                    onClick={showSettings}
                    className="group p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm text-right flex items-center gap-4 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-green-500/50 dark:focus:ring-green-400/50"
                >
                    <CogIcon className="w-8 h-8 text-slate-500" />
                    <div>
                        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">الإعدادات</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">تخصيص القارئ والتفسير</p>
                    </div>
                </button>
                 <button 
                    onClick={() => updateSettings({ darkMode: !settings.darkMode })}
                    className="group p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm text-right flex items-center gap-4 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-green-500/50 dark:focus:ring-green-400/50"
                >
                    {settings.darkMode ? <SunIcon className="w-8 h-8 text-yellow-400" /> : <MoonIcon className="w-8 h-8 text-slate-500" />}
                    <div>
                        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">{settings.darkMode ? 'الوضع المضيء' : 'الوضع الداكن'}</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">تبديل مظهر التطبيق</p>
                    </div>
                </button>
            </div>
        </div>
    );
};