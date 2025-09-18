from playwright.sync_api import sync_playwright, Page, expect

def verify_word_meanings_feature(page: Page):
    """
    Verifies that the new 'Word Meanings' page is accessible and functional.
    """
    # 1. Navigate to the app's home page.
    page.goto("http://localhost:5173/")

    # 2. Wait for the main index page to be ready.
    expect(page.get_by_role("heading", name="فهرس القرآن")).to_be_visible(timeout=10000)

    # 3. Click on the 'More' tab in the bottom navigation bar.
    # The nav bar items are buttons with a label.
    more_button = page.get_by_role("button", name="المزيد")
    expect(more_button).to_be_visible()
    more_button.click()

    # 4. On the 'More' page, click on the new 'Word Meanings' link.
    word_meanings_link = page.get_by_role("button", name="معاني كلمات القرآن")
    expect(word_meanings_link).to_be_visible()
    word_meanings_link.click()

    # 5. Verify that the new page has loaded correctly.
    # We expect the heading of the new page to be visible.
    header = page.get_by_role("heading", name="معاني كلمات القرآن")
    expect(header).to_be_visible(timeout=5000)

    # 5. Find and click on the first Surah (Al-Fatihah) to expand it.
    # The Surah is a <summary> element inside a <details> element.
    al_fatihah_summary = page.get_by_role("heading", name="1 - الفاتحة")
    expect(al_fatihah_summary).to_be_visible()
    al_fatihah_summary.click()

    # 6. Verify that the meaning for the first Ayah is displayed.
    # The meaning is in a <p> tag. We check for a snippet of the meaning.
    ayah_meaning = page.get_by_text("أَبْتَدِئُ قِرَاءَتِي مُسْتَعِينًا بِاسْمِ اللهِ")
    expect(ayah_meaning).to_be_visible()

    # 7. Take a screenshot for visual confirmation.
    page.screenshot(path="jules-scratch/verification/verification.png")

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        verify_word_meanings_feature(page)
        browser.close()

if __name__ == "__main__":
    main()
