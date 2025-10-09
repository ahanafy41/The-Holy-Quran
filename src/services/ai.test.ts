import { describe, it, expect, vi } from 'vitest';
import { getHadithExplanation } from './ai';

// Kintell: AI-powered Hadith explanations - Test File with Mocking
// This file tests the AI logic in `ai.ts` by mocking the @google/genai library.
//
// Author: Jules
// Date: 2025-10-09
// Language: Egyptian Arabic
//
// يا جماعة ده ملف اختبار للكود بتاع شرح الأحاديث
// الملف ده بيختبر الكود اللي في `ai.ts` عن طريق استخدام "Mocking"
//
// اللي عمله: جولز
// التاريخ: ٠٩-١٠-٢٠٢٥
// اللغة: عربي مصري

// هنعمل Mock لمكتبة @google/genai كلها
vi.mock('@google/genai', () => {
  // هنعمل دالة Mock عشان نتتبع استدعاء الـ constructor
  const mockGoogleGenerativeAI = vi.fn();

  // هنحدد سلوك الـ Mock constructor
  mockGoogleGenerativeAI.mockImplementation((apiKey) => {
    // لو مفتاح الـ API غلط، هنرمي error معين
    if (apiKey === 'INVALID_API_KEY') {
      throw new Error('[GoogleGenerativeAI Error]: API key not valid. Please pass a valid API key.');
    }

    // لو المفتاح صح، هنرجع object بيحاكي الـ API الحقيقي
    return {
      getGenerativeModel: vi.fn().mockReturnThis(),
      startChat: vi.fn().mockReturnThis(),
      sendMessageStream: vi.fn().mockResolvedValue({
        stream: (async function* () {
          yield { text: () => "شرح " };
          yield { text: () => "الحديث" };
        })(),
        response: Promise.resolve({ text: () => "شرح الحديث" })
      }),
    };
  });

  return {
    GoogleGenerativeAI: mockGoogleGenerativeAI,
  };
});

describe('getHadithExplanation', () => {
  // الاختبار ده دلوقتي ممكن يشتغل عشان مش بيعمل اتصال حقيقي
  it('should return a streamed explanation for a valid hadith', async () => {
    const apiKey = 'VALID_DUMMY_KEY'; // مفتاح وهمي صحيح
    const hadithText = 'إنما الأعمال بالنيات';
    const result = await getHadithExplanation(apiKey, hadithText);

    expect(result).toBeDefined();
    // @ts-ignore
    expect(result.error).toBeUndefined();
    // @ts-ignore
    expect(result.stream).toBeDefined();

    let fullText = '';
    // @ts-ignore
    for await (const chunk of result.stream) {
      fullText += chunk.text();
    }

    expect(fullText).toBe('شرح الحديث');
  });

  it('should return an error for an invalid API key', async () => {
    const apiKey = 'INVALID_API_KEY';
    const hadithText = 'إنما الأعمال بالنيات';
    const result = await getHadithExplanation(apiKey, hadithText);

    expect(result).toBeDefined();
    // @ts-ignore
    expect(result.error).toBeDefined();
    // @ts-ignore
    // هنتأكد إن رسالة الخطأ اللي حددناها في الـ Mock ظهرت صح
    expect(result.error).toContain('API key not valid');
  });
});