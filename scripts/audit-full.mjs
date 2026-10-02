import puppeteer from "puppeteer";
import fs from "fs";

const viewports = [
  // Mobile Portrait
  { name: "360x800", w: 360, h: 800, mobile: true },
  { name: "360x740", w: 360, h: 740, mobile: true },
  { name: "375x667", w: 375, h: 667, mobile: true },
  { name: "375x812", w: 375, h: 812, mobile: true },
  { name: "390x844", w: 390, h: 844, mobile: true },
  { name: "393x873", w: 393, h: 873, mobile: true },
  { name: "402x874", w: 402, h: 874, mobile: true },
  { name: "414x896", w: 414, h: 896, mobile: true },
  { name: "430x932", w: 430, h: 932, mobile: true },
  { name: "480x1040", w: 480, h: 1040, mobile: true },

  // Tablets
  { name: "600x960", w: 600, h: 960, mobile: true },
  { name: "768x1024", w: 768, h: 1024, mobile: true },
  { name: "820x1180", w: 820, h: 1180, mobile: true },
  { name: "900x1200", w: 900, h: 1200, mobile: true },

  // Desktops
  { name: "1024x768", w: 1024, h: 768, mobile: false },
  { name: "1280x720", w: 1280, h: 720, mobile: false },
  { name: "1366x768", w: 1366, h: 768, mobile: false },
  { name: "1440x900", w: 1440, h: 900, mobile: false },
  { name: "1536x864", w: 1536, h: 864, mobile: false },
  { name: "1920x1080", w: 1920, h: 1080, mobile: false },

  // Landscape
  { name: "667x375", w: 667, h: 375, mobile: true },
  { name: "740x360", w: 740, h: 360, mobile: true },
  { name: "812x375", w: 812, h: 375, mobile: true },
  { name: "844x390", w: 844, h: 390, mobile: true },
  { name: "896x414", w: 896, h: 414, mobile: true },
  { name: "932x430", w: 932, h: 430, mobile: true },
];

async function run() {
  const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox"] });
  const results = [];

  for (const vp of viewports) {
    const page = await browser.newPage();
    await page.setViewport({ width: vp.w, height: vp.h, isMobile: vp.mobile });
    await page.goto("http://localhost:3000", { waitUntil: "networkidle2" });
    await new Promise(r => setTimeout(r, 2000));

    const data = await page.evaluate(() => {
      // 1. Horizontal overflow check
      const docScrollWidth = document.documentElement.scrollWidth;
      const winInnerWidth = window.innerWidth;
      const hasHorizontalOverflow = docScrollWidth > winInnerWidth;

      // Find overflowing elements if any
      const overflowingElements = [];
      if (hasHorizontalOverflow) {
        document.querySelectorAll("*").forEach(el => {
          const r = el.getBoundingClientRect();
          if (r.right > winInnerWidth + 2) {
            overflowingElements.push({
              tag: el.tagName,
              id: el.id,
              className: typeof el.className === "string" ? el.className.slice(0, 50) : "",
              right: Math.round(r.right),
              width: Math.round(r.width)
            });
          }
        });
      }

      // 2. Hero -> About measurements
      const hero = document.getElementById("landingDiv");
      const about = document.getElementById("about");
      const heroRect = hero?.getBoundingClientRect();
      const aboutRect = about?.getBoundingClientRect();
      const heroBottom = Math.round(heroRect?.bottom || 0);
      const aboutTop = Math.round(aboutRect?.top || 0);
      const heroAboutGap = Math.round(aboutTop - heroBottom);

      // 3. What I Do measurements
      const whatIDo = document.querySelector(".whatIDO");
      const heading = document.querySelector(".what-box h2");
      const boxIn = document.querySelector(".what-box-in");
      const cards = Array.from(document.querySelectorAll(".what-content"));
      const career = document.getElementById("career") || document.querySelector(".career-section");

      const whatRect = whatIDo?.getBoundingClientRect();
      const headingRect = heading?.getBoundingClientRect();
      const boxInRect = boxIn?.getBoundingClientRect();
      const careerRect = career?.getBoundingClientRect();

      let cardBottomMax = 0;
      cards.forEach(c => {
        const cr = c.getBoundingClientRect();
        if (cr.bottom > cardBottomMax) cardBottomMax = cr.bottom;
      });

      const whatSectionHeight = Math.round(whatRect?.height || 0);
      const contentHeight = Math.round(Math.max(
        (headingRect ? headingRect.bottom - (whatRect?.top || 0) : 0),
        (cardBottomMax ? cardBottomMax - (whatRect?.top || 0) : 0),
        (boxInRect ? boxInRect.bottom - (whatRect?.top || 0) : 0)
      ));
      const unusedSpaceWhatIDo = Math.round(whatSectionHeight - contentHeight);

      return {
        docScrollWidth,
        winInnerWidth,
        hasHorizontalOverflow,
        overflowingCount: overflowingElements.length,
        topOverflowElement: overflowingElements[0] || null,
        heroBottom,
        aboutTop,
        heroAboutGap,
        heroHeight: Math.round(heroRect?.height || 0),
        whatSectionHeight,
        contentHeight,
        unusedSpaceWhatIDo,
        boxInDisplay: boxIn ? window.getComputedStyle(boxIn).display : "none",
        boxInOpacity: boxIn ? window.getComputedStyle(boxIn).opacity : "0",
        whatToCareerGap: Math.round((careerRect?.top || 0) - (whatRect?.bottom || 0)),
      };
    });

    results.push({ name: vp.name, w: vp.w, h: vp.h, ...data });
    await page.close();
  }

  console.log(JSON.stringify(results, null, 2));
  fs.writeFileSync("/tmp/audit_results.json", JSON.stringify(results, null, 2));
  await browser.close();
}

run();
