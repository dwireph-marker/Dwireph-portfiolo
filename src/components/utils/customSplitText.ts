export default class SplitText {
  elements: HTMLElement[] = [];
  chars: HTMLElement[] = [];
  words: HTMLElement[] = [];
  lines: HTMLElement[] = [];
  _originals: { element: HTMLElement; html: string; css: string | null }[] = [];
  isSplit = false;

  constructor(
    target: string | HTMLElement | NodeList | HTMLElement[],
    vars: { tag?: string; linesClass?: string; wordsClass?: string; charsClass?: string; type?: string } = {}
  ) {
    if (typeof target === "string") {
      this.elements = Array.from(document.querySelectorAll(target));
    } else if (target instanceof HTMLElement) {
      this.elements = [target];
    } else if (target && (target instanceof NodeList || Array.isArray(target))) {
      this.elements = Array.from(target) as HTMLElement[];
    }

    this.elements = this.elements.filter((el) => el instanceof HTMLElement);

    this.elements.forEach((el) => {
      this._originals.push({
        element: el,
        html: el.innerHTML,
        css: el.getAttribute("style"),
      });
    });

    this.split(vars);
  }

  split(
    vars: { tag?: string; linesClass?: string; wordsClass?: string; charsClass?: string; type?: string } = {}
  ) {
    this.revert();

    const tag = vars.tag || "div";
    const linesClass = vars.linesClass || "";
    const wordsClass = vars.wordsClass || "";
    const charsClass = vars.charsClass || "";
    const type = vars.type || "chars,words,lines";
    const hasLines = type.includes("lines");
    const hasChars = type.includes("chars");

    this.chars = [];
    this.words = [];
    this.lines = [];

    this.elements.forEach((el) => {
      const text = el.textContent || "";
      el.innerHTML = "";

      const wordsArray = text.split(/\s+/).filter((w) => w.length > 0);
      const tempWordSpans: HTMLElement[] = [];

      wordsArray.forEach((wordText) => {
        const wordSpan = document.createElement(tag);
        wordSpan.style.display = "inline-block";
        wordSpan.style.position = "relative";
        wordSpan.style.whiteSpace = "nowrap";
        if (wordsClass) wordSpan.className = wordsClass;

        if (hasChars) {
          const charsArray = Array.from(wordText);
          charsArray.forEach((charText) => {
            const charSpan = document.createElement("span");
            charSpan.style.display = "inline-block";
            charSpan.style.position = "relative";
            charSpan.textContent = charText;
            if (charsClass) charSpan.className = charsClass;
            wordSpan.appendChild(charSpan);
            this.chars.push(charSpan);
          });
        } else {
          wordSpan.textContent = wordText;
        }

        tempWordSpans.push(wordSpan);
        this.words.push(wordSpan);
      });

      tempWordSpans.forEach((span, idx) => {
        el.appendChild(span);
        if (idx < tempWordSpans.length - 1) {
          el.appendChild(document.createTextNode(" "));
        }
      });

      if (hasLines && tempWordSpans.length > 0) {
        const linesMap = new Map<number, HTMLElement[]>();
        tempWordSpans.forEach((span) => {
          const top = span.offsetTop;
          if (!linesMap.has(top)) {
            linesMap.set(top, []);
          }
          linesMap.get(top)!.push(span);
        });

        el.innerHTML = "";
        Array.from(linesMap.keys())
          .sort((a, b) => a - b)
          .forEach((top) => {
            const lineWords = linesMap.get(top)!;
            const lineSpan = document.createElement(tag);
            lineSpan.style.display = "block";
            lineSpan.style.position = "relative";
            if (linesClass) lineSpan.className = linesClass;

            lineWords.forEach((wordSpan, idx) => {
              lineSpan.appendChild(wordSpan);
              if (idx < lineWords.length - 1) {
                lineSpan.appendChild(document.createTextNode(" "));
              }
            });

            el.appendChild(lineSpan);
            this.lines.push(lineSpan);
          });
      }
    });

    this.isSplit = true;
    return this;
  }

  revert() {
    this._originals.forEach((orig) => {
      orig.element.innerHTML = orig.html;
      if (orig.css !== null) {
        orig.element.setAttribute("style", orig.css);
      } else {
        orig.element.removeAttribute("style");
      }
    });
    this.chars = [];
    this.words = [];
    this.lines = [];
    this.isSplit = false;
    return this;
  }
}
