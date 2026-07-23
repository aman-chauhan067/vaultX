import puppeteer from 'puppeteer';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function runQA() {
  console.log('Starting Senior QA Bug Hunt...');
  const browser = await puppeteer.launch({ 
    headless: "new",
    defaultViewport: { width: 1280, height: 800 }
  });
  
  const page = await browser.newPage();
  
  const errors = [];
  const warnings = [];
  
  page.on('pageerror', (err) => {
    errors.push(`PageError: ${err.toString()}`);
  });
  
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(`ConsoleError: ${msg.text()}`);
    } else if (msg.type() === 'warning') {
      warnings.push(`ConsoleWarning: ${msg.text()}`);
    }
  });

  try {
    // 1. Initial Load (Not onboarded)
    console.log('Testing Initial Load...');
    await page.goto('http://localhost:5173/#/', { waitUntil: 'networkidle0' });
    await delay(1000);
    
    // 2. Click Create Wallet
    console.log('Testing Create Wallet Flow...');
    const [createBtn] = await page.$("::-p-xpath(//button[contains(., 'Create a new wallet')])");
    if (createBtn) {
      await createBtn.click();
      await delay(1000);
    } else {
      errors.push('Could not find Create Wallet button');
    }

    console.log('Injecting Wallet State...');
    await page.evaluate(() => {
      localStorage.setItem('vaultx_wallet_unlocked', 'true');
      localStorage.setItem('vaultx_store', JSON.stringify({
        state: {
          isLocked: false,
          hasVault: true,
          vaultDetails: { id: 'test', type: 'software', createdAt: Date.now() },
          activeWalletId: 'w1',
          wallets: [{ id: 'w1', address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F', name: 'Account 1', type: 'derived', derivationPath: 'm/44', createdAt: Date.now() }]
        },
        version: 0
      }));
    });
    
    await page.goto('http://localhost:5173/#/dashboard', { waitUntil: 'networkidle0' });
    await delay(2000);
    
    console.log('Testing Dashboard...');
    const [sendBtn] = await page.$("::-p-xpath(//div[contains(., 'Send')])");
    if (sendBtn) {
      await sendBtn.click();
      await delay(1000);
    } else {
      errors.push('Could not find Send button on dashboard');
    }
    
    console.log('Testing Send Flow...');
    const [backBtn] = await page.$("::-p-xpath(//div[contains(., 'Cancel')] | //div[contains(., 'Back')])");
    if (backBtn) {
      await backBtn.click();
      await delay(1000);
    } else {
      errors.push('Could not find Back/Cancel button on Send page');
    }

    console.log('Testing Settings...');
    await page.goto('http://localhost:5173/#/settings', { waitUntil: 'networkidle0' });
    await delay(1000);

    console.log('Testing Developer...');
    await page.goto('http://localhost:5173/#/developer', { waitUntil: 'networkidle0' });
    await delay(1000);

    console.log('Testing Networks...');
    await page.goto('http://localhost:5173/#/networks', { waitUntil: 'networkidle0' });
    await delay(1000);

    console.log('Testing Portfolio...');
    await page.goto('http://localhost:5173/#/portfolio', { waitUntil: 'networkidle0' });
    await delay(1000);

    console.log('Testing Activity...');
    await page.goto('http://localhost:5173/#/activity', { waitUntil: 'networkidle0' });
    await delay(1000);

  } catch (error) {
    errors.push(`ScriptException: ${error.message}`);
  } finally {
    await browser.close();
    
    console.log('--- QA REPORT ---');
    console.log(`Errors found: ${errors.length}`);
    errors.forEach(e => console.log('ERROR:', e));
    console.log(`Warnings found: ${warnings.length}`);
    warnings.forEach(w => console.log('WARN:', w));
  }
}

runQA();
