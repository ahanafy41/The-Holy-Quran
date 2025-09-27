from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch()
    page = browser.new_page()

    # Capture console messages
    messages = []
    page.on("console", lambda msg: messages.append(msg.text))

    page.goto("http://localhost:8000/test.html")

    # Wait for the fetch to complete
    page.wait_for_timeout(2000)

    browser.close()

    for msg in messages:
        print(msg)

with sync_playwright() as playwright:
    run(playwright)