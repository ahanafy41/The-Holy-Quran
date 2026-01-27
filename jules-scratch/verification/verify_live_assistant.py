
from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    try:
        # Navigate to the app, assuming it's running on localhost:5173
        page.goto("http://localhost:5173/")
        page.wait_for_load_state('networkidle')
        page.wait_for_selector('text=/الحديث الشريف/', timeout=60000)

        # Navigate to Hadith page
        page.click('a[href="/hadith"]')
        page.wait_for_selector('text=/صحيح البخاري/', timeout=30000)

        # Click on a book
        page.click('text=/صحيح البخاري/')
        page.wait_for_selector('text=/بدء الوحي/', timeout=30000)

        # Click on a chapter
        page.click('text=/بدء الوحي/')
        page.wait_for_selector('text=/شرح بالذكاء الاصطناعي/', timeout=30000)

        # Click the live assistant button
        page.click('button[aria-label^="مساعد صوتي مباشر للحديث"]')

        # Wait for the modal to appear
        page.wait_for_selector('text=/المساعد الصوتي المباشر/', timeout=30000)

        # Take a screenshot
        page.screenshot(path="jules-scratch/verification/verification.png")
        print("Screenshot taken successfully.")

    except Exception as e:
        print(f"An error occurred: {e}")

    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)
