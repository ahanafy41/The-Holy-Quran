import re
from playwright.sync_api import sync_playwright, expect

def run_verification(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    try:
        # 1. انتقل إلى التطبيق
        page.goto("http://localhost:5173/")

        # 2. قم بتعيين مفتاح API وهمي في localStorage لتمكين ميزات الذكاء الاصطناعي
        page.evaluate("() => localStorage.setItem('gemini_api_key', 'DUMMY_KEY_FOR_TESTING')")

        # أعد تحميل الصفحة لتطبيق التغييرات
        page.reload()

        # 3. انتقل إلى صفحة الحديث
        hadith_button = page.get_by_role("button", name="الحديث")
        expect(hadith_button).to_be_visible(timeout=10000)
        hadith_button.click()

        # 4. اختر كتابًا ثم بابًا
        expect(page.get_by_role("heading", name="الحديث الشريف")).to_be_visible(timeout=10000)
        page.get_by_role("button", name="صحيح البخاري").first.click()
        expect(page.get_by_role("heading", name="صحيح البخاري")).to_be_visible(timeout=10000)
        page.get_by_role("button", name=re.compile("باب|كتاب")).first.click()

        # 5. انقر على حديث لفتح النافذة المنبثقة
        expect(page.get_by_role("button", name="العودة إلى قائمة الأبواب")).to_be_visible(timeout=10000)
        page.get_by_role("button", name=re.compile("الحديث رقم")).first.click()

        # 6. انقر على زر "شرح الحديث"
        modal_button = page.get_by_role("button", name="شرح الحديث بالذكاء الاصطناعي")
        expect(modal_button).to_be_visible(timeout=5000)
        modal_button.click()

        # 7. انتظر حتى يظهر الشرح
        # هذا يتحقق من أن استدعاء API يعمل وأن النص يتم عرضه
        # نستخدم محددًا عامًا هنا لأننا لا نعرف النص الدقيق للشرح
        explanation_paragraph = page.locator(".whitespace-pre-wrap")
        expect(explanation_paragraph).to_be_visible(timeout=20000) # مهلة أطول للسماح للشبكة بالاستجابة
        expect(explanation_paragraph).not_to_be_empty(timeout=5000)


        # 8. التقط لقطة شاشة للنتيجة النهائية
        screenshot_path = "jules-scratch/verification/verification_final.png"
        page.screenshot(path=screenshot_path)
        print(f"Screenshot saved to {screenshot_path}")

    except Exception as e:
        print(f"An error occurred: {e}")
        page.screenshot(path="jules-scratch/verification/error.png")
    finally:
        browser.close()

with sync_playwright() as playwright:
    run_verification(playwright)