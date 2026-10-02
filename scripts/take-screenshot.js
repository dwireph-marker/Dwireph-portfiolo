import puppeteer from 'puppeteer';

async function main() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true });
  
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2500));

  await page.screenshot({ path: 'public/test-hero-0.png' });

  await page.evaluate(() => window.scrollTo(0, 300));
  await new Promise(r => setTimeout(r, 300));
  await page.screenshot({ path: 'public/test-hero-300.png' });

  const textInView = await page.evaluate(() => {
    // find all visible text in viewport at scroll 0
    const elements = Array.from(document.querySelectorAll('*'));
    const inView = [];
    elements.forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.top >= 0 && r.top < window.innerHeight && r.height > 0 && r.width > 0) {
        if (el.children.length === 0 && el.textContent?.trim()) {
          inView.push({ text: el.textContent.trim(), top: Math.round(r.top), bottom: Math.round(r.bottom) });
        }
      }
    });
    return inView;
  });

  console.log('Text elements in initial viewport (0 to 844):');
  console.log(JSON.stringify(textInView, null, 2));

  await browser.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
