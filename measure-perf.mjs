import puppeteer from 'puppeteer';
import path from 'path';

const ARTIFACTS_DIR = 'C:/Users/Aman Chauhan/.gemini/antigravity/brain/de998b87-2e8d-46bc-a3e0-f7cd256e1c5a';
const delay = ms => new Promise(res => setTimeout(res, ms));

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 800 });

  console.log('Navigating to landing page to measure performance...');
  await page.goto('http://localhost:5173/');
  await delay(3000);

  console.log('Measuring FPS over 5 seconds...');
  const fps = await page.evaluate(() => {
    return new Promise((resolve) => {
      let frames = 0;
      let startTime = performance.now();
      
      const loop = () => {
        frames++;
        if (performance.now() - startTime < 5000) {
          requestAnimationFrame(loop);
        } else {
          resolve(frames / 5);
        }
      };
      
      requestAnimationFrame(loop);
    });
  });

  console.log(`Average FPS: ${fps}`);

  console.log('Taking idle screenshot...');
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'fireflies_idle.png') });

  console.log('Moving mouse to test interaction...');
  await page.mouse.move(600, 400);
  await delay(100);
  await page.mouse.move(650, 450);
  await delay(100);
  await page.mouse.move(700, 500);
  await delay(200);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'fireflies_mouse_interaction.png') });

  console.log('Testing on pure black background...');
  await page.evaluate(() => {
    document.body.style.backgroundColor = 'black';
    const root = document.getElementById('root');
    if (root) root.style.display = 'none';
  });
  await delay(500);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'fireflies_black_bg.png') });

  await browser.close();
  console.log('Done.');
})();