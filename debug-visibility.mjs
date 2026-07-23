import puppeteer from 'puppeteer';
import { execSync } from 'child_process';
import path from 'path';
import url from 'url';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

function getChromePath() {
  try {
    return execSync('reg query "HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\App Paths\\chrome.exe" /ve').toString().split('REG_SZ')[1].trim();
  } catch (e) {
    return 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  }
}

async function runDebug() {
  console.log('Launching browser to debug visibility...');
  const browser = await puppeteer.launch({
    executablePath: getChromePath(),
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  page.on('console', msg => console.log('BROWSER:', msg.text()));

  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
  
  await page.evaluate(() => {
    console.log('--- DEBUGGING VISIBILITY ---');
    
    // 1. Is BackgroundLayer mounted?
    const canvas = document.querySelector('canvas');
    if (!canvas) {
      console.log('Canvas NOT found in DOM!');
      return;
    }
    console.log('Canvas found in DOM.');
    
    // 2. Dimensions
    const rect = canvas.getBoundingClientRect();
    console.log(`Canvas dimensions: ${rect.width}x${rect.height}`);
    
    // 3. Computed Styles
    const styles = window.getComputedStyle(canvas);
    console.log(`Canvas opacity: ${styles.opacity}`);
    console.log(`Canvas display: ${styles.display}`);
    console.log(`Canvas visibility: ${styles.visibility}`);
    console.log(`Canvas z-index: ${styles.zIndex}`);
    console.log(`Canvas position: ${styles.position}`);
    
    // 4. Stacking Context (Parent)
    let parent = canvas.parentElement;
    while (parent && parent !== document.body) {
      const pStyles = window.getComputedStyle(parent);
      if (pStyles.zIndex !== 'auto') {
        console.log(`Parent Stacking Context found on <${parent.tagName.toLowerCase()}> with z-index: ${pStyles.zIndex}`);
        console.log(`Parent class/id: ${parent.className} ${parent.id}`);
        break;
      }
      parent = parent.parentElement;
    }

    // 5. Check what is actually covering the canvas
    // We get the element at the center of the screen
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const topElement = document.elementFromPoint(centerX, centerY);
    
    if (topElement) {
      console.log(`Element at center of screen is: <${topElement.tagName.toLowerCase()}>`);
      const topStyles = window.getComputedStyle(topElement);
      console.log(`Top element background color: ${topStyles.backgroundColor}`);
      
      let current = topElement;
      const path = [];
      while(current && current !== document.body) {
         path.push(`${current.tagName.toLowerCase()}${current.id ? '#'+current.id : ''}${current.className ? '.'+current.className.split(' ').join('.') : ''}`);
         current = current.parentElement;
      }
      console.log(`Top element path: ${path.reverse().join(' > ')}`);

      if (topElement !== canvas) {
        console.log(`CONCLUSION: The canvas is COVERED by <${topElement.tagName.toLowerCase()}>!`);
      }
    }
    
    console.log('----------------------------');
  });

  await browser.close();
}

runDebug().catch(console.error);
