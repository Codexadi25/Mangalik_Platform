const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  page.on('requestfailed', request => console.log('REQUEST FAILED:', request.url(), request.failure().errorText));

  console.log("Navigating to http://localhost:3001/login ...");
  await page.goto('http://localhost:3001/login', { waitUntil: 'networkidle2' });
  
  // Fill login
  console.log("Logging in...");
  await page.type('input[type="email"]', 'Rahul.Dhanlaxmienterprises@gmail.com');
  await page.type('input[type="password"]', 'asdfghjkl');
  await page.click('button[type="submit"]');

  await page.waitForNavigation({ waitUntil: 'networkidle2' }).catch(() => {});
  console.log("Current URL after login:", page.url());

  // wait a bit for react errors
  await new Promise(r => setTimeout(r, 2000));
  
  await browser.close();
})();
