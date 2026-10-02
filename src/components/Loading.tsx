import { useEffect, useState, useRef } from "react";
import "./styles/Loading.css";
import { useLoading } from "../context/LoadingContext";
import { initialFX } from "./utils/initialFX";

import Marquee from "react-fast-marquee";

const Loading = ({ percent }: { percent: number }) => {
  const { setIsLoading } = useLoading();
  const [loaded, setLoaded] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [clicked, setClicked] = useState(false);
  const completedRef = useRef(false);

  // Safety fallback: automatically complete if model takes too long
  useEffect(() => {
    const fallbackTimer = setTimeout(() => {
      if (!completedRef.current) {
        completedRef.current = true;
        setLoaded(true);
        setTimeout(() => {
          setIsLoaded(true);
        }, 500);
      }
    }, 2000);
    return () => clearTimeout(fallbackTimer);
  }, []);

  // Safe reaction to percent progress
  useEffect(() => {
    if (percent >= 100 && !completedRef.current) {
      completedRef.current = true;
      const t1 = setTimeout(() => {
        setLoaded(true);
        const t2 = setTimeout(() => {
          setIsLoaded(true);
        }, 600);
        return () => clearTimeout(t2);
      }, 300);
      return () => clearTimeout(t1);
    }
  }, [percent]);

  useEffect(() => {
    document.body.classList.add("scroll-locked");
    return () => {
      document.body.classList.remove("scroll-locked");
    };
  }, []);

  useEffect(() => {
    if (isLoaded) {
      setClicked(true);
      const timer = setTimeout(() => {
        try {
          if (initialFX) {
            initialFX();
          }
        } catch (e) {
          console.warn("initialFX error:", e);
        }
        setIsLoading(false);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [isLoaded, setIsLoading]);

  const handleManualDismiss = () => {
    if (completedRef.current && clicked) return;
    completedRef.current = true;
    setLoaded(true);
    setIsLoaded(true);
    setClicked(true);
    setTimeout(() => {
      try {
        if (initialFX) {
          initialFX();
        }
      } catch (e) {
        console.warn("initialFX error:", e);
      }
      setIsLoading(false);
    }, 300);
  };

  function handleMouseMove(e: React.MouseEvent<HTMLElement>) {
    const { currentTarget: target } = e;
    const rect = target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    target.style.setProperty("--mouse-x", `${x}px`);
    target.style.setProperty("--mouse-y", `${y}px`);
  }

  const displayPercent = Math.min(100, Math.max(0, Math.round(percent)));

  return (
    <>
      <div className="loading-header">
        <a href="/" className="loader-title flex items-center gap-2.5" data-cursor="disable">
          <img
            src="/images/bot_avatar.svg"
            alt="Mascot Logo"
            className="loader-logo-img"
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.currentTarget as HTMLElement).style.display = "none";
            }}
          />
          <span className="loader-logo-text">Dwireph Kumar</span>
        </a>
        <div className={`loaderGame ${clicked && "loader-out"}`}>
          <div className="loaderGame-container">
            <div className="loaderGame-in">
              {[...Array(27)].map((_, index) => (
                <div className="loaderGame-line" key={index}></div>
              ))}
            </div>
            <div className="loaderGame-ball"></div>
          </div>
        </div>
      </div>
      <div className="loading-screen" onClick={handleManualDismiss} title="Click to skip">
        <div className="loading-marquee">
          <Marquee>
            <span> A Creative Developer</span> <span>A Creative Designer</span>
            <span> A Creative Developer</span> <span>A Creative Designer</span>
          </Marquee>
        </div>
        <div
          className={`loading-wrap ${clicked && "loading-clicked"}`}
          onMouseMove={(e) => handleMouseMove(e)}
        >
          <div className="loading-hover"></div>
          <div className={`loading-button ${loaded && "loading-complete"}`}>
            <div className="loading-container">
              <div className="loading-content">
                <div className="loading-content-in">
                  Loading <span>{displayPercent}%</span>
                </div>
              </div>
              <div className="loading-box"></div>
            </div>
            <div className="loading-content2">
              <span>Welcome</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Loading;
