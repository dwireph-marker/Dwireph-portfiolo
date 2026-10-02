import puppeteer from 'puppeteer';

async function main() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
  });

  const viewports = [
    { name: 'iPhone SE (375x667)', width: 375, height: 667 },
    { name: 'iPhone 12/13/14 (390x844)', width: 390, height: 844 },
    { name: 'iPhone 14 Pro (393x852)', width: 393, height: 852 },
    { name: 'iPhone 15 Pro Max (430x932)', width: 430, height: 932 },
    { name: 'Galaxy S20 (360x800)', width: 360, height: 800 },
  ];

  for (const vp of viewports) {
    console.log(`\n========================================`);
    console.log(`TESTING VIEWPORT: ${vp.name}`);
    console.log(`========================================`);

    const page = await browser.newPage();
    await page.setViewport({ width: vp.width, height: vp.height, deviceScaleFactor: 2, isMobile: true });
    
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 30000 });
    // wait an extra 2.5 seconds for Loading screen to dismiss and initialFX to run
    await new Promise(r => setTimeout(r, 2500));

    const metrics = await page.evaluate(() => {
      const getBox = (el) => {
        if (!el) return null;
        const r = el.getBoundingClientRect();
        const s = window.getComputedStyle(el);
        return {
          tag: el.tagName,
          id: el.id,
          className: el.className,
          top: Math.round(r.top),
          bottom: Math.round(r.bottom),
          left: Math.round(r.left),
          right: Math.round(r.right),
          width: Math.round(r.width),
          height: Math.round(r.height),
          offsetHeight: el.offsetHeight,
          scrollHeight: el.scrollHeight,
          marginTop: s.marginTop,
          marginBottom: s.marginBottom,
          paddingTop: s.paddingTop,
          paddingBottom: s.paddingBottom,
          position: s.position,
          display: s.display,
          transform: s.transform,
        };
      };

      const hero = document.querySelector('.landing-section');
      const landingContainer = document.querySelector('.landing-container');
      const badge = document.querySelector('.welcome-badge-wrapper');
      const titles = document.querySelector('.landing-hero-titles');
      const mascot = document.querySelector('.floating-mascot-container');
      const heroText = document.querySelector('.hero-text');
      const typing = document.querySelector('.typing-container');
      const actions = document.querySelector('.landing-actions-container');
      const scrollDown = document.querySelector('.scroll-down-wrapper');
      const charContainer = document.querySelector('.character-container');
      const about = document.querySelector('.about-section');
      const aboutDashboard = document.querySelector('.about-dashboard');
      const smoothWrapper = document.querySelector('#smooth-wrapper');
      const smoothContent = document.querySelector('#smooth-content');
      const containerMains = Array.from(document.querySelectorAll('.container-main')).map(getBox);

      // Check pin-spacers
      const pinSpacers = Array.from(document.querySelectorAll('.pin-spacer')).map(getBox);

      // Elements between hero and about
      let betweenElements = [];
      if (hero && about) {
        let sibling = hero.nextElementSibling;
        while (sibling && sibling !== about) {
          betweenElements.push(getBox(sibling));
          sibling = sibling.nextElementSibling;
        }
      }

      return {
        windowHeight: window.innerHeight,
        windowWidth: window.innerWidth,
        hero: getBox(hero),
        landingContainer: getBox(landingContainer),
        badge: getBox(badge),
        titles: getBox(titles),
        mascot: getBox(mascot),
        heroText: getBox(heroText),
        typing: getBox(typing),
        actions: getBox(actions),
        scrollDown: getBox(scrollDown),
        charContainer: getBox(charContainer),
        about: getBox(about),
        aboutDashboard: getBox(aboutDashboard),
        gapBetweenHeroBottomAndAboutTop: (about && hero) ? Math.round(about.getBoundingClientRect().top - hero.getBoundingClientRect().bottom) : null,
        gapBetweenScrollDownBottomAndAboutTop: (about && scrollDown) ? Math.round(about.getBoundingClientRect().top - scrollDown.getBoundingClientRect().bottom) : null,
        pinSpacers,
        betweenElements,
        containerMains,
        smoothContent: getBox(smoothContent),
        smoothWrapper: getBox(smoothWrapper),
      };
    });

    console.log(JSON.stringify(metrics, null, 2));
    await page.close();
  }

  await browser.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
