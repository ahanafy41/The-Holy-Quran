
import React from 'react';

export const SettingSelect: React.FC<React.PropsWithChildren<{id: string; label: string; value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;}>> = ({id, label, children, ...props}) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium mb-1">{label}</label>
        <select id={id} {...props} className="w-full p-2.5 rounded-md bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-green-500">
            {children}
        </select>
    </div>
);
