import React, { useState, useEffect, useRef } from 'react';
import FocusTrap from 'focus-trap-react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { getHadithExplanation } from '../src/services/ai';
import type { Hadith } from '../types';
import { XMarkIcon, SparklesIcon, BookOpenIcon } from './Icons';
import { Spinner } from './Spinner';

/**
 * @interface HadithAiExplanationModalProps
 * @description Props لمكون مودال شرح الحديث.
 */
interface HadithAiExplanationModalProps {
  /** الحديث المطلوب شرحه. */
  hadith: Hadith | null;
  /** دالة لإغلاق المودال. */
  onClose: () => void;
}

/**
 * `HadithAiExplanationModal` هو مودال بيعرض شرح للحديث باستخدام الذكاء الاصطناعي.
 *
 * @component
 * @param {HadithAiExplanationModalProps} props - الـ props بتاعة المكون.
 * @returns {React.ReactElement | null} مودال لعرض شرح الحديث.
 */
export const HadithAiExplanationModal: React.FC<HadithAiExplanationModalProps> = ({ hadith, onClose }) => {
  const { apiKey } = useApp();
  const [explanation, setExplanation] = useState('');
  const [sources, setSources] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // لو مفيش حديث أو مفتاح API، مش هنعمل حاجة
    if (!hadith || !apiKey) {
      if (!apiKey) setError("مفتاح API غير متوفر. هذه الميزة معطلة.");
      return;
    }

    const fetchExplanation = async () => {
      setIsLoading(true);
      setError(null);
      setExplanation('');
      setSources([]);

      const result = await getHadithExplanation(apiKey, hadith.arabic);

      if (result.error) {
        setError("عذراً، حدث خطأ أثناء شرح الحديث. يرجى المحاولة مرة أخرى.");
        console.error("AI Explanation Error:", result.error);
        setIsLoading(false);
        return;
      }

      try {
        // هنعرض الشرح اللي بيرجع بشكل تدريجي (stream)
        for await (const chunk of result.stream) {
          const chunkText = chunk.text();
          setExplanation((prev) => prev + chunkText);
        }

        // بعد انتهاء الـ stream، هنجيب المصادر من الرد الكامل
        const fullResponse = await result.fullResponse;
        const groundingMetadata = fullResponse.candidate?.groundingMetadata;
        if (groundingMetadata?.webSearchQueries?.length > 0 && groundingMetadata?.groundingAttributions?.length > 0) {
          setSources(groundingMetadata.groundingAttributions);
        }

      } catch (e) {
        setError("عذراً، حدث خطأ أثناء عرض الشرح.");
        console.error("Streaming Error:", e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExplanation();
  }, [hadith, apiKey]);

  if (!hadith) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose} role="presentation">
      <FocusTrap active focusTrapOptions={{ onDeactivate: onClose, clickOutsideDeactivates: true }}>
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col"
          role="dialog"
          aria-modal="true"
          aria-labelledby="ai-explanation-title"
        >
          <header className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center flex-shrink-0">
            <div className="flex items-center gap-3">
              <SparklesIcon className="w-6 h-6 text-green-500" />
              <h3 id="ai-explanation-title" className="font-bold text-lg">شرح الحديث بالذكاء الاصطناعي</h3>
            </div>
            <button onClick={onClose} aria-label="إغلاق" className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
              <XMarkIcon className="w-5 h-5" />
            </button>
          </header>

          <div className="p-4 bg-slate-50 dark:bg-slate-900/50 flex-shrink-0">
            <p className="font-quran text-lg mt-1 text-right leading-relaxed">{hadith.arabic}</p>
          </div>

          <div className="flex-1 p-4 overflow-y-auto" dir="rtl">
            {isLoading && !explanation && (
              <div className="flex justify-center items-center h-full flex-col gap-4">
                <Spinner />
                <p className="text-slate-500 dark:text-slate-400">جاري توليد الشرح...</p>
              </div>
            )}
            {error && (
              <div className="p-4 text-center text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg" role="alert">
                {error}
              </div>
            )}
            {explanation && (
              <div className="whitespace-pre-wrap text-right leading-relaxed text-slate-800 dark:text-slate-200">
                {explanation}
              </div>
            )}
            {sources.length > 0 && (
              <div className="mt-6 border-t border-slate-200 dark:border-slate-700 pt-4">
                <h4 className="font-bold flex items-center gap-2">
                  <BookOpenIcon className="w-5 h-5" />
                  المصادر
                </h4>
                <ul className="list-inside list-disc mt-2 space-y-1 text-sm">
                  {sources.map((source, index) => (
                    <li key={index}>
                      <a href={source.web.uri} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">
                        {source.web.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </motion.div>
      </FocusTrap>
    </div>
  );
};