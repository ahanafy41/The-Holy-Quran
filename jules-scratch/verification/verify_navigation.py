import re
from playwright.sync_api import sync_playwright, Page, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    try:
        # 1. Navigate to the app
        page.goto("http://localhost:5173/")

        # 2. Verify the old floating action button is gone
        # The FAB had the aria-label "قائمة الإجراءات السريعة"
        fab_locator = page.get_by_label("قائمة الإجراءات السريعة")
        expect(fab_locator).to_have_count(0)

        # 3. Verify the new Advanced Search component is visible
        expect(page.get_by_role("heading", name="الوصول السريع والبحث")).to_be_visible()

        # 4. Test the smart search input
        search_input = page.get_by_placeholder("ابحث عن آية، سورة، أو جزء...")
        expect(search_input).to_be_visible()
        search_input.fill("الحمد لله")

        # Wait for search results to appear
        page.wait_for_timeout(1000) # Give debounce and search time to work

        # Check if a result is visible (e.g., Al-Fatiha: 2)
        expect(page.get_by_text("ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ")).to_be_visible()

        # 5. Test the structured navigation (dropdowns)
        # Select "جزء"
        page.get_by_role("combobox").first.select_option("juz")
        # Select Juz 30
        page.get_by_role("combobox").nth(1).select_option("30")

        # Take a screenshot
        page.screenshot(path="jules-scratch/verification/verification.png")

        print("Verification script ran successfully.")

    except Exception as e:
        print(f"An error occurred: {e}")
        page.screenshot(path="jules-scratch/verification/error.png")
    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)
