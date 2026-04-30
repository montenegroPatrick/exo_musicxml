const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({headless: "new"});
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  
  await page.goto('http://localhost:4200/score-musicxml?mock=lesson_playback_xml2');
  
  // Wait for the score to load
  await new Promise(r => setTimeout(r, 6000));
  
  // Try to click play
  console.log("Clicking play...");
  try {
    await page.evaluate(() => {
      const playBtn = document.querySelector('button.w-12.h-12'); // Usually play button has these classes
      if (playBtn) playBtn.click();
    });
  } catch (e) { console.log(e); }
  
  await new Promise(r => setTimeout(r, 3000));
  
  // Try to click the score somewhere
  console.log("Clicking score...");
  try {
     await page.mouse.click(500, 300);
  } catch (e) {}

  await new Promise(r => setTimeout(r, 3000));

  await browser.close();
})();
