import React from 'react';
import { useAppContext } from '../context/AppContext';
import { PlayIcon, PauseIcon, ClipboardIcon, ShareIcon, SparklesIcon, XMarkIcon, ArrowRightIcon } from './Icons';
import { Ayah } from '../types';

const AyahActionModal: React.FC<{ ayah: Ayah; onClose: () => void; isPlaying: boolean; onPlay: () => void; }> = ({ ayah, onClose, isPlaying, onPlay }) => {
  const { quran, setShowTafsirModal, setSelectedAyah, setShowAIAssistantModal } = useAppContext();

  const surahName = quran.surahs[ayah.surahId - 1].englishName;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(`${ayah.text} [${surahName}:${ayah.numberInSurah}]`);
  };

  const shareAyah = () => {
    if (navigator.share) {
      navigator.share({
        title: `Quran Ayah: ${surahName} ${ayah.numberInSurah}`,
        text: `${ayah.text}`,
        url: window.location.href,
      });
    }
  };

  const openTafsir = () => {
    setSelectedAyah(ayah);
    setShowTafsirModal(true);
    onClose();
  };

  const openAIAssistant = () => {
    setSelectedAyah(ayah);
    setShowAIAssistantModal(true);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-end z-40" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 w-full rounded-t-2xl p-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg">{surahName} : {ayah.numberInSurah}</h3>
          <button onClick={onClose}><XMarkIcon /></button>
        </div>
        <div className="grid grid-cols-3 gap-4 text-center">
          <button onClick={onPlay} className="flex flex-col items-center">{isPlaying ? <PauseIcon /> : <PlayIcon />}<span>{isPlaying ? 'Pause' : 'Play'}</span></button>
          <button onClick={copyToClipboard} className="flex flex-col items-center"><ClipboardIcon /><span>Copy</span></button>
          <button onClick={shareAyah} className="flex flex-col items-center"><ShareIcon /><span>Share</span></button>
        </div>
        <div className="mt-4 border-t pt-4">
          <button onClick={openTafsir} className="w-full flex justify-between items-center p-2"><span>Tafsir</span><ArrowRightIcon /></button>
          <button onClick={openAIAssistant} className="w-full flex justify-between items-center p-2"><span>AI Assistant</span><SparklesIcon /></button>
        </div>
      </div>
    </div>
  );
};

export default AyahActionModal;