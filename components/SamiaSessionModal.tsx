
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { Ayah, SavedSection } from '../types';
import { XMarkIcon, MicrophoneIcon, CheckCircleIcon, ArrowLeftIcon, InformationCircleIcon } from './Icons';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../App';

interface PlayerPlaylist {
    section: SavedSection;
    ayahs: Ayah[];
};

interface SamiaSessionModalProps {
    playlist: PlayerPlaylist;
    onClose: () => void;
};

type SessionStatus = 'setup' | 'idle' | 'recording' | 'processing' | 'feedback' | 'finished' | 'error';

interface Feedback {
    isCorrect: boolean;
    userTranscription: string;
    correctionSuggestion?: string;
}

const mimeType = 'audio/webm';

const MotionDiv = motion('div');
const MotionButton = motion('button');

export const SamiaSessionModal: React.FC<SamiaSessionModalProps> = ({ playlist, onClose }) => {
    const { ayahs, section } = playlist;
    const { apiKey } = useApp();

    const [status, setStatus] = useState<SessionStatus>('setup');
    const [chunkSize, setChunkSize] = useState(1);
    const [showInstructions, setShowInstructions] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<Feedback | null>(null);
    const [currentAyahIndex, setCurrentAyahIndex] = useState(0);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const streamRef = useRef<MediaStream | null>(null);
    const aiRef = useRef<GoogleGenAI | null>(null);

    const init = useCallback(async () => {
        if (!apiKey) {
            setError("مفتاح API غير متاح لهذه الميزة.");
            setStatus('error');
            return;
        }
        aiRef.current = new GoogleGenAI({ apiKey });

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;
        } catch (err) {
            console.error('Error getting media stream:', err);
            setError('يرجى السماح بالوصول إلى الميكروفون للمتابعة.');
            setStatus('error');
        }
    }, [apiKey]);
    
    useEffect(() => {
        init();
        return () => {
            streamRef.current?.getTracks().forEach(track => track.stop());
            if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
                mediaRecorderRef.current.stop();
            }
        };
    }, [init]);

    const handleStartRecording = () => {
        if (!streamRef.current || status !== 'idle') return;
        setShowInstructions(false);
        setError(null);
        setFeedback(null);
        try {
            mediaRecorderRef.current = new MediaRecorder(streamRef.current, { mimeType });
            audioChunksRef.current = [];
            
            mediaRecorderRef.current.ondataavailable = (event) => {
                audioChunksRef.current.push(event.data);
            };

            mediaRecorderRef.current.onstop = async () => {
                setStatus('processing');
                const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
                
                if (audioBlob.size === 0) {
                    setError("لم يتم تسجيل أي صوت. يرجى المحاولة مرة أخرى.");
                    setStatus('idle');
                    return;
                }
                
                const reader = new FileReader();
                reader.readAsDataURL(audioBlob);
                reader.onloadend = async () => {
                    const base64Audio = (reader.result as string).split(',')[1];
                    await analyzeRecitation(base64Audio);
                };
            };
            
            mediaRecorderRef.current.start();
            setStatus('recording');
        } catch (e) {
            console.error("Could not start recording:", e);
            setError("حدث خطأ عند بدء التسجيل.");
            setStatus('error');
        }
    };
    
    const handleStopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
            mediaRecorderRef.current.stop();
        }
    };

    const currentChunk = useMemo(() => 
        ayahs.slice(currentAyahIndex, currentAyahIndex + chunkSize),
        [ayahs, currentAyahIndex, chunkSize]
    );

    const analyzeRecitation = async (base64Audio: string) => {
        if (!aiRef.current) return;
        
        const textToRecite = currentChunk.map(a => a.text).join(' ');
        const firstAyah = currentChunk[0];
        const lastAyah = currentChunk[currentChunk.length - 1];
        const ayahRangeText = chunkSize === 1 
            ? `الآية ${firstAyah.numberInSurah}`
            : `الآيات ${firstAyah.numberInSurah} إلى ${lastAyah.numberInSurah}`;

        const prompt = `You are an extremely precise Quran recitation examiner named Sami'a. Your task is to verify if the user's recitation EXACTLY matches a specific passage from the Quran, and nothing else.

        The user is being tested ONLY on this passage:
        - Surah: ${firstAyah.surah?.name}
        - Passage: ${ayahRangeText}
        - Correct Text: "${textToRecite}"

        The user has provided an audio recording of their recitation. Your instructions are:
        1. Transcribe the user's full recitation from the audio.
        2. Normalize both your transcription and the correct text (remove diacritics, standardize alef to ا, ة to ه, ى to ي).
        3. Perform a STRICT comparison. The user's recitation is ONLY correct if their normalized transcription is an IDENTICAL match to the normalized correct text.
            - If the user recites extra words, even from the next verse, it is INCORRECT.
            - If the user misses words, it is INCORRECT.
            - If the user says a different word, it is INCORRECT.
        4. Based on your comparison, provide feedback in the specified JSON format.
            - If it is INCORRECT because the user recited more than the required passage, the 'correction_suggestion' MUST be "لقد قرأت أكثر من الآيات المطلوبة. من فضلك اقرأ المقطع المعروض فقط.".
            - For other mistakes, provide a clear, concise 'correction_suggestion' in Arabic explaining the primary error (e.g., "لقد قلت 'كلمة' بدلاً من 'الكلمة الصحيحة'.").
            - Always provide the 'user_transcription' as you heard it.`;
        
        const responseSchema = {
            type: Type.OBJECT,
            properties: {
                is_correct: { type: Type.BOOLEAN, description: "True if the recitation is an exact match, false otherwise." },
                user_transcription: { type: Type.STRING, description: "The full transcription of what the user said, in Arabic." },
                correction_suggestion: { type: Type.STRING, description: "A brief, helpful suggestion for correction in Arabic if a mistake was found." },
            },
            required: ['is_correct', 'user_transcription']
        };

        try {
            const response = await aiRef.current.models.generateContent({
                model: "gemini-2.5-flash",
                contents: {
                    parts: [
                        { text: prompt },
                        { inlineData: { mimeType, data: base64Audio } }
                    ]
                },
                config: { responseMimeType: "application/json", responseSchema }
            });

            const jsonText = response.text.trim();
            let result;
            try {
                result = JSON.parse(jsonText);
            } catch (parseError) {
                console.error("Failed to parse Gemini response as JSON:", jsonText);
                setError("عذراً، حدث خطأ غير متوقع أثناء تحليل الإجابة. حاول مرة أخرى.");
                setStatus('idle');
                return;
            }

            if (typeof result.is_correct === 'undefined' || typeof result.user_transcription === 'undefined') {
                console.error("Gemini response is missing required keys:", result);
                setError("عذراً، كانت الإجابة غير مكتملة. حاول مرة أخرى.");
                setStatus('idle');
                return;
            }

            setFeedback({
                isCorrect: result.is_correct,
                userTranscription: result.user_transcription || '(لم يتم التعرف على صوت)',
                correctionSuggestion: result.correction_suggestion
            });
            setStatus('feedback');

        } catch (e) {
            console.error("Gemini analysis failed:", e);
            setError("عذراً، لم أتمكن من تحليل التلاوة. حاول مرة أخرى.");
            setStatus('idle');
        }
    };
    
    const handleNext = () => {
        setFeedback(null);
        setError(null);
        const nextIndex = currentAyahIndex + chunkSize;
        if (nextIndex < ayahs.length) {
            setCurrentAyahIndex(nextIndex);
            setStatus('idle');
            setShowInstructions(true);
        } else {
            setStatus('finished');
        }
    }
    
    const startSession = (size: number) => {
        setChunkSize(size);
        setStatus('idle');
    }

    const renderSetup = () => (
         <MotionDiv initial={{opacity:0, scale:0.9}} animate={{opacity:1, scale:1}} className="text-center w-full max-w-md">
            <h3 className="text-2xl font-bold mb-2">كيف تود أن تُسمّع؟</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-8">اختر الطريقة التي تناسب مراجعتك.</p>
            <div className="space-y-3">
                <button onClick={() => startSession(1)} className="w-full text-lg font-semibold p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm hover:bg-green-50 dark:hover:bg-slate-700 transition-colors">
                    آية واحدة في كل مرة
                </button>
                 <button disabled={ayahs.length < 2} onClick={() => startSession(3)} className="w-full text-lg font-semibold p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm hover:bg-green-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    مجموعات من ٣ آيات
                </button>
                <button disabled={ayahs.length < 4} onClick={() => startSession(5)} className="w-full text-lg font-semibold p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm hover:bg-green-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    مجموعات من ٥ آيات
                </button>
                 <button onClick={() => startSession(ayahs.length)} className="w-full text-lg font-semibold p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm hover:bg-green-50 dark:hover:bg-slate-700 transition-colors">
                    المقطع كاملاً
                </button>
            </div>
         </MotionDiv>
    );

    const renderStatusUI = () => {
        const endOfChunk = Math.min(currentAyahIndex + chunkSize, ayahs.length);
        const title = chunkSize === 1
            ? `آية ${currentAyahIndex + 1} من ${ayahs.length}`
            : `آيات ${currentAyahIndex + 1} - ${endOfChunk} من ${ayahs.length}`;

        return (
            <MotionDiv key={currentAyahIndex} initial={{opacity:0}} animate={{opacity:1}} className="text-center w-full max-w-3xl">
                <p className="font-semibold text-slate-500 dark:text-slate-400 mb-4">{title}</p>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm mb-8 max-h-60 overflow-y-auto">
                   <p className="font-quran text-3xl md:text-4xl leading-loose text-center">
                       {currentChunk.map(ayah => `${ayah.text} \u06dd${ayah.numberInSurah}\u06de`).join(' ')}
                   </p>
                </div>

                 {showInstructions && status === 'idle' && (
                    <MotionDiv initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg flex items-center gap-3 mb-6">
                        <InformationCircleIcon className="w-6 h-6 flex-shrink-0"/>
                        <p className="text-sm font-medium text-right">اضغط على الميكروفون ثم اقرأ المقطع المعروض بصوت واضح.</p>
                    </MotionDiv>
                )}

                <div className="flex justify-center items-center h-48">
                    <AnimatePresence mode="wait">
                        {status === 'idle' && (
                             <MotionButton key="idle" initial={{scale:0.5, opacity:0}} animate={{scale:1, opacity:1}} exit={{scale:0.5, opacity:0}}
                                 onClick={handleStartRecording} aria-label="بدء تسجيل التلاوة"
                                 className="w-24 h-24 bg-green-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-green-700 transition-all transform hover:scale-105">
                                 <MicrophoneIcon className="w-12 h-12" />
                             </MotionButton>
                        )}
                        {status === 'recording' && (
                             <MotionButton key="recording" initial={{scale:0.5, opacity:0}} animate={{scale:1, opacity:1}} exit={{scale:0.5, opacity:0}}
                                 onClick={handleStopRecording} aria-label="إيقاف التسجيل"
                                 className="w-24 h-24 bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg animate-pulse">
                                 <div className="w-8 h-8 bg-white rounded-md"></div>
                             </MotionButton>
                        )}
                        {status === 'processing' && (
                            <MotionDiv key="processing" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="text-center">
                                <Spinner />
                                <p className="mt-4 font-semibold text-slate-500">يتم التحقق...</p>
                            </MotionDiv>
                        )}
                        {status === 'feedback' && feedback && (
                            <MotionDiv key="feedback" initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} className="w-full">
                                {feedback.isCorrect ? (
                                    <div className="text-center">
                                        <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto" />
                                        <p className="text-2xl font-bold mt-4">إجابة صحيحة!</p>
                                        <button onClick={handleNext} className="mt-6 px-6 py-3 bg-green-600 text-white rounded-full hover:bg-green-700 font-semibold transition-colors flex items-center gap-2 mx-auto">
                                           <span> {endOfChunk >= ayahs.length ? 'إنهاء الجلسة' : 'المقطع التالي'}</span>
                                            <ArrowLeftIcon className="w-5 h-5"/>
                                        </button>
                                    </div>
                                ) : (
                                    <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg space-y-3">
                                        <h3 className="font-bold text-red-600 dark:text-red-400 text-xl">هناك خطأ ما</h3>
                                        
                                        <div className="text-right bg-white dark:bg-slate-800 p-3 rounded-md">
                                            <p className="text-xs text-slate-500 dark:text-slate-400">تلاوتك:</p>
                                            <p className="font-semibold text-red-700 dark:text-red-300">"{feedback.userTranscription}"</p>
                                        </div>
                                         <div className="text-right bg-white dark:bg-slate-800 p-3 rounded-md">
                                            <p className="text-xs text-slate-500 dark:text-slate-400">التصحيح المقترح:</p>
                                            <p className="font-semibold text-blue-700 dark:text-blue-300">{feedback.correctionSuggestion || 'يرجى التأكد من مطابقة التلاوة للآية.'}</p>
                                        </div>

                                        <div className="mt-4 flex justify-center gap-4">
                                             <button onClick={() => setStatus('idle')} className="px-5 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-full font-semibold hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors">حاول مرة أخرى</button>
                                             <button onClick={handleNext} className="px-5 py-2 text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-200/50 dark:hover:bg-slate-700/50 rounded-full transition-colors">تخطي</button>
                                        </div>
                                    </div>
                                )}
                            </MotionDiv>
                        )}
                    </AnimatePresence>
                </div>
                {error && <p className="text-red-500 mt-4 font-semibold">{error}</p>}
            </MotionDiv>
        )
    };
    
    const renderFinished = () => (
        <MotionDiv initial={{opacity:0, scale:0.8}} animate={{opacity:1, scale:1}} className="text-center">
            <CheckCircleIcon className="w-24 h-24 text-green-500 mx-auto mb-4" />
            <h3 className="text-3xl font-bold">أحسنت صنعًا!</h3>
            <p className="text-slate-600 dark:text-slate-400 text-lg mt-2">لقد أكملت تسميع مقطع "{section.name}" بنجاح.</p>
            <button onClick={onClose} className="mt-8 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition-colors">
                العودة
            </button>
        </MotionDiv>
    );
     const renderError = () => (
        <MotionDiv initial={{opacity:0, scale:0.8}} animate={{opacity:1, scale:1}} className="text-center p-6 bg-red-50 dark:bg-red-900/20 rounded-2xl">
            <XMarkIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold">حدث خطأ</h3>
            <p className="text-slate-600 dark:text-slate-400 text-lg mt-2">{error}</p>
            <button onClick={onClose} className="mt-8 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold transition-colors">
                العودة
            </button>
        </MotionDiv>
    );

    return (
         <div className="fixed inset-0 bg-slate-100 dark:bg-slate-900 z-50 flex flex-col" role="dialog" aria-modal="true" aria-labelledby="samia-title">
            <header className="p-4 flex justify-between items-center border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
                <h2 id="samia-title" className="font-bold text-lg">تسميع: {section.name}</h2>
                <button onClick={onClose} aria-label="إنهاء الجلسة" className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 dark:hover:bg-slate-700">
                    <XMarkIcon className="w-5 h-5" />
                </button>
            </header>

            <main className="flex-grow flex flex-col items-center justify-center p-4">
                <AnimatePresence mode="wait">
                    {status === 'setup' && renderSetup()}
                    {status === 'finished' && renderFinished()}
                    {status === 'error' && renderError()}
                    {(status !== 'setup' && status !== 'finished' && status !== 'error') && renderStatusUI()}
                </AnimatePresence>
            </main>
        </div>
    )
};

const Spinner: React.FC = () => (
    <svg className="animate-spin h-10 w-10 text-slate-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);
