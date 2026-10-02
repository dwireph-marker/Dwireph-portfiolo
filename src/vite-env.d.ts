/// <reference types="vite/client" />

declare module "gsap-trial/SplitText" {
  export class SplitText {
    constructor(target: unknown, vars?: unknown);
    chars: HTMLElement[];
    words: HTMLElement[];
    lines: HTMLElement[];
    revert(): void;
  }
  export default SplitText;
}

declare module "gsap-trial/ScrollSmoother" {
  export class ScrollSmoother {
    static create(vars: unknown): ScrollSmoother;
    static get(): ScrollSmoother;
    static refresh(vars?: unknown): void;
    scrollTop(value?: number): number | void;
    paused(value?: boolean): boolean | void;
    scrollTo(target: unknown, smooth?: boolean, position?: string): void;
  }
  export default ScrollSmoother;
}
