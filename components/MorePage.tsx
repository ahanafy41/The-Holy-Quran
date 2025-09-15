import React from 'react';
import { useApp } from '../context/AppContext';
import { BookmarkIcon, RadioIcon, FlowerIcon, CogIcon, ShieldIcon, BookOpenIcon, ChevronLeftIcon, SearchIcon } from './Icons';

const MorePage: React.FC = () => {
    const { navigateTo, showSettings, showSearch } = useApp();

    const menuItems = [
        {
            title: "البحث",
            description: "ابحث في القرآن الكريم",
            icon: SearchIcon,
            action: () => showSearch(),
            color: 'text-purple-500',
        },
        {
            title: "العلامات المرجعية",
            description: "العودة إلى آياتك المحفوظة",
            icon: BookmarkIcon,
            action: () => navigateTo('bookmarks'),
            color: 'text-blue-500',
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
            title: "الإعدادات",
            description: "تخصيص القارئ والمظهر",
            icon: CogIcon,
            action: showSettings,
            color: 'text-slate-500',
        },
    ];

    return (
        <div className="max-w-4xl mx-auto">
            <header className="mb-8">
                <h1 tabIndex={-1} className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white focus:outline-none">المزيد</h1>
            </header>

            <div className="space-y-4">
                {menuItems.map((item) => (
                    <button
                        key={item.title}
                        onClick={item.action}
                        className="w-full group p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm text-right flex items-center gap-4 hover:shadow-md hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-green-500/50 dark:focus:ring-green-400/50"
                    >
                        <div className={`p-3 rounded-xl bg-slate-100 dark:bg-slate-700`}>
                            <item.icon className={`w-6 h-6 ${item.color}`} />
                        </div>
                        <div className="flex-grow">
                            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">{item.title}</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{item.description}</p>
                        </div>
                        <ChevronLeftIcon className="w-6 h-6 text-slate-400 group-hover:text-green-500 transition-transform duration-300" />
                    </button>
                ))}
            </div>
        </div>
    );
};

export default MorePage;
