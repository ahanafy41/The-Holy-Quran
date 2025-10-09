import {
  GoogleGenerativeAI,
} from '@google/genai';

// Kintell: AI-powered Hadith explanations
// This file contains the logic for interacting with the Google Gemini API.
// It exports a function to get explanations for Hadiths.
//
// Author: Jules
// Date: 2025-10-09
//
// Note: The actual implementation is below.
// Language: Egyptian Arabic
//
// يا جماعة الكود ده عشان نشرح الأحاديث بالذكاء الاصطناعي
// الملف ده هيكون فيه كل حاجة ليها علاقة بجوجل Gemini API
// وهنطلع منه دالة (function) عشان تجيب شرح للأحاديث
//
// اللي عمله: جولز
// التاريخ: ٠٩-١٠-٢٠٢٥
//
// اللغة: عربي مصري

/**
 * بياخد مفتاح الـ API ونص الحديث، وبيرجع الشرح من Gemini.
 * @param apiKey مفتاح الـ API بتاعك من Google AI Studio.
 * @param hadithText نص الحديث اللي عايز تشرحه.
 * @returns بيرجع stream للردود، والرد النهائي مع المصادر.
 */
export async function getHadithExplanation(
  apiKey: string,
  hadithText: string
) {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash', // هستخدم flash عشان السرعة والتكلفة
      tools: [
        {
          googleSearch: {}, // تفعيل البحث على الإنترنت
        },
      ],
      systemInstruction: `أنت عالم دين مسلم متخصص في شرح الأحاديث النبوية. مهمتك هي شرح الحديث التالي بشكل مبسط وواضح لعامة الناس باللغة العربية الفصحى، مع ذكر الدروس المستفادة منه. يجب أن يكون الشرح دقيقًا ومستندًا إلى مصادر موثوقة. استخدم البحث على الإنترنت للتأكد من صحة المعلومات التي تقدمها. اشرح الحديث التالي:`,
    });

    const chat = model.startChat();

    const result = await chat.sendMessageStream(hadithText);

    // The full response is available after the stream is finished
    const fullResponse = await result.response;

    return { stream: result.stream, fullResponse };
  } catch (error) {
    console.error('فيه مشكلة حصلت في شرح الحديث:', error);
    // @ts-ignore
    return { error: error.message };
  }
}