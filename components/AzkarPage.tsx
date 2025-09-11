import React, { useEffect, useState, useRef } from 'react';
import azkarData from '../azkar-data/azkar.json';

interface AzkarItem {
  id: number;
  text: string;
  count: number;
  audio: string;
  filename: string;
}

interface AzkarCategory {
  id: number;
  category: string;
  audio: string;
  filename: string;
  array: AzkarItem[];
}

const AzkarPage: React.FC = () => {
  const [azkar, setAzkar] = useState<AzkarCategory[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentAudio, setCurrentAudio] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  useEffect(() => {
    setAzkar(azkarData);
  }, []);

  const playAudio = (audioPath: string) => {
    // If the same audio is already playing, pause it.
    if (isPlaying && currentAudio === audioPath) {
      if (audioRef.current) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
      return;
    }

    // If a different audio is playing, stop it before starting the new one.
    if (audioRef.current) {
      audioRef.current.pause();
    }

    try {
      const audioUrl = new URL(`../azkar-data${audioPath}`, import.meta.url).href;
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.play().catch(e => console.error("Error playing audio:", e));

      setCurrentAudio(audioPath);
      setIsPlaying(true);

      audio.onended = () => {
        setIsPlaying(false);
        setCurrentAudio(null);
      };
      audio.onerror = (e) => {
        console.error(`Error with audio playback:`, e);
        setIsPlaying(false);
        setCurrentAudio(null);
      }
    } catch (error) {
      console.error('Error creating audio URL:', error);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">حصن المسلم</h1>
      <div className="space-y-8">
        {azkar.map((category) => (
          <div key={category.id} className="p-4 border rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-2 flex justify-between items-center">
              {category.category}
              {category.audio && (
                <button
                  onClick={() => playAudio(category.audio)}
                  className="bg-green-500 text-white px-3 py-1 rounded-full text-sm"
                >
                  {currentAudio === category.audio && isPlaying ? 'إيقاف' : 'تشغيل الفئة'}
                </button>
              )}
            </h2>
            <div className="space-y-4">
              {category.array.map((item) => (
                <div key={item.id} className="p-3 border rounded-md bg-gray-50 dark:bg-gray-800">
                  <p className="text-gray-700 dark:text-gray-300 mb-2">{item.text}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">العدد: {item.count}</p>
                  {item.audio && (
                    <button
                      onClick={() => playAudio(item.audio)}
                      className="mt-2 bg-blue-500 text-white px-3 py-1 rounded-full text-sm"
                    >
                      {currentAudio === item.audio && isPlaying ? 'إيقاف' : 'تشغيل'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AzkarPage;
