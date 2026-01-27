// services/liveAiService.ts

import { GoogleGenAI, Modality } from '@google/genai';

// ملاحظة: هذا الكود هو هيكل أساسي وسيتطلب المزيد من التطوير.
// سيتم تكييفه ليعمل في بيئة المتصفح بدلاً من Node.js.

const MODEL_NAME = "gemini-live-2.5-flash-preview-native-audio-09-2025";

class LiveAiService {
  private googleAI: GoogleGenAI;
  private session: any; // سيتم تحديد النوع بشكل أفضل لاحقًا

  constructor(apiKey: string) {
    this.googleAI = new GoogleGenAI({ apiKey });
  }

  public async startSession(
    voiceName: string,
    onMessage: (data: any) => void,
    onError: (error: Error) => void,
    onClose: () => void
  ) {
    const config = {
      responseModalities: [Modality.AUDIO, Modality.TEXT],
      systemInstruction: `You are a helpful assistant for studying the Quran and Hadith. Be respectful and answer in Egyptian Arabic. Your voice is ${voiceName}.`,
    };

    try {
      this.session = await this.googleAI.live.connect({
        model: MODEL_NAME,
        callbacks: {
          onopen: () => {
            console.log('Live session opened.');
          },
          onmessage: (message) => {
            onMessage(message);
          },
          onerror: (e: Error) => {
            console.error('Live session error:', e.message);
            onError(e);
          },
          onclose: () => {
            console.log('Live session closed.');
            onClose();
          },
        },
        config: config,
      });

      console.log('Session started successfully.');
    } catch (error) {
      console.error('Failed to start session:', error);
      onError(error as Error);
    }
  }

  public sendAudio(audioData: string) { // audioData will be base64 encoded string
    if (!this.session) {
      console.error('Session not started.');
      return;
    }

    this.session.sendRealtimeInput({
      audio: {
        data: audioData,
        mimeType: "audio/pcm;rate=16000"
      }
    });
  }

  public closeSession() {
    if (this.session) {
      this.session.close();
      this.session = null;
    }
  }
}

export default LiveAiService;
