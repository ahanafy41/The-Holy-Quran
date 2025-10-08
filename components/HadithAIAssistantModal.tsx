import React, { useState, useEffect, useRef, useCallback } from 'react';
import FocusTrap from 'focus-trap-react';
import { GoogleGenAI } from '@google/genai';
import { Hadith } from '../types';
import { XMarkIcon, SparklesIcon } from './Icons';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';

/**
 * @interface HadithAIAssistantModalProps
 * @description Defines the props for the HadithAIAssistantModal component.
 */
interface HadithAIAssistantModalProps {
    /** The Hadith object that is the context for the explanation. */
    hadith: Hadith;
    /** A callback function to be invoked when the modal should be closed. */
    onClose: () => void;
}

/**
 * `HadithAIAssistantModal` provides an AI-powered explanation for a specific hadith.
 * It uses the Google Gemini API with web search grounding for generating the explanation.
 *
 * @component
 * @param {HadithAIAssistantModalProps} props - The props for the component.
 * @returns {React.ReactElement} A modal dialog for the AI Assistant explanation.
 */
export const HadithAIAssistantModal: React.FC<HadithAIAssistantModalProps> = ({ hadith, onClose }) => {
    const { apiKey } = useApp();
    const [explanation, setExplanation] = useState<string>('');
    const [isResponding, setIsResponding] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const modalContentRef = useRef<HTMLDivElement>(null);
    const explanationRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (explanation) {
            explanationRef.current?.focus();
        }
    }, [explanation]);

    const handleExplain = useCallback(async () => {
        if (isResponding || !apiKey) {
            if (!apiKey) {
                setError("مفتاح API غير متاح. يرجى إضافته في الإعدادات.");
            }
            return;
        }

        setIsResponding(true);
        setError(null);
        setExplanation('');

        try {
            const ai = new GoogleGenAI(apiKey);
            const model = ai.getGenerativeModel({
                model: 'gemini-2.5-flash',
                tools: [{ googleSearch: {} }],
                systemInstruction: `You are a helpful and respectful AI assistant for studying the Hadith (prophetic traditions). Your purpose is to provide a clear, accessible explanation for the provided hadith, grounded in established Islamic scholarship and supplemented with web search for context and accuracy. Always be reverent. Avoid personal opinions or controversial topics. Respond in Arabic.`,
            });

            const prompt = `اشرح هذا الحديث: "${hadith.arabic}"`;
            const resultStream = await model.generateContentStream(prompt);

            for await (const chunk of resultStream.stream) {
                const chunkText = chunk.text();
                setExplanation(prev => prev + chunkText);
            }

        } catch (e) {
            console.error("Error generating explanation:", e);
            setError("عذراً، حدث خطأ ما أثناء شرح الحديث. يرجى المحاولة مرة أخرى.");
        } finally {
            setIsResponding(false);
        }
    }, [isResponding, apiKey, hadith]);

    const modalAnimationProps = {
        initial: {scale: 0.95, opacity: 0},
        animate: {scale: 1, opacity: 1},
        exit: {scale: 0.95, opacity: 0}
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-0 sm:p-4" onClick={onClose} role="presentation">
            <FocusTrap
                active
                focusTrapOptions={{
                    onDeactivate: onClose,
                    clickOutsideDeactivates: true,
                    initialFocus: modalContentRef.current || undefined,
                }}
            >
                <motion.div ref={modalContentRef} {...modalAnimationProps}
                  onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-slate-800 rounded-none sm:rounded-2xl shadow-xl w-full h-full sm:h-auto sm:max-w-2xl sm:max-h-[90vh] flex flex-col" role="dialog" aria-modal="true" aria-labelledby="ai-assistant-title">
                    <header className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center flex-shrink-0">
                        <div className="flex items-center gap-3">
                             <SparklesIcon className="w-6 h-6 text-green-500"/>
                             <h3 id="ai-assistant-title" className="font-bold text-lg">شرح الحديث بالذكاء الاصطناعي</h3>
                        </div>
                        <button onClick={onClose} aria-label="إغلاق" className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"><XMarkIcon className="w-5 h-5" /></button>
                    </header>

                    <div className="p-4 bg-slate-50 dark:bg-slate-900/50 flex-shrink-0">
                        <p className="font-serif text-lg leading-loose text-slate-800 dark:text-slate-200 text-right">{hadith.arabic}</p>
                    </div>

                    <div className="flex-1 p-4 overflow-y-auto space-y-4" aria-live="polite">
                        <AnimatePresence>
                        {!explanation && !isResponding && !error && (
                            <div className="text-center py-8">
                                <button
                                    onClick={handleExplain}
                                    disabled={isResponding || !apiKey}
                                    className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 mx-auto disabled:bg-slate-400 disabled:cursor-not-allowed"
                                >
                                    <SparklesIcon className="w-5 h-5" />
                                    شرح الحديث بالذكاء الاصطناعي
                                </button>
                            </div>
                        )}
                        </AnimatePresence>

                        {isResponding && !explanation && (
                             <div className="flex items-start justify-center gap-2.5" role="status">
                                 <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-700">
                                     <div className="flex gap-1.5 items-center" aria-hidden="true">
                                        <p>جاري الشرح...</p>
                                        <span className="h-2 w-2 bg-slate-400 rounded-full animate-pulse [animation-delay:-0.3s]"></span>
                                        <span className="h-2 w-2 bg-slate-400 rounded-full animate-pulse [animation-delay:-0.15s]"></span>
                                        <span className="h-2 w-2 bg-slate-400 rounded-full animate-pulse"></span>
                                     </div>
                                     <span className="sr-only">المساعد يكتب...</span>
                                 </div>
                             </div>
                        )}

                        {explanation && (
                            <div ref={explanationRef} tabIndex={-1} className="p-3 bg-slate-100 dark:bg-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
                                <p className="whitespace-pre-wrap text-right leading-relaxed">{explanation}</p>
                            </div>
                        )}

                        {error && <div className="p-3 text-center text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg" role="alert">{error}</div>}
                    </div>
                </motion.div>
            </FocusTrap>
        </div>
    );
};