import puppeteer from "puppeteer";

async function snap() {
  const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox"] });
  
  const tests = [
    { name: "desktop-1440-top", w: 1440, h: 900, scroll: 0 },
    { name: "desktop-1440-whatido", w: 1440, h: 900, scrollSelector: ".whatIDO" },
    { name: "desktop-1920-whatido", w: 1920, h: 1080, scrollSelector: ".whatIDO" },
    { name: "mobile-390-hero", w: 390, h: 844, scroll: 0 },
    { name: "mobile-390-whatido", w: 390, h: 844, scrollSelector: ".whatIDO" },
    { name: "tablet-768-whatido", w: 768, h: 1024, scrollSelector: ".whatIDO" },
  ];

  for (const t of tests) {
    const page = await browser.newPage();
    await page.setViewport({ width: t.w, height: t.h, isMobile: t.w < 1024 });
    await page.goto("http://localhost:3000", { waitUntil: "networkidle2" });
    await new Promise(r => setTimeout(r, 2000));

    if (t.scrollSelector) {
      await page.evaluate((sel) => {
        const el = document.querySelector(sel);
        if (el) el.scrollIntoView({ block: "start" });
      }, t.scrollSelector);
      await new Promise(r => setTimeout(r, 1000));
    }

    await page.screenshot({ path: `/tmp/snap-${t.name}.png` });
    await page.close();
  }

  await browser.close();
  console.log("Screenshots taken successfully!");
}

snap();
