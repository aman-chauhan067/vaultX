import puppeteer from 'puppeteer';
import path from 'path';

const ARTIFACTS_DIR = 'C:/Users/Aman Chauhan/.gemini/antigravity/brain/de998b87-2e8d-46bc-a3e0-f7cd256e1c5a';
const delay = ms => new Promise(res => setTimeout(res, ms));

async function clickTextDiv(page, text) {
  const result = await page.evaluate((txt) => {
    const all = Array.from(document.querySelectorAll('div, span, button'));
    for (const el of all) {
      const elText = el.textContent?.trim().replace(/\s+/g, ' ');
      if (elText && elText.toLowerCase() === txt.toLowerCase()) {
        const rect = el.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          return { found: true, x: rect.x + rect.width / 2, y: rect.y + rect.height / 2, text: elText };
        }
      }
    }
    return { found: false };
  }, text);
  
  if (result.found) {
    await page.mouse.click(result.x, result.y);
    return true;
  }
  return false;
}

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 800 });

  console.log('Navigating to web app...');
  await page.goto('http://localhost:5173/');
  await delay(3000);
  
  const title = await page.title();
  if (!title.includes('VaultX')) {
    console.error(`Verification Failed: Title is "${title}"`);
    process.exit(1);
  }

  const landingText = await page.evaluate(() => document.body.innerText);
  
  if (landingText.toUpperCase().includes('CREATE WALLET')) {
    console.log('Creating wallet...');
    await clickTextDiv(page, 'Create Wallet');
    await delay(2000);
    
    await clickTextDiv(page, 'Generate Phrase');
    await delay(2000);
    
    const words = await page.evaluate(() => {
      const result = [];
      for (const div of document.querySelectorAll('div')) {
        const spans = div.querySelectorAll(':scope > span');
        if (spans.length >= 2) {
          const num = parseInt(spans[0].textContent?.trim());
          const word = spans[1].textContent?.trim();
          if (num >= 1 && num <= 12 && word && /^[a-z]+$/.test(word)) {
            result[num - 1] = word;
          }
        }
      }
      return result.filter(Boolean);
    });
    console.log('Words extracted:', words.length);

    await clickTextDiv(page, 'I saved it');
    await delay(2000);

    const confirmData = await page.evaluate(() => {
      const spans = Array.from(document.querySelectorAll('span'));
      const wordSpans = spans.filter(s => /^Word \d+$/.test(s.textContent?.trim()));
      return wordSpans.map(s => parseInt(s.textContent.replace('Word ', '')) - 1);
    });
    
    const textInputs = await page.$$('input[type="text"]');
    for (let i = 0; i < textInputs.length; i++) {
      const idx = confirmData[i];
      if (idx !== undefined && words[idx]) {
        await textInputs[i].evaluate((el, val) => {
          const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
          setter.call(el, val);
          el.dispatchEvent(new Event('input', { bubbles: true }));
          el.dispatchEvent(new Event('change', { bubbles: true }));
        }, words[idx]);
        await delay(200);
      }
    }
    await delay(500);

    await clickTextDiv(page, 'Verify');
    await delay(2000);

    await page.evaluate((pwd) => {
      const inputs = Array.from(document.querySelectorAll('input[type="password"]'));
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      for (const input of inputs) {
        setter.call(input, pwd);
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }, 'Password123!');
    await delay(500);

    await clickTextDiv(page, 'Create Wallet');
    await delay(4000);
  }

  const isVaultX = await page.evaluate(() => !!document.getElementById('root'));

  if (!isVaultX) {
    console.error('Verification Failed: Could not find #root in the DOM.');
    process.exit(1);
  }
  console.log('Verification Passed! Browser title and DOM match VaultX.');

  const pagesToCapture = [
    { url: 'http://127.0.0.1:5173/#/dashboard', name: 'dashboard.png' },
    { url: 'http://127.0.0.1:5173/#/portfolio', name: 'portfolio.png' },
    { url: 'http://127.0.0.1:5173/#/networks', name: 'networks.png' },
    { url: 'http://127.0.0.1:5173/#/receive', name: 'receive.png' },
    { url: 'http://127.0.0.1:5173/#/developer', name: 'developer.png' },
    { url: 'http://127.0.0.1:5173/#/settings', name: 'settings.png' }
  ];

  for (const p of pagesToCapture) {
    console.log(`Navigating to ${p.url}...`);
    await page.goto(p.url);
    await delay(2000);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, p.name) });
  }

  await browser.close();
  console.log('Fresh screenshots captured successfully.');
})();