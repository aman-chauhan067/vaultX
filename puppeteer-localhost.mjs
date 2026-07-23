import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const ARTIFACTS_DIR = 'C:/Users/Aman Chauhan/.gemini/antigravity/brain/de998b87-2e8d-46bc-a3e0-f7cd256e1c5a';

const delay = ms => new Promise(res => setTimeout(res, ms));

(async () => {
  console.log('[LOG] Launching browser to test localhost...');
  const browser = await puppeteer.launch({
    headless: false,
    dumpio: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox'
    ]
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 375, height: 600 });
    
    let errorCount = 0;
    
    page.on('console', msg => {
        if(msg.type() === 'error') {
            console.log('[ERROR] Console error:', msg.text(), msg.location().url);
            // Ignore network errors caused by sandbox environment
            if (!msg.text().includes('ERR_NAME_NOT_RESOLVED')) {
               errorCount++;
            }
        }
    });
    
    page.on('requestfailed', request => {
        console.log(`[ERROR] Request failed: ${request.url()} - ${request.failure().errorText}`);
    });

    console.log('[LOG] Navigating to http://127.0.0.1:5173/');
    await page.goto('http://127.0.0.1:5173/');
    await delay(3000);
    
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'localhost_landing.png') });
    console.log('[PASS] Localhost popup opened');
    
    if (errorCount === 0) {
       console.log('[PASS] ZERO runtime errors on localhost');
    } else {
       console.log(`[FAIL] ${errorCount} runtime errors found on localhost`);
    }

  } catch(e) {
    console.error(e);
  } finally {
    await browser.close();
  }
})();
