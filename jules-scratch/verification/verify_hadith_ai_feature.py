import re
from playwright.sync_api import sync_playwright, Page, expect

def verify_hadith_feature(page: Page):
    """
    This script verifies the new 'Explain Hadith with AI' feature.
    """
    # 1. Navigate to the app and go to the Hadith page
    page.goto("http://localhost:5173/")

    # First, wait for the main index page to be fully loaded by waiting for its heading.
    # This ensures the bottom nav bar is present and intractable.
    expect(page.get_by_role("heading", name="فهرس السور")).to_be_visible(timeout=10000)

    # Now, click the hadith navigation button
    hadith_nav_button = page.get_by_role("button", name="الحديث")
    hadith_nav_button.click()

    # Wait for the main heading of the Hadith page to be visible
    expect(page.get_by_role("heading", name="الحديث الشريف")).to_be_visible(timeout=10000)

    # 2. Select a book (Sahih Bukhari)
    sahih_bukhari_button = page.get_by_role("button", name="صحيح البخاري")
    sahih_bukhari_button.click()

    # 3. Select the first chapter
    # Wait for the chapter list to appear, identified by the book title header
    expect(page.get_by_role("heading", name="صحيح البخاري")).to_be_visible(timeout=10000)
    # Click the first chapter button
    first_chapter_button = page.locator(".divide-y > button").first
    first_chapter_button.click()

    # 4. Select the first hadith to open the action modal
    # Wait for the hadith list to appear, identified by the chapter title
    expect(page.get_by_text("بدء الوحي")).to_be_visible(timeout=10000)
    first_hadith_button = page.locator("div[style*='transform'] button").first
    first_hadith_button.click()

    # 5. Verify the Hadith Action Modal and take the first screenshot
    hadith_action_modal = page.get_by_role("dialog", name=re.compile(r"كتاب صحيح البخاري - الحديث رقم \d+"))
    expect(hadith_action_modal).to_be_visible(timeout=5000)
    page.screenshot(path="jules-scratch/verification/verification_modal_1.png")

    # 6. Click the "Explain with AI" button
    explain_button = hadith_action_modal.get_by_role("button", name="اشرح بالذكاء الاصطناعي")
    explain_button.click()

    # 7. Verify the AI Assistant Modal and take the second screenshot
    ai_assistant_modal = page.get_by_role("dialog", name="مساعد الذكاء الاصطناعي")
    expect(ai_assistant_modal).to_be_visible(timeout=5000)

    # Check that the content is correctly passed
    expect(ai_assistant_modal.get_by_text(re.compile("حول كتاب صحيح البخاري - الحديث رقم"))).to_be_visible()
    expect(ai_assistant_modal.get_by_text(re.compile("إنما الأعمال بالنيات"))).to_be_visible()

    page.screenshot(path="jules-scratch/verification/verification_modal_2.png")


def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_hadith_feature(page)
            print("Verification script ran successfully.")
        except Exception as e:
            print(f"An error occurred: {e}")
            page.screenshot(path="jules-scratch/verification/error_screenshot.png")
        finally:
            browser.close()

if __name__ == "__main__":
    main()