import re
from playwright.sync_api import sync_playwright, Page, expect

def verify_surah_download_buttons(page: Page):
    """
    This script verifies that individual download buttons are present for each surah
    in the listening section.
    """
    # 1. Arrange: Go to the application's home page.
    page.goto("http://localhost:5173/", wait_until="networkidle")

    # Navigate to the "Listen" page from the main navigation
    listen_button = page.get_by_role("button", name="الاستماع")
    expect(listen_button).to_be_visible(timeout=10000)
    listen_button.click()

    # 2. Act: Select the first reciter from the list.
    # We wait for the reciters list to be populated and click the first one.
    first_reciter_button = page.locator(".divide-y > div > button").first
    expect(first_reciter_button).to_be_visible(timeout=20000)
    first_reciter_button.click()

    # 3. Assert & Screenshot: Wait for the next view to load and take a screenshot.
    expect(page.get_by_role("heading", name="اختر السورة")).to_be_visible(timeout=15000)

    # Find the row for "سورة الفاتحة" using a less strict regex to handle diacritics
    al_fatihah_row = page.locator(".group", has_text=re.compile("الفاتحة"))
    expect(al_fatihah_row).to_be_visible()

    # Within that row, find the download button and assert its presence.
    download_button_container = al_fatihah_row.locator("div.flex-shrink-0")
    expect(download_button_container.get_by_role("button")).to_be_visible()

    # 4. Screenshot: Capture the surah list with download buttons for visual verification.
    page.screenshot(path="jules-scratch/verification/surah_download_buttons.png")
    print("✅ Screenshot taken successfully.")


# Main execution block
def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_surah_download_buttons(page)
            print("✅ Frontend verification script ran successfully.")
        except Exception as e:
            print(f"❌ Frontend verification script failed: {e}")
            # Take a screenshot even on failure to help debug
            page.screenshot(path="jules-scratch/verification/error_screenshot.png")
        finally:
            browser.close()

if __name__ == "__main__":
    main()