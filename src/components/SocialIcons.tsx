import {
  FaGithub,
  FaInstagram,
  FaLinkedinIn,
  FaXTwitter,
} from "react-icons/fa6";
import { TbNotes } from "react-icons/tb";
import { Globe } from "lucide-react";
import { useEffect, useMemo } from "react";
import HoverLinks from "./HoverLinks";
import { useCMS } from "../context/CMSContext";
import "./styles/SocialIcons.css";



const SocialIcons = () => {
  const { content } = useCMS();
  const socialLinks = useMemo(() => content.socialLinks.filter((s) => s.enabled !== false), [content.socialLinks]);
  const resumeUrl = content.hero.ctaResumeUrl;

  useEffect(() => {
    const social = document.getElementById("social") as HTMLElement;
    if (!social) return;

    social.querySelectorAll("span").forEach((item) => {
      const elem = item as HTMLElement;
      const link = elem.querySelector("a") as HTMLElement;
      if (!link) return;

      let mouseX = 0;
      let mouseY = 0;
      let currentX = 0;
      let currentY = 0;

      const updatePosition = () => {
        currentX += (mouseX - currentX) * 0.1;
        currentY += (mouseY - currentY) * 0.1;

        link.style.setProperty("--siLeft", `${currentX}px`);
        link.style.setProperty("--siTop", `${currentY}px`);

        requestAnimationFrame(updatePosition);
      };

      const onMouseMove = (e: MouseEvent) => {
        const rect = elem.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (x < 40 && x > 10 && y < 40 && y > 5) {
          mouseX = x;
          mouseY = y;
        } else {
          mouseX = rect.width / 2;
          mouseY = rect.height / 2;
        }
      };

      document.addEventListener("mousemove", onMouseMove);
      updatePosition();

      return () => {
        document.removeEventListener("mousemove", onMouseMove);
      };
    });
  }, [socialLinks]);

  const renderIcon = (iconName: string) => {
    switch (iconName?.toLowerCase()) {
      case "github":
        return <FaGithub />;
      case "linkedin":
        return <FaLinkedinIn />;
      case "twitter":
        return <FaXTwitter />;
      case "instagram":
        return <FaInstagram />;
      default:
        return <Globe size={16} />;
    }
  };

  return (
    <div className="icons-section">
      <div className="social-icons" data-cursor="icons" id="social">
        {socialLinks.map((item) => (
          <span key={item.id}>
            <a href={item.url} target="_blank" rel="noreferrer" title={item.platform}>
              {renderIcon(item.icon)}
            </a>
          </span>
        ))}
      </div>
      <a
        className="resume-button"
        href={resumeUrl}
        target="_blank"
        rel="noreferrer"
      >
        <HoverLinks text="RESUME" />
        <span>
          <TbNotes />
        </span>
      </a>
    </div>
  );
};

export default SocialIcons;
