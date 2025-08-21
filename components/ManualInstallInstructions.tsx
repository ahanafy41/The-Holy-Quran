
import React, { useState, useEffect } from 'react';
import { ArrowDownTrayIcon, ShareIcon, ThreeDotsVerticalIcon } from './Icons';

const InstructionStep: React.FC<{ icon: React.FC<{className?: string}>, text: string }> = ({ icon: Icon, text }) => (
    <li className="flex items-center gap-4">
        <div className="flex-shrink-0 w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center justify-center">
            <Icon className="w-6 h-6 text-slate-600 dark:text-slate-300" />
        </div>
        <span className="font-medium text-slate-700 dark:text-slate-200">{text}</span>
    </li>
);

export const ManualInstallInstructions: React.FC = () => {
    const [platform, setPlatform] = useState<'desktop' | 'android' | 'ios' | 'unknown'>('unknown');

    useEffect(() => {
        const ua = navigator.userAgent;
        if (/android/i.test(ua)) {
            setPlatform('android');
        } else if (/iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream) {
            setPlatform('ios');
        } else {
            // Default to desktop instructions as they are most likely for non-mobile.
            setPlatform('desktop');
        }
    }, []);

    const renderInstructions = () => {
        switch (platform) {
            case 'desktop':
                return (
                    <>
                        <p className="mb-4 text-sm text-center">يمكنك تثبيت التطبيق يدوياً من متصفحك مباشرة.</p>
                        <ol className="space-y-3 text-right">
                            <InstructionStep icon={ArrowDownTrayIcon} text="ابحث عن أيقونة التثبيت في شريط العنوان." />
                            <InstructionStep icon={ThreeDotsVerticalIcon} text="أو افتح القائمة (ثلاث نقاط) واختر 'تثبيت التطبيق'." />
                        </ol>
                    </>
                );
            case 'android':
                return (
                    <>
                        <p className="mb-4 text-sm text-center">لتثبيت التطبيق على جهازك، اتبع الخطوات التالية:</p>
                        <ol className="space-y-3 text-right">
                            <InstructionStep icon={ThreeDotsVerticalIcon} text="اضغط على زر القائمة (ثلاث نقاط) في المتصفح." />
                            <InstructionStep icon={ArrowDownTrayIcon} text="اختر 'تثبيت التطبيق' أو 'إضافة إلى الشاشة الرئيسية'." />
                        </ol>
                    </>
                );
            case 'ios':
                return (
                    <>
                         <p className="mb-4 text-sm text-center">لتثبيت التطبيق على جهازك، اتبع الخطوات التالية:</p>
                        <ol className="space-y-3 text-right">
                           <InstructionStep icon={ShareIcon} text="اضغط على زر المشاركة في شريط الأدوات." />
                           <InstructionStep icon={ArrowDownTrayIcon} text="مرر للأسفل واختر 'إضافة إلى الشاشة الرئيسية'." />
                        </ol>
                    </>
                );
            default:
                 return <p className="text-center text-sm">للتثبيت، ابحث عن خيار "تثبيت" أو "إضافة إلى الشاشة الرئيسية" في قائمة متصفحك.</p>;
        }
    }

    return (
        <div className="p-4 bg-slate-100 dark:bg-slate-700/50 rounded-lg">
            {renderInstructions()}
        </div>
    );
};
