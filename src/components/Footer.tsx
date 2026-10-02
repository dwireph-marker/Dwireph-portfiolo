import { FaGithub, FaInstagram, FaLinkedinIn, FaXTwitter } from "react-icons/fa6";
import { ArrowUp, Globe, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { smoother } from "./utils/smoother";
import { useCMS } from "../context/CMSContext";
import { useLoading } from "../context/LoadingContext";

const Footer = () => {
  const { content, settings } = useCMS();
  const { setView } = useLoading();
  const [currentTime, setCurrentTime] = useState("");

  const brandName = settings.navbar.brandName;
  const socialLinks = content.socialLinks.filter((s) => s.enabled !== false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleScrollToTop = () => {
    if (smoother) {
      smoother.scrollTo(0, true);
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const getIcon = (iconName: string) => {
    switch (iconName?.toLowerCase()) {
      case "github":
        return <FaGithub size={18} />;
      case "linkedin":
        return <FaLinkedinIn size={18} />;
      case "twitter":
        return <FaXTwitter size={18} />;
      case "instagram":
        return <FaInstagram size={18} />;
      default:
        return <Globe size={18} />;
    }
  };

  const getColor = (iconName: string) => {
    switch (iconName?.toLowerCase()) {
      case "github":
        return "hover:text-[#eae5ec] hover:border-[#eae5ec]/40 hover:shadow-[0_0_15px_rgba(234,229,236,0.25)]";
      case "linkedin":
        return "hover:text-[#0a66c2] hover:border-[#0a66c2]/40 hover:shadow-[0_0_15px_rgba(10,102,194,0.3)]";
      case "twitter":
        return "hover:text-[#1da1f2] hover:border-[#1da1f2]/40 hover:shadow-[0_0_15px_rgba(29,161,242,0.3)]";
      case "instagram":
        return "hover:text-[#e1306c] hover:border-[#e1306c]/40 hover:shadow-[0_0_15px_rgba(225,48,108,0.3)]";
      default:
        return "hover:text-[#a855f7] hover:border-[#a855f7]/40 hover:shadow-[0_0_15px_rgba(168,85,247,0.3)]";
    }
  };

  return (
    <footer className="relative w-full mt-20 z-10 bg-[#0b080c]/80 backdrop-blur-md border-t border-[#1a122a]/40 py-6 px-6 sm:px-10 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0 select-none">
      {/* Left side: Copyright & Live Status */}
      <div className="flex items-center gap-4 text-xs font-medium text-[#7c66a8]">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[10px] tracking-wider uppercase text-emerald-400 font-bold">
            AVAILABLE FOR CONTRACTS
          </span>
        </div>
        <span className="hidden sm:inline text-[#2d1b4e]">|</span>
        <span className="text-[#a094b8]">
          © {new Date().getFullYear()} {brandName}
        </span>
        <span className="hidden md:inline text-[#2d1b4e]">|</span>
        <span className="hidden md:inline font-mono text-[#7c66a8]/70">
          {currentTime ? `${currentTime} UTC` : ""}
        </span>
        <span className="text-[#2d1b4e]">|</span>
        <button
          onClick={() => setView("admin")}
          className="text-white bg-gradient-to-r from-[#1b0d36] to-[#291350] hover:from-[#2e155c] hover:to-[#3b1b75] border border-[#a855f7]/60 hover:border-[#c084fc] px-3 py-1 rounded-full flex items-center gap-1.5 transition-all duration-200 cursor-pointer text-[11px] font-semibold shadow-[0_2px_10px_rgba(168,85,247,0.3)] hover:scale-105 active:scale-95"
          title="Open Admin Console (Ctrl+Shift+A)"
          id="footer-admin-btn"
          data-cursor="disable"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <ShieldCheck size={13} className="text-[#d8b4fe]" />
          <span>Admin Panel</span>
        </button>
      </div>

      {/* Center: Social Icons with smooth transitions on hover */}
      <div className="flex items-center gap-3">
        {socialLinks.map((link) => (
          <motion.a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noreferrer"
            title={link.platform}
            className={`w-9 h-9 rounded-full bg-[#120a21]/50 border border-[#211538]/60 flex items-center justify-center text-[#7c66a8] transition-all duration-300 ${getColor(
              link.icon
            )}`}
            whileHover={{ y: -3, scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
          >
            {getIcon(link.icon)}
          </motion.a>
        ))}
      </div>

      {/* Right side: Back to Top */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleScrollToTop}
          className="flex items-center gap-2 text-xs font-semibold text-[#c2a4ff] hover:text-[#f43f5e] transition-colors duration-300 group cursor-pointer"
          title="Back to Top"
        >
          <span className="tracking-widest text-[10px] uppercase font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            BACK TO TOP
          </span>
          <div className="w-8 h-8 rounded-full bg-[#1c1135]/40 border border-[#c2a4ff]/20 flex items-center justify-center group-hover:border-[#f43f5e]/40 group-hover:shadow-[0_0_12px_rgba(244,63,94,0.2)] transition-all duration-300">
            <ArrowUp size={14} className="group-hover:-translate-y-0.5 transition-transform duration-300" />
          </div>
        </button>
      </div>
    </footer>
  );
};

export default Footer;
