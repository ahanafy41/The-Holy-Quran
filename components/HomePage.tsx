
import React, { useEffect, useRef, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { BookOpenIcon, HeadphonesIcon, FlowerIcon, SearchIcon, CogIcon, SunIcon, MoonIcon, RadioIcon, ShieldIcon, BookmarkIcon, ClockIcon } from './Icons';

export const HomePage: React.FC = () => {
    const { navigateTo, showSearch, showSettings, settings, updateSettings, lastReadPosition, surahList } = useApp();
    const titleRef = useRef<HTMLHeadingElement>(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            titleRef.current?.focus();
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    const lastReadSurah = useMemo(() => {
        if (!lastReadPosition || !surahList.length) return null;
        return surahList.find(s => s.number === lastReadPosition.surahNumber);
    }, [lastReadPosition, surahList]);

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
            title: "حصن المسلم",
            description: "أذكار وأدعية مختارة",
            icon: ShieldIcon,
            action: () => navigateTo('hisn-al-muslim'),
            color: 'text-blue-500',
        },
        {
            title: "الحديث الشريف",
            description: "تصفح صحيح البخاري",
            icon: BookOpenIcon,
            action: () => navigateTo('hadith'),
            color: 'text-teal-500',
        },
        {
            title: "البحث",
            description: "ابحث عن آية أو كلمة",
            icon: SearchIcon,
            action: showSearch,
            color: 'text-violet-500',
        },
        {
            title: "العلامات المرجعية",
            description: "العودة إلى آياتك المحفوظة",
            icon: BookmarkIcon,
            action: () => navigateTo('bookmarks'),
            color: 'text-blue-500',
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

            {lastReadSurah && lastReadPosition && (
                <div className="mb-8">
                    <button 
                        onClick={() => navigateTo('reader', { surahNumber: lastReadPosition.surahNumber, ayahNumber: lastReadPosition.ayahNumber })}
                        className="w-full group p-6 bg-green-50 dark:bg-green-900/50 rounded-2xl shadow-sm text-right hover:shadow-lg hover:-translate-y-1.5 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-green-500/50 dark:focus:ring-green-400/50 flex items-center gap-4"
                    >
                        <ClockIcon className="w-10 h-10 text-green-500" />
                        <div>
                            <h2 className="text-xl font-bold text-green-800 dark:text-green-200">آخر ما قرأت</h2>
                            <p className="text-slate-600 dark:text-slate-300 mt-1">
                                {`سورة ${lastReadSurah.name} - آية ${lastReadPosition.ayahNumber}`}
                            </p>
                        </div>
                    </button>
                </div>
            )}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {menuItems.map((item) => (
                    <button 
                        key={item.title}
                        onClick={item.action}
                        className="group p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-sm text-right hover:shadow-lg hover:-translate-y-1.5 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-green-500/50 dark:focus:ring-green-400/50"
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