import puppeteer from "puppeteer";

async function run() {
  const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox"] });

  const viewports = [
    { name: "desktop-1440", width: 1440, height: 900, isMobile: false },
    { name: "desktop-1920", width: 1920, height: 1080, isMobile: false },
    { name: "tablet-768", width: 768, height: 1024, isMobile: true },
    { name: "mobile-390", width: 390, height: 844, isMobile: true },
    { name: "mobile-430", width: 430, height: 932, isMobile: true },
    { name: "mobile-375", width: 375, height: 667, isMobile: true }
  ];

  for (const vp of viewports) {
    const page = await browser.newPage();
    await page.setViewport({ width: vp.width, height: vp.height, isMobile: vp.isMobile });
    await page.goto("http://localhost:3000", { waitUntil: "networkidle2" });
    await new Promise(r => setTimeout(r, 4000));

    const result = await page.evaluate(() => {
      const whatIDo = document.querySelector(".whatIDO");
      const whatBoxes = document.querySelectorAll(".what-box");
      const title = document.querySelector(".what-box .title");
      const whatBoxIn = document.querySelector(".what-box-in");
      const whatContents = document.querySelectorAll(".what-content");
      const career = document.getElementById("career") || document.querySelector(".career-section");
      const about = document.getElementById("about") || document.querySelector(".about-section");

      const whatRect = whatIDo?.getBoundingClientRect();
      const titleRect = title?.getBoundingClientRect();
      const boxInRect = whatBoxIn?.getBoundingClientRect();
      const careerRect = career?.getBoundingClientRect();
      const aboutRect = about?.getBoundingClientRect();

      let lastContentBottom = 0;
      whatContents.forEach(wc => {
        const r = wc.getBoundingClientRect();
        if (r.bottom > lastContentBottom) lastContentBottom = r.bottom;
      });

      return {
        whatIDo: {
          top: Math.round(whatRect?.top || 0),
          bottom: Math.round(whatRect?.bottom || 0),
          height: Math.round(whatRect?.height || 0),
          offsetHeight: whatIDo?.offsetHeight,
          clientHeight: whatIDo?.clientHeight,
          scrollHeight: whatIDo?.scrollHeight,
          computedHeight: window.getComputedStyle(whatIDo).height,
          computedPadding: window.getComputedStyle(whatIDo).padding,
          computedMargin: window.getComputedStyle(whatIDo).margin,
          computedDisplay: window.getComputedStyle(whatIDo).display,
        },
        titleRect: {
          top: Math.round(titleRect?.top || 0),
          bottom: Math.round(titleRect?.bottom || 0),
          height: Math.round(titleRect?.height || 0),
        },
        boxInRect: {
          top: Math.round(boxInRect?.top || 0),
          bottom: Math.round(boxInRect?.bottom || 0),
          height: Math.round(boxInRect?.height || 0),
          display: whatBoxIn ? window.getComputedStyle(whatBoxIn).display : "none",
          opacity: whatBoxIn ? window.getComputedStyle(whatBoxIn).opacity : "0",
        },
        lastContentBottom: Math.round(lastContentBottom),
        careerRect: {
          top: Math.round(careerRect?.top || 0),
          bottom: Math.round(careerRect?.bottom || 0),
        },
        aboutRect: {
          bottom: Math.round(aboutRect?.bottom || 0),
        },
        // Calculate gap between What I Do actual content bottom and career top:
        contentBottom: Math.round(Math.max(titleRect?.bottom || 0, boxInRect?.bottom || 0, lastContentBottom)),
        gapToNext: Math.round((careerRect?.top || 0) - Math.max(titleRect?.bottom || 0, boxInRect?.bottom || 0, lastContentBottom)),
        sectionGapToCareer: Math.round((careerRect?.top || 0) - (whatRect?.bottom || 0)),
        unusedVerticalSpace: Math.round((whatRect?.bottom || 0) - Math.max(titleRect?.bottom || 0, boxInRect?.bottom || 0, lastContentBottom)),
      };
    });

    console.log(`=== ${vp.name} (${vp.width}x${vp.height}) ===`);
    console.log(JSON.stringify(result, null, 2));

    await page.close();
  }

  await browser.close();
}

run();
