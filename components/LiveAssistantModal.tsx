// components/LiveAssistantModal.tsx

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import LiveAiService from '../services/liveAiService';
import { useApp } from '../context/AppContext';

// أيقونات افتراضية، سيتم استبدالها بأيقونات فعلية لاحقًا
const MicIcon = () => <span>🎙️</span>;
const StopIcon = () => <span>🛑</span>;

const LiveAssistantModal = ({ onClose }: { onClose: () => void }) => {
  const { settings } = useApp();
  const [liveService, setLiveService] = useState<LiveAiService | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [status, setStatus] = useState('Disconnected'); // Disconnected, Connecting, Connected, Listening, Speaking
  const [transcript, setTranscript] = useState('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioQueueRef = useRef<Array<ArrayBuffer>>([]);
  const isPlayingRef = useRef<boolean>(false);

  // Function to process and play the audio queue
  const playNextInQueue = () => {
    if (isPlayingRef.current || audioQueueRef.current.length === 0 || !audioContextRef.current) {
      return;
    }
    isPlayingRef.current = true;
    setStatus('Speaking');

    const audioData = audioQueueRef.current.shift()!;
    // The API sends raw 16-bit PCM audio at 24kHz.
    const audioBuffer = audioContextRef.current.createBuffer(
      1, // number of channels
      audioData.byteLength / 2, // length in samples (2 bytes per sample)
      24000 // sample rate
    );

    // Convert 16-bit PCM (Int16Array) to Float32Array (-1.0 to 1.0)
    const pcmData = new Int16Array(audioData);
    const float32Data = new Float32Array(pcmData.length);
    for (let i = 0; i < pcmData.length; i++) {
      float32Data[i] = pcmData[i] / 32768;
    }
    audioBuffer.copyToChannel(float32Data, 0);

    const source = audioContextRef.current.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContextRef.current.destination);
    source.onended = () => {
      isPlayingRef.current = false;
      if (audioQueueRef.current.length > 0) {
        playNextInQueue();
      } else {
        if (!isListening) {
          setStatus('Connected');
        }
      }
    };
    source.start();
  };

  useEffect(() => {
    if (settings.quranUserApiKey) {
      setStatus('Connecting...');
      const service = new LiveAiService(settings.quranUserApiKey);
      setLiveService(service);

      service.startSession(
        (message) => {
          if (message.serverContent?.modelTurn?.parts[0]?.text) {
            setTranscript(prev => (prev + ' ' + message.serverContent.modelTurn.parts[0].text).trim());
          }
          if (message.data) {
            audioQueueRef.current.push(message.data);
            playNextInQueue();
          }
        },
        (error) => {
          console.error('Session error:', error);
          setStatus('Error');
        },
        () => {
          setStatus('Disconnected');
        }
      );
      setStatus('Connected');
    } else {
      setStatus('API Key needed');
    }

    return () => {
      liveService?.closeSession();
    };
  }, [settings.quranUserApiKey]);

  const handleMicToggle = async () => {
    if (isListening) {
      mediaRecorderRef.current?.stop();
      setIsListening(false);
      setStatus('Connected');
    } else {
      try {
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        }

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = async (event) => {
          if (event.data.size > 0 && liveService) {
            // Convert blob to ArrayBuffer, then to base64
            // This is a placeholder for actual PCM conversion
            // The browser does not record in raw PCM easily.
            const reader = new FileReader();
            reader.onloadend = () => {
              const base64String = (reader.result as string).split(',')[1];
              liveService.sendAudio(base64String);
            };
            reader.readAsDataURL(event.data);
          }
        };

        mediaRecorder.start(1000); // Send data every second
        setIsListening(true);
        setStatus('Listening');
      } catch (error) {
        console.error('Error accessing microphone:', error);
        setStatus('Mic Error');
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-2xl font-bold mb-4 text-center">المساعد الصوتي المباشر</h2>

        <div className="text-center mb-6">
          <p>الحالة: {status}</p>
        </div>

        <div className="flex justify-center items-center mb-6">
          <button
            onClick={handleMicToggle}
            className={`w-24 h-24 rounded-full flex items-center justify-center text-white ${isListening ? 'bg-red-500' : 'bg-green-500'}`}
          >
            {isListening ? <StopIcon /> : <MicIcon />}
          </button>
        </div>

        <div className="h-48 p-4 border rounded-lg bg-gray-50 overflow-y-auto">
          <p>{transcript}</p>
        </div>

        <div className="mt-6 text-center">
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded">
            إغلاق
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default LiveAssistantModal;
