from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch()
    page = browser.new_page()
    page.goto("http://localhost:5173/")

    # Click the "Hisn Al-Muslim" button
    page.click('text="حصن المسلم"')

    # Wait for the categories to load
    page.wait_for_selector('text="أذكار الصباح والمساء"')

    page.screenshot(path="jules-scratch/verification/hisn_al_muslim.png")
    browser.close()

with sync_playwright() as playwright:
    run(playwright)