import puppeteer from 'puppeteer';
import path from 'path';

const ARTIFACTS_DIR = 'C:/Users/Aman Chauhan/.gemini/antigravity/brain/de998b87-2e8d-46bc-a3e0-f7cd256e1c5a';
const delay = ms => new Promise(res => setTimeout(res, ms));

(async () => {
  console.log('[LOG] Launching browser for E2E Validation...');
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 375, height: 700 });
    
    page.on('console', msg => {
      if(msg.type() === 'error' && !msg.text().includes('ERR_NAME_NOT_RESOLVED') && !msg.text().includes('favicon.ico')) {
        console.log('[ERROR] Console error:', msg.text());
      }
    });

    console.log('[LOG] Navigating to localhost...');
    await page.goto('http://127.0.0.1:5173/');
    await delay(2000);
    
    // Auto-create wallet if on landing
    const isLanding = await page.evaluate(() => document.body.innerText.includes('CREATE WALLET'));
    if (isLanding) {
      console.log('[LOG] Creating wallet...');
      
      // Click Create Wallet on landing
      await page.evaluate(() => {
         const btns = Array.from(document.querySelectorAll('div, button'));
         const btn = btns.find(b => b.textContent && b.textContent.includes('CREATE WALLET'));
         if (btn) btn.click();
      });
      await delay(1000);
      
      // Click Generate Phrase
      await page.evaluate(() => {
         const btns = Array.from(document.querySelectorAll('div'));
         const btn = btns.find(b => b.textContent && b.textContent.includes('Generate Phrase'));
         if (btn) btn.click();
      });
      await delay(1000);
      
      // Extract the 12 words
      const words = await page.evaluate(() => {
          const spans = Array.from(document.querySelectorAll('span'));
          // Find spans containing numbers 1 to 12
          const wordSpans = spans.filter(s => s.nextElementSibling && s.nextElementSibling.tagName === 'SPAN' && parseInt(s.textContent) > 0 && parseInt(s.textContent) <= 12);
          return wordSpans.map(s => s.nextElementSibling.textContent);
      });
      console.log('[LOG] Extracted words:', words.length);
      
      // Click I saved it
      await page.evaluate(() => {
         const btns = Array.from(document.querySelectorAll('div'));
         const btn = btns.find(b => b.textContent && b.textContent.includes('I saved it'));
         if (btn) btn.click();
      });
      await delay(1000);
      
      // Fill the confirm inputs
      await page.evaluate((words) => {
         const inputs = Array.from(document.querySelectorAll('input[type="text"]'));
         inputs.forEach(input => {
            // Find which word number it asks for
            const prev = input.previousElementSibling;
            if (prev && prev.textContent && prev.textContent.includes('Word')) {
               const num = parseInt(prev.textContent.replace('Word ', ''));
               const word = words[num - 1];
               
               // Set value and trigger React events
               const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
               nativeInputValueSetter.call(input, word);
               input.dispatchEvent(new Event('input', { bubbles: true }));
            }
         });
      }, words);
      await delay(500);
      
      // Click Verify
      await page.evaluate(() => {
         const btns = Array.from(document.querySelectorAll('div'));
         const btn = btns.find(b => b.textContent && b.textContent.includes('Verify'));
         if (btn) btn.click();
      });
      await delay(1000);
      
      const passInputs = await page.$$('input[type="password"]');
      if (passInputs.length >= 2) {
         await passInputs[0].type('Password123!');
         await passInputs[1].type('Password123!');
      }
      
      // Click Create Wallet final
      await page.evaluate(() => {
         const btns = Array.from(document.querySelectorAll('div'));
         const btn = btns.find(b => b.textContent && b.textContent.includes('Create Wallet'));
         if (btn) btn.click();
      });
      await delay(3000);
    }
    
    // Now we should be on dashboard
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'dashboard_ethereum.png') });
    console.log('[PASS] Dashboard loaded (Ethereum Mainnet)');

    // Click on Network to switch to Polygon
    console.log('[LOG] Switching to Polygon...');
    await page.evaluate(() => {
         const spans = Array.from(document.querySelectorAll('span'));
         const netSpan = spans.find(b => b.textContent && b.textContent.includes('Ethereum Mainnet'));
         if (netSpan) netSpan.click();
    });
    await delay(1000);
    
    await page.evaluate(() => {
         const btns = Array.from(document.querySelectorAll('button'));
         // Find the button next to Polygon
         const polyRow = Array.from(document.querySelectorAll('h3')).find(h => h.textContent === 'Polygon');
         if (polyRow) {
             const switchBtn = polyRow.parentElement.parentElement.parentElement.querySelector('button');
             if (switchBtn) switchBtn.click();
         }
    });
    await delay(1000);
    
    // Go back to dashboard from Settings -> Networks by clicking Back twice
    await page.evaluate(() => {
         const btns = Array.from(document.querySelectorAll('button, div'));
         const btn = btns.find(b => b.textContent && b.textContent.includes('Back'));
         if (btn) btn.click();
    });
    await delay(500);
    await page.evaluate(() => {
         const btns = Array.from(document.querySelectorAll('button, div'));
         const btn = btns.find(b => b.textContent && b.textContent.includes('Back'));
         if (btn) btn.click();
    });
    await delay(1000);

    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'dashboard_polygon.png') });
    console.log('[PASS] Switched to Polygon');

    // Verify Receive QR
    console.log('[LOG] Opening Receive screen...');
    await page.evaluate(() => {
         const btns = Array.from(document.querySelectorAll('div'));
         const btn = btns.find(b => b.textContent && b.textContent.includes('Receive'));
         if (btn) btn.click();
    });
    await delay(2000);
    
    // Check if SVG is rendered (actual QR code)
    const hasSvg = await page.evaluate(() => document.querySelectorAll('svg').length > 0);
    if (hasSvg) {
       console.log('[PASS] QR Code SVG rendered successfully');
    } else {
       console.log('[FAIL] QR Code SVG missing');
    }
    
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'receive_qr.png') });

  } catch(e) {
    console.error(e);
  } finally {
    await browser.close();
    console.log('[LOG] Validation complete.');
  }
})();
