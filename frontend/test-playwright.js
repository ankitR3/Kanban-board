import { chromium } from '@playwright/test';
(async () => {
  console.log('Launching browser...');
  const browser = await chromium.launch({ headless: true });
  console.log('Browser launched!');
  const page = await browser.newPage();
  await page.goto('https://example.com');
  console.log('Page title:', await page.title());
  await browser.close();
  console.log('Browser closed!');
})();
