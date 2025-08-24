import React, { useState } from 'react';
import { SavedSection, SurahSimple } from '../types';
import { useAppContext } from '../context/AppContext';
import { XMarkIcon } from './Icons';

interface CreateSectionModalProps {
  onClose: () => void;
}

export const CreateSectionModal: React.FC<CreateSectionModalProps> = ({ onClose }) => {
  const { surahsSimple, addSavedSection } = useAppContext();
  const [name, setName] = useState('');
  const [startSurah, setStartSurah] = useState(1);
  const [startAyah, setStartAyah] = useState(1);
  const [endSurah, setEndSurah] = useState(1);
  const [endAyah, setEndAyah] = useState(7);

  const handleSave = () => {
    if (name.trim()) {
      addSavedSection({ name, startSurah, startAyah, endSurah, endAyah });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg w-11/12 max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">New Section</h2>
          <button onClick={onClose}><XMarkIcon /></button>
        </div>
        {/* Form fields would go here */}
        <button onClick={handleSave} className="w-full bg-blue-500 text-white p-2 rounded mt-4">Save</button>
      </div>
    </div>
  );
};