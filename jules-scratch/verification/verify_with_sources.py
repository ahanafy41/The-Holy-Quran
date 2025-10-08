import re
from playwright.sync_api import sync_playwright, expect

def run_verification(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    try:
        # 1. انتقل إلى التطبيق وقم بإعداد مفتاح API
        page.goto("http://localhost:5173/")
        page.evaluate("() => localStorage.setItem('gemini_api_key', 'AIzaSyDQM7_OF0wmFT-6LMwynkCYCym7DR4KXpw')")
        page.reload()

        # 2. انتقل إلى صفحة الحديث
        hadith_button = page.get_by_role("button", name="الحديث")
        expect(hadith_button).to_be_visible(timeout=15000)
        hadith_button.click()

        # 3. اختر كتابًا ثم بابًا
        expect(page.get_by_role("heading", name="الحديث الشريف")).to_be_visible(timeout=10000)
        page.get_by_role("button", name="صحيح البخاري").first.click()
        expect(page.get_by_role("heading", name="صحيح البخاري")).to_be_visible(timeout=10000)
        page.get_by_role("button", name=re.compile("باب|كتاب")).first.click()

        # 4. انقر على حديث لفتح النافذة المنبثقة
        expect(page.get_by_role("button", name="العودة إلى قائمة الأبواب")).to_be_visible(timeout=10000)
        page.get_by_role("button", name=re.compile("الحديث رقم")).first.click()

        # 5. انقر على زر "شرح الحديث"
        modal_button = page.get_by_role("button", name="شرح الحديث بالذكاء الاصطناعي")
        expect(modal_button).to_be_visible(timeout=5000)
        modal_button.click()

        # 6. انتظر حتى يظهر الشرح والمصادر
        explanation_container = page.locator("p.whitespace-pre-wrap")
        expect(explanation_container).to_be_visible(timeout=30000) # زيادة المهلة أكثر للسماح باستجابة الشبكة البطيئة
        expect(explanation_container).not_to_be_empty(timeout=10000)

        sources_heading = page.get_by_role("heading", name="المصادر المستخدمة:")
        expect(sources_heading).to_be_visible(timeout=10000)

        source_link = page.locator("ul li a")
        expect(source_link.first).to_be_visible(timeout=5000)

        # 7. التقط لقطة شاشة للنتيجة النهائية
        screenshot_path = "jules-scratch/verification/verification_with_sources.png"
        page.screenshot(path=screenshot_path)
        print(f"Final screenshot with sources saved to {screenshot_path}")

    except Exception as e:
        print(f"An error occurred: {e}")
        page.screenshot(path="jules-scratch/verification/error_final.png")
    finally:
        browser.close()

with sync_playwright() as playwright:
    run_verification(playwright)