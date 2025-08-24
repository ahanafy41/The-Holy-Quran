import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/genai';
import { XMarkIcon, PaperAirplaneIcon, SparklesIcon } from './Icons';
import { useAppContext } from '../context/AppContext';
import { Ayah } from '../types';

const AIAssistantModal: React.FC = () => {
  const { showAIAssistantModal, setShowAIAssistantModal, selectedAyah, quran } = useAppContext();
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

  useEffect(() => {
    if (selectedAyah) {
      const surah = quran.surahs[selectedAyah.surahId - 1];
      const initialPrompt = `Explain tafsir for this ayah: "${selectedAyah.text}" from Surah ${surah.englishName} (${surah.name}), Ayah ${selectedAyah.numberInSurah}.`;
      setPrompt(initialPrompt);
    }
  }, [selectedAyah, quran]);

  const handleSend = async () => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    setResponse('');
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      setResponse(text);
    } catch (error) {
      console.error('Error with Generative AI:', error);
      setResponse('Sorry, I encountered an error.');
    }
    setIsLoading(false);
  };

  if (!showAIAssistantModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-end z-50">
      <div ref={modalRef} className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-t-2xl p-4 flex flex-col h-[80vh]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2"><SparklesIcon /> AI Assistant</h2>
          <button onClick={() => setShowAIAssistantModal(false)}><XMarkIcon /></button>
        </div>
        <div className="flex-grow overflow-y-auto mb-4 p-2 bg-gray-100 dark:bg-gray-700 rounded">
          {response ? (
            <p className="whitespace-pre-wrap">{response}</p>
          ) : (
             selectedAyah && <p className="text-gray-500">Ask about Ayah {selectedAyah.numberInSurah} of Surah {quran.surahs[selectedAyah.surahId - 1].englishName}...</p>
          )}
          {isLoading && <p>Thinking...</p>}
        </div>
        <div className="flex items-center gap-2">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
            placeholder="Ask something..."
            rows={2}
          />
          <button onClick={handleSend} disabled={isLoading} className="p-2 bg-blue-500 text-white rounded disabled:bg-gray-400">
            <PaperAirplaneIcon />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIAssistantModal;