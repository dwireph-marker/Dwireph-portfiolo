import puppeteer from "puppeteer";

async function run() {
  const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox"] });

  // Let us test multiple widths and scroll positions to see where the empty black area under "What I do" occurs!
  const widths = [1440, 1280, 1024, 900, 768, 430, 390];

  for (const w of widths) {
    const page = await browser.newPage();
    await page.setViewport({ width: w, height: 900, isMobile: w <= 820 });
    await page.goto("http://localhost:3000", { waitUntil: "networkidle2" });
    await new Promise(r => setTimeout(r, 4000));

    // Scroll to "What I do" section
    const whatIDoInfo = await page.evaluate(async () => {
      const el = document.querySelector(".whatIDO");
      if (!el) return { error: "No .whatIDO" };

      const rectBefore = el.getBoundingClientRect();
      const topBefore = rectBefore.top + window.scrollY;

      // Scroll so .whatIDO is at top of viewport
      window.scrollTo(0, topBefore);
      await new Promise(r => setTimeout(r, 800));

      const heading = document.querySelector(".what-box h2");
      const whatBoxIn = document.querySelector(".what-box-in");
      const contents = Array.from(document.querySelectorAll(".what-content")).map(c => {
        const r = c.getBoundingClientRect();
        const s = window.getComputedStyle(c);
        return {
          rect: { top: Math.round(r.top), bottom: Math.round(r.bottom), height: Math.round(r.height) },
          display: s.display,
          opacity: s.opacity,
          visibility: s.visibility,
          transform: s.transform
        };
      });

      const whatRect = el.getBoundingClientRect();
      const headingRect = heading?.getBoundingClientRect();
      const boxInRect = whatBoxIn?.getBoundingClientRect();
      const boxInStyle = whatBoxIn ? window.getComputedStyle(whatBoxIn) : null;
      const nextSection = document.getElementById("career") || document.querySelector(".career-section");
      const nextRect = nextSection?.getBoundingClientRect();

      return {
        scrollY: window.scrollY,
        whatRect: { top: Math.round(whatRect.top), bottom: Math.round(whatRect.bottom), height: Math.round(whatRect.height) },
        headingRect: headingRect ? { top: Math.round(headingRect.top), bottom: Math.round(headingRect.bottom), height: Math.round(headingRect.height) } : null,
        boxInRect: boxInRect ? { top: Math.round(boxInRect.top), bottom: Math.round(boxInRect.bottom), height: Math.round(boxInRect.height) } : null,
        boxInDisplay: boxInStyle?.display,
        boxInOpacity: boxInStyle?.opacity,
        boxInVisibility: boxInStyle?.visibility,
        contents,
        nextRect: nextRect ? { top: Math.round(nextRect.top), bottom: Math.round(nextRect.bottom) } : null,
        gapUnderHeading: nextRect && headingRect ? Math.round(nextRect.top - headingRect.bottom) : 0,
      };
    });

    console.log(`\n=== Width: ${w}px ===`);
    console.log(JSON.stringify(whatIDoInfo, null, 2));

    await page.close();
  }

  await browser.close();
}

run();
