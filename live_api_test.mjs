// We need to use 'require' for this specific library in a Node.js .mjs file
// to correctly handle the module format. This is a common interop solution.
import pkg from '@google/genai';
const { GoogleGenerativeAI } = pkg;

// Kintell: Final Live API Test Script
// هذا السكربت هو الاختبار النهائي للاتصال المباشر بـ Google Gemini API.
// Author: Jules
// Date: 2025-10-09
// Language: Egyptian Arabic

async function getHadithExplanation(apiKey, hadithText) {
  try {
    const googleAI = new GoogleGenerativeAI(apiKey);
    const model = googleAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      tools: [{ googleSearch: {} }],
      systemInstruction: `أنت عالم دين مسلم متخصص في شرح الأحاديث النبوية. مهمتك هي شرح الحديث التالي بشكل مبسط وواضح لعامة الناس باللغة العربية الفصحى، مع ذكر الدروس المستفادة منه. يجب أن يكون الشرح دقيقًا ومستندًا إلى مصادر موثوقة. استخدم البحث على الإنترنت للتأكد من صحة المعلومات التي تقدمها. اشرح الحديث التالي:`,
    });

    const chat = model.startChat();
    const result = await chat.sendMessageStream(hadithText);
    const fullResponse = await result.response;
    return { stream: result.stream, fullResponse };
  } catch (error) {
    // We will print the full error for detailed diagnostics
    console.error('فيه مشكلة حصلت في شرح الحديث:', error);
    return { error: error.message };
  }
}

async function runTest() {
  console.log("بدء الاختبار المباشر والنهائي للـ API...");

  const apiKey = "AIzaSyDQM7_OF0wmFT-6LMwynkCYCym7DR4KXpw"; // المفتاح المؤقت للاختبار
  const hadithText = "حديث: (إنما الأعمال بالنيات)";

  if (!apiKey) {
    console.error("خطأ: مفتاح الـ API غير موجود.");
    return;
  }

  console.log(`نص الحديث المرسل: "${hadithText}"`);

  try {
    const result = await getHadithExplanation(apiKey, hadithText);

    if (result.error) {
      console.error("\n--- حدث خطأ من الخدمة ---");
      console.error(result.error);
      console.error("-------------------------\n");
      return;
    }

    console.log("\n--- تم استلام الرد بنجاح ---");
    let fullText = '';
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      process.stdout.write(chunkText); // طباعة الشرح بشكل تدريجي
      fullText += chunkText;
    }
    console.log("\n----------------------------\n");

    if (result.fullResponse) {
        console.log("تم استلام الرد الكامل بنجاح.");
    }
    console.log("----------------------------\n");
    console.log("🎉 الاختبار المباشر نجح! 🎉");


  } catch (e) {
    console.error("\n--- حدث خطأ غير متوقع أثناء تشغيل الاختبار ---");
    console.error(e);
    console.error("---------------------------------------------\n");
  }
}

runTest();