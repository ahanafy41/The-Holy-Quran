import React from 'react';
import { SavedSection, SurahSimple } from '../types';
import { useAppContext } from '../context/AppContext';
import { FlowerIcon, PlayIcon, ArrowRightIcon, TrashIcon, MicrophoneIcon } from './Icons';

interface MemorizationAndSectionsPageProps {
  navigate: (page: string) => void;
}

export const MemorizationAndSectionsPage: React.FC<MemorizationAndSectionsPageProps> = ({ navigate }) => {
  const { savedSections, deleteSavedSection, setSelectedSavedSection } = useAppContext();

  const playSection = (section: SavedSection) => {
    setSelectedSavedSection(section);
    // Navigation or state change to show player view
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Memorization Sections</h1>
      {savedSections.length === 0 ? (
        <p>No sections saved yet.</p>
      ) : (
        <ul>
          {savedSections.map(section => (
            <li key={section.id} className="p-2 border-b flex justify-between items-center">
              <span>{section.name}</span>
              <div>
                <button onClick={() => playSection(section)} className="p-1"><PlayIcon /></button>
                <button onClick={() => deleteSavedSection(section.id)} className="p-1 text-red-500"><TrashIcon /></button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};