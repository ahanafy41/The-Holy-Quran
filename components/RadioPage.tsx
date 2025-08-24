import React from 'react';
import { useAppContext } from '../context/AppContext';
import { ChevronLeftIcon, ArrowRightIcon } from './Icons';

interface RadioPageProps {
  navigate: (page: string) => void;
}

export const RadioPage: React.FC<RadioPageProps> = ({ navigate }) => {
  const { setSelectedRadio } = useAppContext();
  const radios = [{ name: 'Quran Radio', url: '...' }]; // Placeholder

  return (
    <div>
      <header className="p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Radio</h1>
        <button onClick={() => navigate('home')}><ChevronLeftIcon /></button>
      </header>
      <ul>
        {radios.map(radio => (
          <li key={radio.name} onClick={() => setSelectedRadio(radio)} className="p-4 border-b flex justify-between items-center">
            <span>{radio.name}</span>
            <ArrowRightIcon />
          </li>
        ))}
      </ul>
    </div>
  );
};