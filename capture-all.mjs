import puppeteer from 'puppeteer';
import path from 'path';

const ARTIFACTS_DIR = 'C:/Users/Aman Chauhan/.gemini/antigravity/brain/de998b87-2e8d-46bc-a3e0-f7cd256e1c5a';
const delay = ms => new Promise(res => setTimeout(res, ms));

async function captureScreenshots() {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  console.log('Navigating to landing...');
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
  await delay(1000);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'landing.png') });

  console.log('Creating wallet to enter app...');
  // Click "Create Wallet"
  const createBtns = await page.$$('div');
  for (const btn of createBtns) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text && text.includes('Create Wallet')) {
      await btn.click();
      break;
    }
  }
  await delay(1000);
  
  // Click "Create Password" or similar if needed. But usually, if we just set the store, it might work?
  // Let's just try to set the localStorage AND indexedDB?
  // Actually, wait, let's just use the router to go to dashboard and see if it redirects. 
  // If we can't easily bypass it, we can just take a screenshot of Create Wallet!
  await page.goto('http://localhost:5173/#/create-wallet', { waitUntil: 'networkidle0' });
  await delay(1000);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'create_wallet.png') });

  // And import wallet
  await page.goto('http://localhost:5173/#/import-wallet', { waitUntil: 'networkidle0' });
  await delay(1000);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'import_wallet.png') });
  
  console.log('Navigating to dashboard...');
  await page.goto('http://localhost:5173/#/dashboard', { waitUntil: 'networkidle0' });
  await delay(2000);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'dashboard.png') });

  console.log('Navigating to portfolio...');
  await page.goto('http://localhost:5173/#/portfolio', { waitUntil: 'networkidle0' });
  await delay(1500);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'portfolio.png') });

  console.log('Navigating to networks...');
  await page.goto('http://localhost:5173/#/networks', { waitUntil: 'networkidle0' });
  await delay(1500);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'networks.png') });

  console.log('Navigating to receive...');
  await page.goto('http://localhost:5173/#/receive', { waitUntil: 'networkidle0' });
  await delay(1500);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'receive.png') });

  console.log('Navigating to settings...');
  await page.goto('http://localhost:5173/#/settings', { waitUntil: 'networkidle0' });
  await delay(1500);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'settings.png') });

  await browser.close();
  console.log('Done.');
}

captureScreenshots().catch(console.error);
