import { useEffect, useRef } from "react";
import "./styles/Cursor.css";
import gsap from "gsap";

const Cursor = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let hover = false;
    let active = true;
    const cursor = cursorRef.current;
    if (!cursor) return;

    const mousePos = { x: 0, y: 0 };
    const cursorPos = { x: 0, y: 0 };

    const handleMouseMove = (e: MouseEvent) => {
      mousePos.x = e.clientX;
      mousePos.y = e.clientY;
    };

    document.addEventListener("mousemove", handleMouseMove);

    requestAnimationFrame(function loop() {
      if (!active) return;
      if (!hover && cursor) {
        const delay = 6;
        cursorPos.x += (mousePos.x - cursorPos.x) / delay;
        cursorPos.y += (mousePos.y - cursorPos.y) / delay;
        gsap.to(cursor, { x: cursorPos.x, y: cursorPos.y, duration: 0.1 });
      }
      requestAnimationFrame(loop);
    });

    const elements = document.querySelectorAll("[data-cursor]");
    const listeners: { element: HTMLElement; over: (e: MouseEvent) => void; out: () => void }[] = [];

    elements.forEach((item) => {
      const element = item as HTMLElement;
      const over = (e: MouseEvent) => {
        const target = e.currentTarget as HTMLElement;
        const rect = target.getBoundingClientRect();

        if (element.dataset.cursor === "icons") {
          cursor.classList.add("cursor-icons");
          gsap.to(cursor, { x: rect.left, y: rect.top, duration: 0.1 });
          cursor.style.setProperty("--cursorH", `${rect.height}px`);
          hover = true;
        }
        if (element.dataset.cursor === "disable") {
          cursor.classList.add("cursor-disable");
        }
      };

      const out = () => {
        cursor.classList.remove("cursor-disable", "cursor-icons");
        hover = false;
      };

      element.addEventListener("mouseover", over as EventListener);
      element.addEventListener("mouseout", out as EventListener);
      listeners.push({ element, over, out });
    });

    return () => {
      active = false;
      document.removeEventListener("mousemove", handleMouseMove);
      listeners.forEach(({ element, over, out }) => {
        element.removeEventListener("mouseover", over as EventListener);
        element.removeEventListener("mouseout", out as EventListener);
      });
    };
  }, []);

  return <div className="cursor-main" ref={cursorRef}></div>;
};

export default Cursor;
