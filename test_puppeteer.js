const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => {
    if (msg.text().includes('[FlatService]')) {
        console.log('BROWSER LOG:', msg.text());
    }
  });

  await page.goto('http://localhost:4200/playback-score?mock=lesson_playback_xml2', { waitUntil: 'networkidle2' });
  
  // Wait a bit to ensure everything is loaded
  await new Promise(r => setTimeout(r, 5000));
  
  await browser.close();
})();
