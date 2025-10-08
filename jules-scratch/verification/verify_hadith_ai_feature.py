import re
from playwright.sync_api import sync_playwright, Page, expect

def verify_hadith_feature(page: Page):
    """
    This script verifies the new 'Explain Hadith with AI' feature.
    It is designed to be robust and handle loading times.
    """
    try:
        # 1. Navigate to the app and wait for it to be ready
        print("Navigating to the application...")
        page.goto("http://localhost:5173/")
        page.wait_for_load_state('networkidle', timeout=15000)

        print("Waiting for the main page to load...")
        expect(page.get_by_role("heading", name="فهرس القرآن")).to_be_visible(timeout=15000)

        # 2. Go to the Hadith page
        print("Navigating to the Hadith page...")
        hadith_nav_button = page.get_by_role("button", name="الحديث")
        hadith_nav_button.click()

        print("Waiting for the Hadith page to load...")
        expect(page.get_by_role("heading", name="الحديث الشريف")).to_be_visible(timeout=10000)

        # 3. Select a book (Sahih Bukhari)
        print("Selecting 'Sahih Bukhari'...")
        sahih_bukhari_button = page.get_by_role("button", name="صحيح البخاري", exact=True)
        sahih_bukhari_button.click()

        # 4. Wait for the book's chapters to load
        print("Waiting for chapters to load...")
        loading_indicator = page.get_by_text("جاري التحميل...")
        expect(loading_indicator).to_be_hidden(timeout=20000)

        # 5. Select the first chapter ("بدء الوحي")
        print("Selecting chapter 'بدء الوحي'...")
        chapter_button = page.get_by_role("button", name="بدء الوحي")
        expect(chapter_button).to_be_visible(timeout=10000)
        chapter_button.click()

        # 6. Select the first hadith
        print("Selecting the first hadith...")
        expect(page.get_by_role("button", name="العودة إلى قائمة الأبواب")).to_be_visible(timeout=10000)
        first_hadith_button = page.locator("div[style*='transform'] button").first
        first_hadith_button.click()

        # 7. Verify the Hadith Action Modal
        print("Verifying the Hadith Action Modal...")
        hadith_action_modal = page.get_by_role("dialog", name=re.compile(r"كتاب صحيح البخاري - الحديث رقم \d+"))
        expect(hadith_action_modal).to_be_visible(timeout=5000)
        page.screenshot(path="jules-scratch/verification/verification_modal_1.png")

        # 8. Click the "Explain with AI" button
        print("Clicking 'Explain with AI'...")
        explain_button = hadith_action_modal.get_by_role("button", name="اشرح بالذكاء الاصطناعي")
        explain_button.click()

        # 9. Verify the AI Assistant Modal
        print("Verifying the AI Assistant Modal...")
        ai_assistant_modal = page.get_by_role("dialog", name="مساعد الذكاء الاصطناعي")
        expect(ai_assistant_modal).to_be_visible(timeout=5000)
        page.screenshot(path="jules-scratch/verification/verification_modal_2.png")

        # 10. Send a message to the AI
        print("Sending a message to the AI...")
        ai_input = ai_assistant_modal.get_by_role("textbox", name="اطرح سؤالاً")
        ai_input.fill("اشرح هذا الحديث")
        send_button = ai_assistant_modal.get_by_role("button", name="إرسال الرسالة")
        send_button.click()

        # 11. Wait for the response and check for errors
        print("Waiting for AI response...")
        # Wait for the "thinking" indicator to appear and then disappear
        thinking_indicator = ai_assistant_modal.get_by_text("المساعد يكتب...")
        expect(thinking_indicator).to_be_visible(timeout=5000)
        expect(thinking_indicator).to_be_hidden(timeout=30000)

        print("Checking for error messages...")
        # Check if the detailed error message is NOT visible
        error_message_locator = ai_assistant_modal.get_by_text("عذراً، حدث خطأ ما")
        expect(error_message_locator).to_be_hidden()

        print("Capturing final screenshot...")
        page.screenshot(path="jules-scratch/verification/verification_final_chat.png")
        print("Verification script ran successfully.")

    except Exception as e:
        print(f"An error occurred during verification: {e}")
        page.screenshot(path="jules-scratch/verification/error_screenshot.png")
        raise

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_hadith_feature(page)
        finally:
            browser.close()

if __name__ == "__main__":
    main()