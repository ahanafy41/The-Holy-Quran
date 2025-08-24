import React from 'react';
import { useAppContext } from '../context/AppContext';
import { XMarkIcon } from './Icons';

export const SettingsModal: React.FC = () => {
  const { showSettingsModal, setShowSettingsModal, fontSize, setFontSize } = useAppContext();

  if (!showSettingsModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg w-11/12 max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Settings</h2>
          <button onClick={() => setShowSettingsModal(false)}><XMarkIcon /></button>
        </div>
        <div>
          <label htmlFor="fontSize" className="block mb-2">Font Size: {fontSize}px</label>
          <input
            id="fontSize"
            type="range"
            min="12"
            max="40"
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
};