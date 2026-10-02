import { ScrollTrigger } from "gsap/ScrollTrigger";

export class ScrollSmoother {
  private isPaused = false;

  static create(vars: unknown) {
    return new ScrollSmoother(vars);
  }

  constructor(vars: unknown) {
    if (vars) {
      // referenced to avoid unused warning
    }
    // Set up native smooth scroll styling
    const html = document.documentElement;
    if (html) {
      html.style.scrollBehavior = "smooth";
    }
  }

  scrollTop(value?: number): number {
    if (value !== undefined) {
      window.scrollTo({ top: value, behavior: "auto" });
      return value;
    }
    return window.scrollY || document.documentElement.scrollTop;
  }

  paused(value?: boolean): boolean | void {
    if (value !== undefined) {
      this.isPaused = value;
      if (value) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "auto";
        document.body.style.overflowX = "hidden";
      }
      return;
    }
    return this.isPaused;
  }

  scrollTo(target: unknown, smooth?: boolean, position?: string) {
    if (position) {
      // referenced to avoid unused warning
    }
    let y = 0;
    if (typeof target === "number") {
      y = target;
    } else if (typeof target === "string") {
      const element = document.querySelector(target);
      if (element) {
        const rect = element.getBoundingClientRect();
        y = rect.top + window.scrollY;
      }
    } else if (target instanceof HTMLElement) {
      const rect = target.getBoundingClientRect();
      y = rect.top + window.scrollY;
    }

    window.scrollTo({
      top: y,
      behavior: smooth ? "smooth" : "auto"
    });
  }

  static refresh(vars?: unknown) {
    if (vars) {
      // referenced to avoid unused warning
    }
    ScrollTrigger.refresh();
  }

  static get() {
    return new ScrollSmoother({});
  }
}

export default ScrollSmoother;
