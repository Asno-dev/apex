
              const { chromium } = require('playwright');
              (async () => {
                const browser = await chromium.launch({ headless: true });
                const page = await browser.newPage();
                try {
                  async (browser, page) => { await page.goto('https://www.flipkart.com'); return `Navigated to Flipkart successfully.`; }
                } catch (err) {
                  console.error(err);
                } finally {
                  await browser.close();
                }
              })();
            