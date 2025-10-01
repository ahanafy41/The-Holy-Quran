
import React from 'react';
import { useApp } from '../context/AppContext';
import { BookmarkIcon, TrashIcon, BookOpenIcon } from './Icons';

/**
 * `BookmarksPage` is a component that displays a list of all the user's saved bookmarks.
 * It provides options to navigate to the bookmarked ayah in the reader view or to delete a bookmark.
 *
 * @component
 * @returns {React.ReactElement} A page listing the user's saved bookmarks.
 */
export const BookmarksPage: React.FC = () => {
    const { bookmarks, removeBookmark, navigateTo, surahList } = useApp();

    /**
     * A helper function to get the name of a surah from its number.
     * @param {number} surahNumber - The number of the surah.
     * @returns {string} The name of the surah or a default string if not found.
     */
    const getSurahName = (surahNumber: number) => {
        const surah = surahList.find(s => s.number === surahNumber);
        return surah ? surah.name : 'سورة غير معروفة';
    };

    return (
        <div className="max-w-4xl mx-auto">
            <header className="mb-8 text-center">
                <div className="inline-block p-4 bg-blue-500 rounded-2xl mb-4">
                    <BookmarkIcon className="w-10 h-10 text-white"/>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-slate-800 dark:text-white">العلامات المرجعية</h1>
                <p className="text-lg text-slate-600 dark:text-slate-400 mt-2">الآيات التي قمت بحفظها</p>
            </header>

            {bookmarks.length === 0 ? (
                <div className="text-center p-10 bg-white dark:bg-slate-800 rounded-2xl shadow-sm">
                    <p className="text-slate-500 dark:text-slate-400">لم تقم بإضافة أي علامات مرجعية بعد.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {bookmarks.map(bookmark => (
                        <div key={bookmark.id} className="p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm flex items-center justify-between">
                            <div>
                                <p className="font-bold text-lg text-slate-800 dark:text-slate-100">{bookmark.name}</p>
                                <p className="text-slate-600 dark:text-slate-400">
                                    {`سورة ${getSurahName(bookmark.surahNumber)} - آية ${bookmark.ayahNumber}`}
                                </p>
                                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                                    {new Date(bookmark.timestamp).toLocaleString()}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => navigateTo('reader', { surahNumber: bookmark.surahNumber, ayahNumber: bookmark.ayahNumber })}
                                    className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900 rounded-full transition-colors"
                                    aria-label="الذهاب إلى العلامة"
                                >
                                    <BookOpenIcon className="w-6 h-6" />
                                </button>
                                <button 
                                    onClick={() => removeBookmark(bookmark.id)}
                                    className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded-full transition-colors"
                                    aria-label="حذف العلامة"
                                >
                                    <TrashIcon className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
