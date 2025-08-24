import React from 'react';
import { XMarkIcon } from './Icons';

interface ErrorToastProps {
  message: string;
  onClose: () => void;
}

export const ErrorToast: React.FC<ErrorToastProps> = ({ message, onClose }) => {
  return (
    <div className="fixed top-5 right-5 bg-red-500 text-white p-3 rounded-lg shadow-lg flex items-center gap-2">
      <span>{message}</span>
      <button onClick={onClose}><XMarkIcon /></button>
    </div>
  );
};