import React from 'react';
import { ArrowDownTrayIcon, ShareIcon, ThreeDotsVerticalIcon } from './Icons';

export const ManualInstallInstructions: React.FC = () => {
  return (
    <div className="p-4 bg-blue-100 dark:bg-blue-900 rounded-lg text-sm">
      <h3 className="font-bold mb-2">To install this app:</h3>
      <p className="mb-2">1. Tap the <ShareIcon /> button (or <ThreeDotsVerticalIcon /> on Android).</p>
      <p>2. Select 'Add to Home Screen' <ArrowDownTrayIcon />.</p>
    </div>
  );
};