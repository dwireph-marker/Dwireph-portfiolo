import SplitText from "./customSplitText";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function initialFX() {
  const mainElement = document.getElementsByTagName("main")[0];
  if (mainElement) {
    mainElement.classList.add("main-active");
  }
  gsap.to("body", {
    backgroundColor: "#000000",
    duration: 0.5,
    delay: 1,
  });

  // Safe SplitText/GSAP for welcome-badge
  const welcomeBadge = document.querySelector(".welcome-badge");
  if (welcomeBadge) {
    const splitWelcome = new SplitText(welcomeBadge as HTMLElement, {
      type: "chars",
    });
    if (splitWelcome.chars && splitWelcome.chars.length > 0) {
      gsap.fromTo(
        splitWelcome.chars,
        { opacity: 0, y: 30, filter: "blur(3px)" },
        {
          opacity: 1,
          duration: 1.0,
          filter: "blur(0px)",
          ease: "power2.out",
          y: 0,
          stagger: 0.015,
          delay: 0.1,
        }
      );
    }
  }

  // Safe SplitText/GSAP for hero-text
  const heroText = document.querySelector(".hero-text");
  if (heroText) {
    const splitHero = new SplitText(heroText as HTMLElement, {
      type: "chars",
    });
    if (splitHero.chars && splitHero.chars.length > 0) {
      gsap.fromTo(
        splitHero.chars,
        { opacity: 0, y: 60, filter: "blur(5px)" },
        {
          opacity: 1,
          duration: 1.2,
          filter: "blur(0px)",
          ease: "power3.out",
          y: 0,
          stagger: 0.03,
          delay: 0.3,
        }
      );
    }
  }

  // Safe GSAP animations for other landing elements that are present
  const elementsToAnimate = [
    { selector: ".typing-container", y: 20, delay: 0.8 },
    { selector: ".landing-actions-container", y: 30, delay: 1.0 },
    { selector: ".scroll-down-wrapper", y: 15, delay: 1.1 },
    { selector: ".navbar-wrapper", y: -30, delay: 0.5 },
    { selector: ".icons-section", y: 20, delay: 0.6 },
    { selector: ".nav-fade", y: 0, delay: 0.5 },
  ];

  elementsToAnimate.forEach(({ selector, y, delay }) => {
    const el = document.querySelector(selector);
    if (el) {
      gsap.fromTo(
        el,
        { opacity: 0, y },
        {
          opacity: 1,
          y: 0,
          duration: 1.0,
          ease: "power2.out",
          delay,
        }
      );
    }
  });

  // Refresh ScrollTrigger to calculate all layout heights/scroll positions accurately
  ScrollTrigger.refresh();
}

