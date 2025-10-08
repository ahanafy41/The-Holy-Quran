import React, { useState, useEffect, useRef, useCallback } from 'react';
import FocusTrap from 'focus-trap-react';
import { GoogleGenAI } from '@google/genai';
import { XMarkIcon, PaperAirplaneIcon, SparklesIcon } from './Icons';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import ReactMarkdown from 'react-markdown';
import { Spinner } from './Spinner';


export interface AIContent {
    text: string;
    title: string;
    type: 'ayah' | 'hadith';
}

interface AIAssistantModalProps {
    content: AIContent | null;
    onClose: () => void;
}

/**
 * `AIAssistantModal` provides a simple Q&A interface for users to get an explanation
 * about a specific piece of content (ayah or hadith). It uses a one-shot request
 * to the Google Gemini API for stability.
 */
export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({ content, onClose }) => {
    // Guard clause to prevent crash on exit animation when content becomes null
    if (!content) {
        return null;
    }

    const { apiKey } = useApp();
    const [userInput, setUserInput] = useState('اشرح هذا النص بالتفصيل مع ذكر أي سياق تاريخي أو دروس مستفادة.');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [response, setResponse] = useState<string | null>(null);
    const [model, setModel] = useState<any>(null);

    const modalContentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!apiKey) {
            setError("مفتاح API غير متاح. هذه الميزة معطلة.");
            return;
        }
        try {
            const ai = new GoogleGenAI({ apiKey });
            const generativeModel = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
            setModel(generativeModel);
        } catch (e: any) {
            console.error("Failed to initialize AI Model:", e);
            setError("فشل تهيئة مساعد الذكاء الاصطناعي. قد يكون هناك مشكلة في الإعدادات أو مفتاح الـ API.");
        }
    }, [apiKey]);

    const handleGetExplanation = useCallback(async () => {
        if (!userInput.trim() || isLoading || !model) return;

        setIsLoading(true);
        setError(null);
        setResponse(null);
        
        let systemInstruction = '';
        if (content.type === 'ayah') {
            systemInstruction = `You are a helpful and respectful AI assistant for studying the Holy Quran. Your purpose is to provide clear, accessible explanations based on established Islamic scholarship. Always be reverent. Avoid personal opinions or controversial topics. The user is asking about this specific verse: ${content.title}, which reads: "${content.text}". Frame your answers based on this context. Respond in Arabic.`;
        } else { // hadith
            systemInstruction = `You are a helpful and respectful AI assistant for studying the Hadith. Your purpose is to provide clear, accessible explanations based on established Islamic scholarship. Always be reverent. Avoid personal opinions or controversial topics. The user is asking about this specific hadith: ${content.title}, which reads: "${content.text}". Please provide a detailed explanation based on your extensive knowledge, and if possible, mention or draw upon well-known sources or commentaries to support your explanation. Respond in Arabic.`;
        }

        const fullPrompt = `${systemInstruction}\n\nUser's question: "${userInput}"`;

        try {
            const result = await model.generateContent(fullPrompt);
            const aiResponse = await result.response;
            setResponse(aiResponse.text());
        } catch (e: any) {
            console.error("Detailed AI Error:", e);
            const detailedError = e.message ? `تفاصيل الخطأ: ${e.message}` : "لا توجد تفاصيل إضافية.";
            setError(`عذراً، حدث خطأ ما. ${detailedError}`);
        } finally {
            setIsLoading(false);
        }
    }, [isLoading, model, content, userInput]);

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
                    initialFocus: '#ai-assistant-input',
                }}
            >
                <motion.div ref={modalContentRef} {...modalAnimationProps}
                  onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-slate-800 rounded-none sm:rounded-2xl shadow-xl w-full h-full sm:h-auto sm:max-w-2xl sm:max-h-[90vh] flex flex-col" role="dialog" aria-modal="true" aria-labelledby="ai-assistant-title">
                    <header className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center flex-shrink-0">
                        <div className="flex items-center gap-3">
                             <SparklesIcon className="w-6 h-6 text-green-500"/>
                             <h3 id="ai-assistant-title" className="font-bold text-lg">شرح بالذكاء الاصطناعي</h3>
                        </div>
                        <button onClick={onClose} aria-label="إغلاق" className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"><XMarkIcon className="w-5 h-5" /></button>
                    </header>
                    
                    <div className="p-4 bg-slate-50 dark:bg-slate-900/50 flex-shrink-0 border-b border-slate-200 dark:border-slate-700">
                        <p className="text-sm text-slate-600 dark:text-slate-400">حول {content.title}:</p>
                        <p className={`${content.type === 'ayah' ? 'font-quran' : 'font-serif'} text-xl mt-1 text-right`}>{content.text}</p>
                    </div>

                    <div className="flex-1 p-4 overflow-y-auto">
                        {isLoading && (
                            <div className="flex items-center justify-center gap-2 text-slate-500 dark:text-slate-400">
                                <Spinner />
                                <span>جاري تحليل النص...</span>
                            </div>
                        )}
                        {error && <div className="p-3 text-center text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg" role="alert">{error}</div>}
                        {response && (
                            <div className="max-w-[100%] p-3 rounded-2xl bg-slate-100 dark:bg-slate-700">
                                <ReactMarkdown className="prose prose-sm dark:prose-invert prose-p:whitespace-pre-wrap prose-headings:text-right prose-p:text-right prose-li:text-right">
                                    {response}
                                </ReactMarkdown>
                            </div>
                        )}
                    </div>
                    
                    <footer className="p-4 border-t border-slate-200 dark:border-slate-700 flex-shrink-0">
                        <form onSubmit={(e) => { e.preventDefault(); handleGetExplanation(); }} className="flex items-center gap-2">
                            <input
                                id="ai-assistant-input"
                                type="text" value={userInput} onChange={(e) => setUserInput(e.target.value)}
                                placeholder={isLoading ? "انتظر من فضلك..." : "اطرح سؤالاً..."}
                                disabled={isLoading || !!error || !model}
                                className="w-full h-11 px-4 rounded-full bg-slate-100 dark:bg-slate-700 border-2 border-transparent focus:outline-none focus:ring-2 focus:ring-green-500 transition text-right"
                                aria-label="اطرح سؤالاً"
                            />
                            <button type="submit" disabled={!userInput.trim() || isLoading || !!error || !model}
                                className="w-11 h-11 bg-green-600 text-white rounded-full hover:bg-green-700 disabled:bg-slate-400 disabled:cursor-not-allowed flex-shrink-0 flex items-center justify-center transition-colors"
                                aria-label="احصل على شرح">
                                <PaperAirplaneIcon className="w-5 h-5"/>
                            </button>
                        </form>
                    </footer>
                </motion.div>
            </FocusTrap>
        </div>
    );
};