from playwright.sync_api import sync_playwright, expect

def run_verification():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        try:
            # Go to the app's home page
            page.goto("http://localhost:5173/")
            page.wait_for_selector("text=حصن المسلم")

            # 1. Navigate to the "More" page
            more_button = page.get_by_role("button", name="المزيد")
            expect(more_button).to_be_visible()
            more_button.click()

            # Wait for the "More" page to load
            expect(page.get_by_role("heading", name="المزيد")).to_be_visible()

            # 2. Navigate to the "Memorization" page
            memorization_button = page.get_by_role("button", name="الحفظ والمراجعة")
            expect(memorization_button).to_be_visible()
            memorization_button.click()

            # Wait for the page title to be visible
            expect(page.get_by_role("heading", name="الحفظ والمراجعة")).to_be_visible()

            # Find the new reciter selection dropdown
            reciter_select_label = page.get_by_label("قارئ الحفظ")
            expect(reciter_select_label).to_be_visible()

            # Change the reciter to verify it works
            current_reciter = reciter_select_label.input_value()
            reciter_select_label.select_option(index=1)
            expect(reciter_select_label).not_to_have_value(current_reciter)

            # Take a screenshot to verify the new UI element
            page.screenshot(path="jules-scratch/verification/verification.png")
            print("Screenshot saved to jules-scratch/verification/verification.png")

        except Exception as e:
            print(f"An error occurred: {e}")
            page.screenshot(path="jules-scratch/verification/error.png")
            print("Error screenshot saved to jules-scratch/verification/error.png")
        finally:
            browser.close()

if __name__ == "__main__":
    run_verification()