import asyncio
from playwright.async_api import async_playwright, expect

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        base_url = "http://localhost:5173"

        try:
            # --- 1. Verify Surah download buttons ---
            print("Verification Step 1: Surahs")
            await page.goto(base_url)
            await expect(page.get_by_role("heading", name="فهرس القرآن")).to_be_visible(timeout=15000)
            await page.get_by_role("button", name="السور").click()
            await expect(page.get_by_role("heading", name="السور")).to_be_visible()
            await expect(page.get_by_role("button", name="تحميل سورة الفاتحة")).to_be_visible()
            await page.screenshot(path="jules-scratch/verification/01_surah_downloads.png")
            print("  ✅ Screenshot 1: Surah downloads OK")
            await page.get_by_label("الرجوع إلى الفهرس").click()
            await expect(page.get_by_role("heading", name="فهرس القرآن")).to_be_visible()


            # --- 2. Verify Reciter download buttons ---
            print("Verification Step 2: Reciters")
            await page.get_by_role("button", name="الاستماع").click()
            await expect(page.get_by_role("heading", name="اختر القارئ")).to_be_visible(timeout=10000)
            await expect(page.get_by_role("button", name="تحميل المصحف كاملًا - محمد رفعت (مرتل)")).to_be_visible()
            await page.screenshot(path="jules-scratch/verification/02_reciter_downloads.png")
            print("  ✅ Screenshot 2: Reciter downloads OK")


            # --- 3. Verify Hadith download buttons ---
            print("Verification Step 3: Hadith")
            await page.get_by_role("button", name="الحديث").click()
            await expect(page.get_by_role("heading", name="الحديث الشريف")).to_be_visible()
            await expect(page.get_by_role("button", name="تحميل كتاب صحيح البخاري")).to_be_visible()
            await page.screenshot(path="jules-scratch/verification/03_hadith_downloads.png")
            print("  ✅ Screenshot 3: Hadith downloads OK")

            # --- 4. Verify Hisn Al-Muslim download button ---
            print("Verification Step 4: Hisn Al-Muslim")
            await page.get_by_role("button", name="حصن المسلم").click()
            await expect(page.get_by_role("heading", name="حصن المسلم")).to_be_visible()
            await page.get_by_role("button", name="أذكار الاستيقاظ من النوم").click()
            await expect(page.get_by_role("heading", name="أذكار الاستيقاظ من النوم")).to_be_visible()
            await expect(page.get_by_role("button", name="تحميل صوتيات: أذكار الاستيقاظ من النوم")).to_be_visible()
            await page.screenshot(path="jules-scratch/verification/04_hisn_downloads.png")
            print("  ✅ Screenshot 4: Hisn Al-Muslim downloads OK")

            # --- 5. Verify Memorization section download button ---
            print("Verification Step 5: Memorization")
            await page.get_by_role("button", name="المزيد").click()
            await page.get_by_role("button", name="الحفظ والمراجعة").click()
            await expect(page.get_by_role("heading", name="الحفظ والمراجعة")).to_be_visible()
            await page.get_by_role("button", name="إضافة مقطع").click()
            await expect(page.get_by_role("heading", name="إضافة مقطع جديد")).to_be_visible()
            await page.locator('select').first.select_option('1') # Select Surah Al-Fatihah
            await page.get_by_role("button", name="حفظ المقطع").click()
            await expect(page.get_by_role("heading", name="الحفظ والمراجعة")).to_be_visible()
            await expect(page.get_by_role("button", name="تحميل مقطع سورة الفاتحة, الآيات 1-7")).to_be_visible()
            await page.screenshot(path="jules-scratch/verification/05_memorization_downloads.png")
            print("  ✅ Screenshot 5: Memorization downloads OK")

            # --- 6. Verify Downloads management page ---
            print("Verification Step 6: Downloads Page")
            await page.get_by_role("button", name="المزيد").click()
            await expect(page.get_by_role("heading", name="المزيد")).to_be_visible()
            await page.get_by_role("button", name="إدارة التحميلات").click()
            await expect(page.get_by_role("heading", name="إدارة التحميلات")).to_be_visible()
            await page.screenshot(path="jules-scratch/verification/06_downloads_page.png")
            print("  ✅ Screenshot 6: Downloads page OK")

        except Exception as e:
            print(f"An error occurred: {e}")
            await page.screenshot(path="jules-scratch/verification/error.png")
        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(main())