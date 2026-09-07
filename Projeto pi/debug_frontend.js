import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  page.on('console', msg => {
    console.log(`BROWSER CONSOLE [${msg.type()}]:`, msg.text());
  });
  
  page.on('pageerror', error => {
    console.log('BROWSER ERROR:', error.message);
  });
  
  page.on('requestfailed', request => {
    console.log(`REQUEST FAILED: ${request.url()} - ${request.failure().errorText}`);
  });

  console.log('Navigating to http://localhost...');
  await page.goto('http://localhost', { waitUntil: 'networkidle0', timeout: 15000 });
  
  console.log('Page loaded. Taking screenshot...');
  await page.screenshot({ path: 'screenshot.png' });
  
  await browser.close();
})();
