import { PropsWithChildren, useEffect, useState } from "react";
import { ArrowRight, Download, Send } from "lucide-react";
import "./styles/Landing.css";
import { smoother } from "./utils/smoother";
import { useCMS } from "../context/CMSContext";

const Landing = ({ children }: PropsWithChildren) => {
  const { content } = useCMS();
  const hero = content.hero;

  const words = hero.typingWords;
  const [typedText, setTypedText] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const typingSpeed = 120;
  const deletingSpeed = 60;
  const delayBetweenWords = 1500;

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const currentWord = words[wordIndex % words.length] || "";

    if (isDeleting) {
      timer = setTimeout(() => {
        setTypedText(currentWord.substring(0, typedText.length - 1));
      }, deletingSpeed);
    } else {
      timer = setTimeout(() => {
        setTypedText(currentWord.substring(0, typedText.length + 1));
      }, typingSpeed);
    }

    // Handle word switching
    if (!isDeleting && typedText === currentWord) {
      timer = setTimeout(() => setIsDeleting(true), delayBetweenWords);
    } else if (isDeleting && typedText === "") {
      setIsDeleting(false);
      setWordIndex((prev) => (prev + 1) % words.length);
    }

    return () => clearTimeout(timer);
  }, [typedText, isDeleting, wordIndex, words]);

  const scrollToSection = (id: string) => {
    if (smoother) {
      smoother.scrollTo(id, true, "top top");
    } else {
      const el = document.querySelector(id);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const welcomeBadge = hero.welcomeBadge;
  const greetingPrefix = hero.namePrefix;
  const heroName = hero.name;
  const mascotImg = hero.mascotImage;
  const resumeUrl = hero.ctaResumeUrl;

  return (
    <>
      <div className="landing-section" id="landingDiv">
        <div className="landing-container">
          {/* Top Greeting Badge */}
          <div className="welcome-badge-wrapper">
            <div className="welcome-badge">
              <span className="sparkle-gold">✦</span>
              <span>{welcomeBadge}</span>
              <span className="hand-wave">👋</span>
              <span className="sparkle-gold">✦</span>
            </div>
          </div>

          {/* Central Typography Headings */}
          <div className="landing-hero-titles">
            {/* 3D Floating Mascot Avatar */}
            <div className="floating-mascot-container">
              <div className="mascot-glowing-backlight"></div>
              <img
                src={mascotImg}
                alt="3D Mascot Avatar"
                className="floating-mascot-img"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.opacity = "0";
                }}
              />
            </div>

            <h1 className="hero-text">
              <span className="hero-white">{greetingPrefix} </span>
              <span className="hero-gradient">{heroName}</span>
            </h1>

            {/* Dynamic typing animation */}
            <div className="typing-container">
              <span className="typing-prompt">&gt;</span>
              <span className="typing-text">{typedText}</span>
              <span className="typing-cursor">|</span>
            </div>
          </div>

          {/* Bottom Action Grid Buttons */}
          <div className="landing-actions-container">
            <button
              onClick={() => scrollToSection(hero.ctaProjectsLink)}
              className="action-btn btn-view-projects"
            >
              <ArrowRight size={14} className="btn-icon" />
              <span>{hero.ctaProjectsText}</span>
            </button>

            <a
              href={resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="action-btn btn-download-resume"
            >
              <Download size={14} className="btn-icon" />
              <span>{hero.ctaResumeText}</span>
            </a>

            <button
              onClick={() => scrollToSection(hero.ctaHireLink)}
              className="action-btn btn-hire-me"
            >
              <Send size={14} className="btn-icon" />
              <span>{hero.ctaHireText}</span>
            </button>
          </div>

          {/* Scroll Down Indicator */}
          <div className="scroll-down-wrapper" onClick={() => scrollToSection("#about")}>
            <span className="scroll-text">SCROLL DOWN</span>
            <div className="scroll-mouse">
              <div className="scroll-wheel"></div>
            </div>
          </div>
        </div>

        {/* Character overlay rendering children */}
        {children}
      </div>
    </>
  );
};

export default Landing;
