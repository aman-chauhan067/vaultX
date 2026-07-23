/* eslint-disable */
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => {
    console.log(`[CONSOLE] ${msg.type().toUpperCase()}: ${msg.text()}`);
  });
  page.on('pageerror', err => {
    console.log(`[PAGE_ERROR]: ${err.toString()}`);
  });
  page.on('requestfailed', request => {
    console.log(`[REQUEST_FAILED]: ${request.url()} - ${request.failure()?.errorText}`);
  });

  try {
    await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle0', timeout: 10000 });
    console.log('Page loaded successfully (or network idle)');
  } catch (err) {
    console.log(`[GOTO_ERROR]: ${err}`);
  }

  await browser.close();
})();
