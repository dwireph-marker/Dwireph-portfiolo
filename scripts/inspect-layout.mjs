import puppeteer from "puppeteer";

async function inspectLayout() {
  const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox"] });
  
  // Test 1: Desktop 1440x900 - What I Do layout details
  {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto("http://localhost:3000", { waitUntil: "networkidle2" });
    await new Promise(r => setTimeout(r, 2000));

    // Scroll to whatIDO
    await page.evaluate(() => {
      document.querySelector(".whatIDO")?.scrollIntoView({ block: "start" });
    });
    await new Promise(r => setTimeout(r, 1000));

    const details = await page.evaluate(() => {
      const whatIDO = document.querySelector(".whatIDO");
      const titleBox = document.querySelector(".whatIDO .what-box:first-child");
      const titleH2 = document.querySelector(".what-box h2");
      const contentBox = document.querySelector(".whatIDO .what-box:nth-child(2)");
      const boxIn = document.querySelector(".what-box-in");
      const cards = Array.from(document.querySelectorAll(".what-content"));

      const whatRect = whatIDO?.getBoundingClientRect();
      const titleH2Rect = titleH2?.getBoundingClientRect();
      const contentBoxRect = contentBox?.getBoundingClientRect();
      const boxInRect = boxIn?.getBoundingClientRect();

      return {
        whatRect: { top: whatRect?.top, bottom: whatRect?.bottom, height: whatRect?.height },
        titleH2Rect: { top: titleH2Rect?.top, bottom: titleH2Rect?.bottom, height: titleH2Rect?.height },
        contentBoxRect: { top: contentBoxRect?.top, bottom: contentBoxRect?.bottom, height: contentBoxRect?.height },
        boxInRect: { top: boxInRect?.top, bottom: boxInRect?.bottom, height: boxInRect?.height },
        cards: cards.map(c => {
          const r = c.getBoundingClientRect();
          return {
            title: c.querySelector("h3")?.innerText,
            top: r.top,
            bottom: r.bottom,
            height: r.height,
            opacity: window.getComputedStyle(c).opacity,
            display: window.getComputedStyle(c).display
          };
        }),
        spaceBelowHeadingToSectionBottom: Math.round((whatRect?.bottom || 0) - (titleH2Rect?.bottom || 0)),
        spaceBelowContentToSectionBottom: Math.round((whatRect?.bottom || 0) - (boxInRect?.bottom || 0)),
      };
    });
    console.log("DESKTOP 1440 What I Do:", JSON.stringify(details, null, 2));
    await page.close();
  }

  // Test 2: Mobile 390x844 - Hero spacing and elements
  {
    const page = await browser.newPage();
    await page.setViewport({ width: 390, height: 844, isMobile: true });
    await page.goto("http://localhost:3000", { waitUntil: "networkidle2" });
    await new Promise(r => setTimeout(r, 2000));

    const heroDetails = await page.evaluate(() => {
      const hero = document.getElementById("landingDiv");
      const landingContainer = document.querySelector(".landing-container");
      const welcomeBadge = document.querySelector(".welcome-badge-wrapper");
      const titles = document.querySelector(".landing-hero-titles");
      const mascot = document.querySelector(".floating-mascot-container");
      const heroText = document.querySelector(".hero-text");
      const typing = document.querySelector(".typing-container");
      const actions = document.querySelector(".landing-actions-container");
      const scrollDown = document.querySelector(".scroll-down-wrapper");
      const about = document.getElementById("about");

      const rect = el => {
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return { top: Math.round(r.top), bottom: Math.round(r.bottom), height: Math.round(r.height) };
      };

      return {
        viewport: { width: window.innerWidth, height: window.innerHeight },
        hero: rect(hero),
        landingContainer: rect(landingContainer),
        welcomeBadge: rect(welcomeBadge),
        titles: rect(titles),
        mascot: rect(mascot),
        heroText: rect(heroText),
        typing: rect(typing),
        actions: rect(actions),
        scrollDown: rect(scrollDown),
        about: rect(about),
        gapScrollDownToAbout: Math.round((about?.getBoundingClientRect().top || 0) - (scrollDown?.getBoundingClientRect().bottom || 0)),
      };
    });
    console.log("MOBILE 390 Hero Details:", JSON.stringify(heroDetails, null, 2));
    await page.close();
  }

  await browser.close();
}

inspectLayout();
