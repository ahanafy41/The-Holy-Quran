
import React, { useState, useEffect, useRef, useCallback } from 'react';
import FocusTrap from 'focus-trap-react';
import { GoogleGenAI, Chat } from '@google/genai';
import { Ayah } from '../types';
import { XMarkIcon, PaperAirplaneIcon, SparklesIcon } from './Icons';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../App';


interface AIAssistantModalProps {
    ayah: Ayah;
    onClose: () => void;
}

type Message = {
    role: 'user' | 'model';
    text: string;
};

const MotionDiv = motion('div');

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({ ayah, onClose }) => {
    const { apiKey } = useApp();
    const [messages, setMessages] = useState<Message[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isResponding, setIsResponding] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [chat, setChat] = useState<Chat | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const modalContentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isResponding]);
    
    useEffect(() => {
        if (!apiKey) {
            setError("مفتاح API غير متاح. هذه الميزة معطلة.");
            return;
        }
        const ai = new GoogleGenAI({ apiKey });
        const systemInstruction = `You are a helpful and respectful AI assistant for studying the Holy Quran. Your purpose is to provide clear, accessible explanations based on established Islamic scholarship. Always be reverent. Avoid personal opinions or controversial topics. The user is asking about this specific verse: Surah ${ayah.surah?.englishName} (${ayah.surah?.number}:${ayah.numberInSurah}), which reads: "${ayah.text}". Frame your answers based on this context. Respond in Arabic.`;
        const newChat = ai.chats.create({ model: 'gemini-2.5-flash', config: { systemInstruction } });
        setChat(newChat);
    }, [ayah, apiKey]);

    const handleSend = useCallback(async (prompt: string) => {
        if (!prompt.trim() || isResponding || !chat) return;

        setUserInput('');
        setMessages(prev => [...prev, { role: 'user', text: prompt }]);
        setIsResponding(true);
        setError(null);
        
        try {
            const resultStream = await chat.sendMessageStream({ message: prompt });
            setMessages(prev => [...prev, { role: 'model', text: '' }]);
            for await (const chunk of resultStream) {
                setMessages(prev => {
                    const lastMsgIndex = prev.length - 1;
                    const updatedMessages = [...prev];
                    const lastMessage = updatedMessages[lastMsgIndex];
                    // Create a new object to avoid state mutation
                    updatedMessages[lastMsgIndex] = { ...lastMessage, text: lastMessage.text + chunk.text };
                    return updatedMessages;
                });
            }
        } catch (e) {
            setError("عذراً، حدث خطأ ما. يرجى المحاولة مرة أخرى.");
        } finally {
            setIsResponding(false);
        }
    }, [isResponding, chat]);
    
    const suggestionPrompts = ["اشرح هذه الآية بعبارات بسيطة", "ما هو السياق التاريخي؟", "ما هي الدروس الرئيسية من هذه الآية؟"];

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
                <MotionDiv ref={modalContentRef} layout initial={{scale: 0.95, opacity: 0}} animate={{scale: 1, opacity: 1}} exit={{scale: 0.95, opacity: 0}}
                  onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-slate-800 rounded-none sm:rounded-2xl shadow-xl w-full h-full sm:h-auto sm:max-w-2xl sm:max-h-[90vh] flex flex-col" role="dialog" aria-modal="true" aria-labelledby="ai-assistant-title">
                    <header className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center flex-shrink-0">
                        <div className="flex items-center gap-3">
                             <SparklesIcon className="w-6 h-6 text-green-500"/>
                             <h3 id="ai-assistant-title" className="font-bold text-lg">مساعد الذكاء الاصطناعي</h3>
                        </div>
                        <button onClick={onClose} aria-label="إغلاق" className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"><XMarkIcon className="w-5 h-5" /></button>
                    </header>
                    
                    <div className="p-4 bg-slate-50 dark:bg-slate-900/50 flex-shrink-0">
                        <p className="text-sm text-slate-600 dark:text-slate-400">حول سورة {ayah.surah?.englishName}، الآية {ayah.numberInSurah}:</p>
                        <p className="font-quran text-xl mt-1 text-right">{ayah.text}</p>
                    </div>

                    <div className="flex-1 p-4 overflow-y-auto space-y-4" aria-live="polite">
                        <AnimatePresence>
                        {messages.length === 0 && !isResponding && (
                            <MotionDiv initial={{opacity:0}} animate={{opacity:1}} className="text-center text-slate-500 dark:text-slate-400 py-8">
                                <p className="mb-4">كيف يمكنني مساعدتك في فهم هذه الآية؟</p>
                                <div className="flex flex-wrap justify-center gap-2">
                                    {suggestionPrompts.map(prompt => (
                                        <button key={prompt} onClick={() => handleSend(prompt)}
                                            className="px-3 py-2 text-sm bg-slate-100 dark:bg-slate-700 rounded-full hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors">
                                            {prompt}
                                        </button>
                                    ))}
                                </div>
                            </MotionDiv>
                        )}
                        </AnimatePresence>
                        {messages.map((msg, index) => (
                            <MotionDiv key={index} initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}}
                             className={`flex items-start gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                {msg.role === 'model' && <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0"><SparklesIcon className="w-5 h-5 text-white"/></div>}
                                <div className={`max-w-[85%] p-3 rounded-2xl ${msg.role === 'user' ? 'bg-green-600 text-white rounded-br-lg' : 'bg-slate-100 dark:bg-slate-700 rounded-bl-lg'}`}>
                                    <p className="whitespace-pre-wrap text-right leading-relaxed">{msg.text}</p>
                                </div>
                            </MotionDiv>
                        ))}
                        {isResponding && messages[messages.length - 1]?.role !== 'model' && (
                             <MotionDiv initial={{opacity: 0}} animate={{opacity: 1}} className="flex items-start gap-2.5 justify-start" role="status">
                                 <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0" aria-hidden="true">
                                     <SparklesIcon className="w-5 h-5 text-white"/>
                                 </div>
                                 <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-700 rounded-bl-lg">
                                     <div className="flex gap-1.5 items-center" aria-hidden="true">
                                        <span className="h-2 w-2 bg-slate-400 rounded-full animate-pulse [animation-delay:-0.3s]"></span>
                                        <span className="h-2 w-2 bg-slate-400 rounded-full animate-pulse [animation-delay:-0.15s]"></span>
                                        <span className="h-2 w-2 bg-slate-400 rounded-full animate-pulse"></span>
                                     </div>
                                     <span className="sr-only">المساعد يكتب...</span>
                                 </div>
                             </MotionDiv>
                        )}
                        {error && <div className="p-3 text-center text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg" role="alert">{error}</div>}
                        <div ref={messagesEndRef} />
                    </div>
                    
                    <footer className="p-4 border-t border-slate-200 dark:border-slate-700 flex-shrink-0">
                        <form onSubmit={(e) => { e.preventDefault(); handleSend(userInput); }} className="flex items-center gap-2">
                            <input
                                id="ai-assistant-input"
                                type="text" value={userInput} onChange={(e) => setUserInput(e.target.value)}
                                placeholder={isResponding ? "انتظر من فضلك..." : "اطرح سؤالاً..."}
                                disabled={isResponding || !!error}
                                className="w-full h-11 px-4 rounded-full bg-slate-100 dark:bg-slate-700 border-2 border-transparent focus:outline-none focus:ring-2 focus:ring-green-500 transition text-right"
                                aria-label="اطرح سؤالاً"
                            />
                            <button type="submit" disabled={!userInput.trim() || isResponding || !!error}
                                className="w-11 h-11 bg-green-600 text-white rounded-full hover:bg-green-700 disabled:bg-slate-400 disabled:cursor-not-allowed flex-shrink-0 flex items-center justify-center transition-colors"
                                aria-label="إرسال الرسالة">
                                <PaperAirplaneIcon className="w-5 h-5"/>
                            </button>
                        </form>
                    </footer>
                </MotionDiv>
            </FocusTrap>
        </div>
    );
};
