import React, { useState } from 'react';
import { Ayah } from '../types';
import { useAppContext } from '../context/AppContext';
import AyahActionModal from './AyahActionModal';

interface AyahItemProps {
  ayah: Ayah;
}

const AyahItem: React.FC<AyahItemProps> = ({ ayah }) => {
  const { fontSize } = useAppContext();
  const [showModal, setShowModal] = useState(false);

  const handleLongPress = () => {
    setShowModal(true);
  };

  return (
    <div
      onContextMenu={(e) => { e.preventDefault(); handleLongPress(); }}
      className="p-4 border-b dark:border-gray-700 flex flex-col"
    >
      <p
        className="text-right leading-loose tracking-wide font-quranic"
        style={{ fontSize: `${fontSize}px` }}
        lang="ar"
        dir="rtl"
      >
        {ayah.text}
        <span className="text-sm font-sans px-2">\u{FD3F}{ayah.numberInSurah}\u{FD3E}</span>
      </p>
      {showModal && (
        <AyahActionModal
          ayah={ayah}
          onClose={() => setShowModal(false)}
          isPlaying={false}
          onPlay={() => {}}
        />
      )}
    </div>
  );
};

export default AyahItem;