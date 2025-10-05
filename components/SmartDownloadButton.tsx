import React, { useState, useEffect, useCallback } from 'react';
import * as Downloader from '../services/downloadManager';
import { DownloadIcon, CheckCircleIcon, AlertTriangleIcon } from './Icons';
import { Spinner } from './Spinner';

// Define the possible states for the download button
export type DownloadState = 'idle' | 'checking' | 'downloading' | 'completed' | 'error';

interface SmartDownloadButtonProps {
  // A unique identifier for the content to be downloaded
  itemId: string;
  // A friendly name for the item, used for metadata
  itemName: string;
  // The type of content, used for metadata
  itemType: Downloader.DownloadedItem['type'];
  // A function that returns a promise with the list of URLs to download
  getUrlsToDownload: () => Promise<string[]>;
  // A callback for when the download state changes, useful for parent components
  onStateChange?: (newState: DownloadState) => void;
}

const SmartDownloadButton: React.FC<SmartDownloadButtonProps> = ({
  itemId,
  itemName,
  itemType,
  getUrlsToDownload,
  onStateChange,
}) => {
  const [downloadState, setDownloadState] = useState<DownloadState>('checking');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const setState = (newState: DownloadState) => {
    setDownloadState(newState);
    onStateChange?.(newState);
  };

  useEffect(() => {
    // Check the initial state of the item when the component mounts
    const checkStatus = async () => {
      try {
        const isDownloaded = await Downloader.getDownloadedItem(itemId);
        setState(isDownloaded ? 'completed' : 'idle');
      } catch (err) {
        console.error(`Failed to check status for ${itemId}`, err);
        setError('فشل التحقق من حالة التحميل');
        setState('error');
      }
    };
    checkStatus();
  }, [itemId]);

  const handleDownload = async () => {
    if (downloadState !== 'idle' && downloadState !== 'error') return;

    setState('downloading');
    setProgress(0);
    setError(null);

    try {
      const urls = await getUrlsToDownload();
      if (!urls || urls.length === 0) {
        throw new Error("No files to download.");
      }

      const totalSize = await Downloader.downloadAndCacheFiles(urls, (p) => setProgress(p));

      const metadata: Downloader.DownloadedItem = {
        id: itemId,
        name: itemName,
        type: itemType,
        urls: urls,
        size: totalSize,
        timestamp: Date.now(),
      };
      await Downloader.addDownloadedItem(metadata);

      setState('completed');
    } catch (err: any) {
      console.error(`Download failed for ${itemId}`, err);
      setError(err.message || 'فشل التحميل. يرجى المحاولة مرة أخرى.');
      setState('error');
    }
  };

  // Render logic based on downloadState
  switch (downloadState) {
    case 'checking':
      return <div className="p-2" aria-label="جاري التحقق من حالة التحميل"><Spinner /></div>;
    case 'downloading':
      return (
        <div className="flex items-center justify-center w-10 h-10" role="status" aria-live="polite" aria-label={`جاري التحميل ${progress}%`}>
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            <circle className="text-slate-200 dark:text-slate-700" strokeWidth="4" stroke="currentColor" fill="transparent" r="16" cx="18" cy="18" />
            <circle
              className="text-green-500"
              strokeWidth="4"
              strokeDasharray={`${progress}, 100`}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
              r="16"
              cx="18"
              cy="18"
            />
          </svg>
          <span className="absolute text-xs font-bold text-slate-700 dark:text-slate-200">{progress}</span>
        </div>
      );
    case 'completed':
      return <div className="p-2 text-green-500" aria-label="اكتمل التحميل"><CheckCircleIcon className="w-6 h-6" /></div>;
    case 'error':
      return <button onClick={handleDownload} className="p-2 rounded-full text-red-500 hover:bg-red-100" aria-label={`خطأ في التحميل: ${error}. اضغط للمحاولة مرة أخرى.`}><AlertTriangleIcon className="w-5 h-5" /></button>;
    case 'idle':
    default:
      return <button onClick={handleDownload} className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700" aria-label={`تحميل ${itemName}`}><DownloadIcon className="w-5 h-5" /></button>;
  }
};

export default SmartDownloadButton;