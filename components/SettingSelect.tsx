
import React from 'react';

/**
 * `SettingSelect` is a reusable, styled select input component designed for use in settings forms.
 * It includes a label and standard select input styling consistent with the application's design.
 *
 * @component
 * @param {object} props - The component props, including standard select attributes and children.
 * @param {string} props.id - The unique ID for the select element and its corresponding label.
 * @param {string} props.label - The text to be displayed in the label for the select input.
 * @returns {React.ReactElement} A styled select input with a label.
 */
export const SettingSelect: React.FC<React.PropsWithChildren<{id: string; label: string; value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;}>> = ({id, label, children, ...props}) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium mb-1">{label}</label>
        <select id={id} {...props} className="w-full p-2.5 rounded-md bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-green-500">
            {children}
        </select>
    </div>
);
