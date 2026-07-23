import puppeteer from 'puppeteer';
import path from 'path';

const ARTIFACTS_DIR = 'C:/Users/Aman Chauhan/.gemini/antigravity/brain/de998b87-2e8d-46bc-a3e0-f7cd256e1c5a';
const delay = ms => new Promise(res => setTimeout(res, ms));

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 800 });

  console.log('Navigating to dashboard...');
  await page.goto('http://localhost:5173/#/dashboard');
  await delay(3000);
  
  // Wait for load
  console.log('Taking Ethereum screenshot...');
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'dashboard_ethereum.png') });

  // Navigate to networks to switch
  console.log('Switching network...');
  await page.goto('http://localhost:5173/#/networks');
  await delay(2000);

  // Click on BNB Chain "Switch" button
  const networks = await page.$$('div > h3');
  for (const h3 of networks) {
    const text = await page.evaluate(el => el.textContent, h3);
    if (text === 'BNB Smart Chain') {
      const parentCard = await h3.evaluateHandle(el => el.closest('div[style*="border"]'));
      const switchBtn = await parentCard.$('button');
      if (switchBtn) {
        await switchBtn.click();
        await delay(1000);
      }
    }
  }

  console.log('Taking BNB screenshot...');
  await page.goto('http://localhost:5173/#/dashboard');
  await delay(3000);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'dashboard_bnb.png') });

  // Switch to Polygon
  console.log('Switching to Polygon...');
  await page.goto('http://localhost:5173/#/networks');
  await delay(2000);
  for (const h3 of await page.$$('div > h3')) {
    const text = await page.evaluate(el => el.textContent, h3);
    if (text === 'Polygon Mainnet') {
      const parentCard = await h3.evaluateHandle(el => el.closest('div[style*="border"]'));
      const switchBtn = await parentCard.$('button');
      if (switchBtn) {
        await switchBtn.click();
        await delay(1000);
      }
    }
  }

  console.log('Taking Polygon screenshot...');
  await page.goto('http://localhost:5173/#/dashboard');
  await delay(3000);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'dashboard_polygon.png') });

  // Switch to Testnet (Sepolia)
  console.log('Switching to Sepolia...');
  await page.goto('http://localhost:5173/#/networks');
  await delay(2000);
  for (const h3 of await page.$$('div > h3')) {
    const text = await page.evaluate(el => el.textContent, h3);
    if (text === 'Sepolia Testnet') {
      const parentCard = await h3.evaluateHandle(el => el.closest('div[style*="border"]'));
      const switchBtn = await parentCard.$('button');
      if (switchBtn) {
        await switchBtn.click();
        await delay(1000);
      }
    }
  }

  console.log('Taking Sepolia screenshot...');
  await page.goto('http://localhost:5173/#/dashboard');
  await delay(3000);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'dashboard_sepolia.png') });

  await browser.close();
  console.log('Screenshots captured.');
})();
