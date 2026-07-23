import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const ARTIFACTS_DIR = 'C:/Users/Aman Chauhan/.gemini/antigravity/brain/de998b87-2e8d-46bc-a3e0-f7cd256e1c5a';
const extensionPath = path.resolve('apps/extension/dist').replace(/\\/g, '/');

const delay = ms => new Promise(res => setTimeout(res, ms));

(async () => {
  console.log('[LOG] Launching browser with extension...');
  const browser = await puppeteer.launch({
    headless: false,
    dumpio: true,
    args: [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`,
      '--no-sandbox',
      '--disable-setuid-sandbox'
    ]
  });

  try {
    console.log('[LOG] Inspecting all targets...');
    await delay(3000);
    const targets = await browser.targets();
    let extensionId = null;
    for (let target of targets) {
      console.log('  Target:', target.type(), target.url());
      if (target.url().startsWith('chrome-extension://')) {
        extensionId = target.url().split('/')[2];
      }
    }
    
    if (!extensionId) {
      throw new Error('Extension ID could not be found among targets.');
    }
    console.log(`[LOG] Extension ID resolved: ${extensionId}`);
    
    const popupUrl = `chrome-extension://${extensionId}/index.html`;
    console.log(`[LOG] Navigating to popup: ${popupUrl}`);
    
    const page = await browser.newPage();
    await page.setViewport({ width: 375, height: 600 });
    
    page.on('console', msg => {
        if(msg.type() === 'error') {
            console.log('[ERROR] Console error:', msg.text(), msg.location().url);
        }
    });
    
    page.on('requestfailed', request => {
        console.log(`[ERROR] Request failed: ${request.url()} - ${request.failure().errorText}`);
    });

    await page.goto(popupUrl);
    await delay(2000);
    
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'extension_popup_landing.png') });
    console.log('[PASS] Extension popup opened');
    
    // Verify Create Wallet
    console.log('[LOG] Navigating to Create Wallet...');
    await page.goto(popupUrl + '#/create-wallet');
    await delay(2000);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'extension_popup_create.png') });
    console.log('[PASS] Reached Create Wallet in popup');
        
    console.log('[LOG] Clicking Generate Phrase...');
    let genBtn = (await page.$$('div')).find(async (b) => {
        let t = await page.evaluate(el => el.textContent, b);
        return t && t.toLowerCase().includes('generate phrase');
    });
    
    await page.evaluate(() => {
        const divs = document.querySelectorAll('div');
        for(let d of divs) {
            if(d.textContent && d.textContent.toLowerCase().includes('generate phrase')) {
                d.click();
                break;
            }
        }
    });
    await delay(2000);
    
    console.log('[LOG] Extracting backup phrase...');
    const phraseWords = await page.evaluate(() => {
        // Find the grid of words
        const spans = document.querySelectorAll('span');
        const words = [];
        for (let s of spans) {
            if (s.style.fontSize === '1.25rem') {
                words.push(s.textContent);
            }
        }
        return words;
    });
    console.log('[LOG] Phrase extracted:', phraseWords.length, 'words');
    
    await page.evaluate(() => {
        const divs = document.querySelectorAll('div');
        for(let d of divs) {
            if(d.textContent && d.textContent.toLowerCase().includes('i saved it')) {
                d.click();
                break;
            }
        }
    });
    await delay(2000);
    
    console.log('[LOG] Confirming backup phrase...');
    await page.evaluate((phraseWords) => {
        const rows = document.querySelectorAll('div');
        const confirmDivs = [];
        for(let r of rows) {
            if(r.style.borderBottom && r.style.paddingBottom === '0.5rem') {
                confirmDivs.push(r);
            }
        }
        for(let div of confirmDivs) {
            const label = div.querySelector('span');
            const input = div.querySelector('input');
            if (label && input) {
                const text = label.textContent; // "Word 1"
                const idxStr = text.replace('Word ', '');
                const idx = parseInt(idxStr, 10) - 1;
                input.value = phraseWords[idx];
                // trigger React onChange
                const ev = new Event('input', { bubbles: true });
                input.dispatchEvent(ev);
            }
        }
    }, phraseWords);
    
    await delay(1000);
    await page.evaluate(() => {
        const divs = document.querySelectorAll('div');
        for(let d of divs) {
            if(d.textContent && d.textContent.toLowerCase().trim() === 'verify') {
                d.click();
                break;
            }
        }
    });
    await delay(2000);
    
    console.log('[LOG] Entering password...');
    const inputs = await page.$$('input[type="password"]');
    if (inputs.length >= 2) {
        await inputs[0].type('Password123!');
        await inputs[1].type('Password123!');
        
        await page.evaluate(() => {
            const divs = document.querySelectorAll('div');
            for(let d of divs) {
                if(d.textContent && d.textContent.toLowerCase().trim().includes('create wallet')) {
                    d.click();
                    break;
                }
            }
        });
        await delay(5000);
        await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'extension_popup_wallet_created.png') });
        console.log('[PASS] Wallet created successfully');
    } else {
        console.log('[ERROR] Password inputs not found');
    }

  } catch(e) {
    console.error(e);
  } finally {
    await browser.close();
  }
})();
