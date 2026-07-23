import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';
import fs from 'fs';

const ARTIFACTS_DIR = 'C:/Users/Aman Chauhan/.gemini/antigravity/brain/de998b87-2e8d-46bc-a3e0-f7cd256e1c5a';
const delay = ms => new Promise(res => setTimeout(res, ms));

const EXTENSION_PATH = 'd:/Aman Chauhan/project/VaultX/apps/extension/dist';
const DAPP_FILE = 'd:/Aman Chauhan/project/VaultX/mock-dapp.html';
const TEST_PASSWORD = 'Password123!';
const EXT_BASE = 'chrome-extension://iopkahcnjekdplndhokmmibbjonlajlm/index.html';

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(fs.readFileSync(DAPP_FILE));
});

// Click element using bounding rect at center (proper browser mouse events)
async function clickElementByStyle(page, styleSubstring) {
  const result = await page.evaluate((styleStr) => {
    const divs = Array.from(document.querySelectorAll('div[style]'));
    for (const d of divs) {
      const style = d.getAttribute('style') || '';
      const text = d.textContent?.trim().replace(/\s+/g, ' ');
      if (style.includes(styleStr)) {
        const rect = d.getBoundingClientRect();
        return { found: true, x: rect.x + rect.width / 2, y: rect.y + rect.height / 2, text };
      }
    }
    return { found: false };
  }, styleSubstring);
  
  if (result.found) {
    console.log(`[CLICK@${Math.round(result.x)},${Math.round(result.y)}] "${result.text?.substring(0, 40)}"`);
    await page.mouse.click(result.x, result.y);
    return true;
  }
  return false;
}

// Find text content div and click it via real mouse coordinates
async function clickTextDiv(page, text) {
  const result = await page.evaluate((txt) => {
    const all = Array.from(document.querySelectorAll('div[style]'));
    for (const el of all) {
      const elText = el.textContent?.trim().replace(/\s+/g, ' ');
      if (elText && elText.toLowerCase().includes(txt.toLowerCase()) && elText.length < txt.length + 40) {
        const rect = el.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          return { found: true, x: rect.x + rect.width / 2, y: rect.y + rect.height / 2, text: elText };
        }
      }
    }
    return { found: false };
  }, text);
  
  if (result.found) {
    console.log(`[CLICK] "${text}" at (${Math.round(result.x)}, ${Math.round(result.y)})`);
    await page.mouse.click(result.x, result.y);
    return true;
  }
  console.log(`[MISS] "${text}" not found`);
  return false;
}

// Wait until body text contains the expected string
async function waitForBodyText(page, text, timeoutMs = 10000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const body = await page.evaluate(() => document.body.innerText);
    if (body.toLowerCase().includes(text.toLowerCase())) return true;
    await delay(500);
  }
  console.log(`[TIMEOUT] Waiting for "${text}"`);
  return false;
}

(async () => {
  server.listen(9999);

  console.log('[LOG] Launching browser...');
  const USER_DATA_DIR = path.join(process.cwd(), '.puppeteer_dapp_profile_' + Date.now());

  const browser = await puppeteer.launch({
    headless: false,
    userDataDir: USER_DATA_DIR,
    args: [
      `--disable-extensions-except=${EXTENSION_PATH}`,
      `--load-extension=${EXTENSION_PATH}`,
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--window-size=800,700'
    ]
  });

  browser.on('targetcreated', async (target) => {
    if (target.type() === 'service_worker') {
      try {
        const w = await target.worker();
        if (w) w.on('console', msg => console.log('[SW]', msg.text()));
      } catch (e) {
        // ignore
      }
    }
  });

  try {
    // ─── PHASE 1: WALLET SETUP ────────────────────────────────────────────
    const page = await browser.newPage();
    await page.setViewport({ width: 800, height: 700 });

    console.log('[LOG] Opening extension...');
    await page.goto(EXT_BASE);
    await delay(2000);

    const landingText = await page.evaluate(() => document.body.innerText);
    console.log('[LOG] Landing (200):', landingText.substring(0, 200));

    if (landingText.toUpperCase().includes('CREATE WALLET')) {
      // ── Step 1: Navigate to create-wallet ──
      console.log('[LOG] → #/create-wallet');
      await page.goto(`${EXT_BASE}#/create-wallet`);
      await delay(2000);

      const p1 = await page.evaluate(() => document.body.innerText);
      console.log('[LOG] Create page:', p1.substring(0, 200));

      // ── Step 2: Click "Generate Phrase" via coordinates ──
      console.log('[LOG] Clicking Generate Phrase...');
      let clicked = await clickTextDiv(page, 'Generate Phrase');
      if (!clicked) {
        // Try by inline-flex style (the button div)
        clicked = await clickElementByStyle(page, 'border-radius: 100px');
        console.log('[LOG] Fallback click:', clicked);
      }
      await delay(2000);

      const p2 = await page.evaluate(() => document.body.innerText);
      console.log('[LOG] After Generate Phrase:', p2.substring(0, 300));

      // ── Step 3: Extract words ──
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
      console.log('[LOG] Words:', words.length, words.join(' '));

      // ── Step 4: Click "I saved it" ──
      console.log('[LOG] Clicking I saved it...');
      await clickTextDiv(page, 'I saved it');
      await delay(2000);

      // ── Step 5: Fill confirmation inputs ──
      const confirmData = await page.evaluate(() => {
        const spans = Array.from(document.querySelectorAll('span'));
        const wordSpans = spans.filter(s => /^Word \d+$/.test(s.textContent?.trim()));
        return wordSpans.map(s => parseInt(s.textContent.replace('Word ', '')) - 1);
      });
      console.log('[LOG] Confirm indices:', confirmData);

      const textInputs = await page.$$('input[type="text"]');
      for (let i = 0; i < textInputs.length; i++) {
        const idx = confirmData[i];
        if (idx !== undefined && words[idx]) {
          // Use React-compatible value setter to trigger onChange
          await textInputs[i].evaluate((el, val) => {
            const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
            nativeInputValueSetter.call(el, val);
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
          }, words[idx]);
          console.log(`[LOG] Input ${i}: words[${idx}]="${words[idx]}"`);
          await delay(200);
        }
      }
      await delay(500);

      // Verify that inputs have values
      const inputVals = await page.evaluate(() => 
        Array.from(document.querySelectorAll('input[type="text"]')).map(i => i.value)
      );
      console.log('[LOG] Input values:', inputVals);

      // ── Step 6: Click "Verify" ──
      console.log('[LOG] Clicking Verify...');
      // Find the Verify button specifically - it should be near the bottom and after the inputs
      const verifyResult = await page.evaluate(() => {
        const allDivs = Array.from(document.querySelectorAll('div[style]'));
        // Find divs with text "Verify" that have button-like styling (100px border radius)
        const candidates = allDivs.filter(d => {
          const style = d.getAttribute('style') || '';
          const text = d.textContent?.trim().replace(/\s+/g, ' ');
          return style.includes('border-radius: 100px') && text && /^verify/i.test(text);
        });
        console.log('[VERIFY] candidates:', candidates.length, candidates.map(c => c.textContent?.trim().substring(0,30)).join(', '));
        for (const d of candidates) {
          const rect = d.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            return { found: true, x: rect.x + rect.width/2, y: rect.y + rect.height/2, text: d.textContent?.trim().substring(0,40) };
          }
        }
        return { found: false };
      });
      console.log('[LOG] Verify element:', verifyResult);
      if (verifyResult.found) {
        await page.mouse.click(verifyResult.x, verifyResult.y);
      }
      await delay(2000);

      const p3 = await page.evaluate(() => document.body.innerText);
      console.log('[LOG] After Verify:', p3.substring(0, 200));

      // ── Step 7: Fill passwords using React-compatible setter ──
      const passCount = await page.evaluate((pwd) => {
        const inputs = Array.from(document.querySelectorAll('input[type="password"]'));
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        for (const input of inputs) {
          nativeInputValueSetter.call(input, pwd);
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
        }
        return inputs.length;
      }, TEST_PASSWORD);
      console.log('[LOG] Password inputs filled:', passCount);
      await delay(500);

      // Verify password values
      const passVals = await page.evaluate(() =>
        Array.from(document.querySelectorAll('input[type="password"]')).map(i => i.value.length + ' chars')
      );
      console.log('[LOG] Password values:', passVals);

      // ── Step 8: Click "Create Wallet" via border-radius button ──
      console.log('[LOG] Clicking Create Wallet...');
      const createResult = await page.evaluate(() => {
        const candidates = Array.from(document.querySelectorAll('div[style]')).filter(d => {
          const style = d.getAttribute('style') || '';
          const text = d.textContent?.trim().replace(/\s+/g, ' ');
          return style.includes('border-radius: 100px') && text && /create\s*wallet/i.test(text);
        });
        console.log('[CREATE] candidates:', candidates.length, candidates.map(c => c.textContent?.trim().substring(0,30)).join(', '));
        for (const d of candidates) {
          const rect = d.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            return { found: true, x: rect.x + rect.width/2, y: rect.y + rect.height/2, text: d.textContent?.trim().substring(0,40) };
          }
        }
        return { found: false };
      });
      console.log('[LOG] Create Wallet element:', createResult);
      if (createResult.found) {
        await page.mouse.click(createResult.x, createResult.y);
      }
      await delay(6000); // Wait for async createVault + navigate

      const p4 = await page.evaluate(() => document.body.innerText);
      console.log('[LOG] After Create:', p4.substring(0, 300));

    } else {
      console.log('[LOG] Wallet exists, not creating.');
    }

    await page.close();
    console.log('[LOG] Setup done.');

    // ─── PHASE 2: dApp TEST ───────────────────────────────────────────────
    await delay(1000);
    const dappPage = await browser.newPage();
    dappPage.on('console', msg => console.log('[dApp]', msg.type(), msg.text()));
    dappPage.on('pageerror', err => console.log('[dApp Error]', err.toString()));

    const dappPath = path.join(path.dirname(fileURLToPath(import.meta.url)), 'mock-dapp.html');
    console.log('[LOG] Opening dApp:', dappPath);
    await dappPage.goto(`file://${dappPath}`);
    await delay(2000);

    const hasEth = await dappPage.evaluate(() => !!window.ethereum);
    console.log('[LOG] window.ethereum injected:', hasEth);
    if (!hasEth) {
      console.log('[FAIL] ethereum not injected');
      process.exitCode = 1;
      return;
    }

    await dappPage.click('#connect');
    console.log('[LOG] Connect clicked. Waiting for popup...');
    await delay(5000);

    // ─── PHASE 3: Handle Popup ─────────────────────────────────────────────
    const targets = await browser.targets();
    console.log('[LOG] Targets:', targets.map(t => `${t.type()}:${t.url().slice(0, 70)}`).join('\n  '));

    const popupTarget = targets.find(t =>
      t.type() === 'page' &&
      t.url().includes('chrome-extension://') &&
      t.url().includes('index.html')
    );

    if (!popupTarget) {
      console.log('[FAIL] No popup found');
      process.exitCode = 1;
      return;
    }

    console.log('[LOG] Popup URL:', popupTarget.url());
    const popupPage = await popupTarget.page();
    popupPage.on('console', msg => {
      if (!msg.text().includes('JsonRpcProvider') && !msg.text().includes('ERR_NAME') && !msg.text().includes('SessionSync')) {
        console.log('[Popup]', msg.type(), msg.text());
      }
    });

    await delay(2000);
    await popupPage.screenshot({ path: path.join(ARTIFACTS_DIR, 'dapp_approval_screen.png') });

    const popupText = await popupPage.evaluate(() => document.body.innerText);
    console.log('[LOG] Popup text:', popupText.substring(0, 400));

    // Check for unlock-password-input (new: modal shows unlock form when locked)
    const unlockInput = await popupPage.$('#unlock-password-input');
    if (unlockInput) {
      console.log('[LOG] Found unlock form in modal. Entering password...');
      await unlockInput.type(TEST_PASSWORD);
      await delay(300);
      // Click the Unlock button
      const unlockClicked = await popupPage.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const btn = btns.find(b => b.textContent?.trim() === 'Unlock');
        if (btn) { btn.click(); return true; }
        return false;
      });
      console.log('[LOG] Unlock clicked:', unlockClicked);
      await delay(3000);

      // Re-take screenshot after unlocking
      await popupPage.screenshot({ path: path.join(ARTIFACTS_DIR, 'dapp_approval_screen.png') });
      const textAfterUnlock = await popupPage.evaluate(() => document.body.innerText);
      console.log('[LOG] Popup after unlock:', textAfterUnlock.substring(0, 300));
    }

    // Now look for Approve button
    console.log('[LOG] Looking for Approve button...');
    const approveResult = await popupPage.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => {
        const t = b.textContent?.trim();
        return t === 'Approve' || t?.toLowerCase().includes('approve');
      });
      if (btn) {
        btn.click();
        return { ok: true, text: btn.textContent?.trim() };
      }
      return { ok: false, buttons: btns.map(b => b.textContent?.trim()).join(', ') };
    });
    console.log('[LOG] Approve result:', JSON.stringify(approveResult));
    await delay(3000);

    // ─── PHASE 4: Validate ─────────────────────────────────────────────────
    try {
      await dappPage.waitForFunction(
        () => {
          const el = document.querySelector('#status');
          return el && el.innerText !== '' && el.innerText !== 'Connecting...';
        },
        { timeout: 15000 }
      );
    } catch (e) {
      console.log('[WARN] Status not updated.');
    }

    const status = await dappPage.evaluate(() => document.querySelector('#status')?.innerText || 'N/A');
    const accounts = await dappPage.evaluate(() => document.querySelector('#accounts')?.innerText || '');
    console.log('[RESULT] Status:', status);
    console.log('[RESULT] Accounts:', accounts);

    if (accounts && accounts.trim() !== '' && !accounts.includes('Error')) {
      console.log('[PASS] ✅ eth_requestAccounts SUCCEEDED:', accounts);
      process.exit(0);
    } else {
      console.log('[FAIL] ❌ No accounts returned. Status:', status);
      process.exitCode = 1;
    }

  } catch (e) {
    console.error('[ERROR]', e);
    process.exitCode = 1;
  } finally {
    await delay(1000);
    await browser.close();
    server.close();
    console.log('[LOG] Test done.');
  }
})();
