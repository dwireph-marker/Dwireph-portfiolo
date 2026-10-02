import {
  jsx as _jsx,
  jsxs as _jsxs,
  Fragment as _Fragment,
} from "react/jsx-runtime";
import {
  useEffect,
  useState,
  useRef,
  type ChangeEvent,
  type MouseEvent,
} from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { gsap } from "gsap";
import ScrollSmoother from "./utils/ScrollSmootherMock";
import { smoother, setSmoother } from "./utils/smoother";
import {
  Search,
  Menu,
  X,
  ShieldCheck,
  FolderKanban,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { useCMS } from "../context/CMSContext";
import { useLoading } from "../context/LoadingContext";
import "./styles/Navbar.css";
gsap.registerPlugin(ScrollSmoother, ScrollTrigger);
const PORTFOLIO_SECTIONS = [
  {
    id: "sec-home",
    label: "Home",
    href: "#landingDiv",
    desc: "Hero introduction & 3D mascot",
  },
  {
    id: "sec-about",
    label: "About Me",
    href: "#about",
    desc: "Background, stats & highlights",
  },
  {
    id: "sec-services",
    label: "Services & Skills",
    href: "#what-i-do",
    desc: "Frontend, video editing & 3D design",
  },
  {
    id: "sec-career",
    label: "Experience & Timeline",
    href: "#career",
    desc: "Milestones and career journey",
  },
  {
    id: "sec-work",
    label: "Work & Projects",
    href: "#work",
    desc: "Portfolio projects & edited videos",
  },
  {
    id: "sec-contact",
    label: "Contact & Inquiries",
    href: "#contact",
    desc: "Send message & hire inquiry",
  },
];
const Navbar = () => {
  const { settings, projects } = useCMS();
  const { setView } = useLoading();
  const [timeStr, setTimeStr] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("#landingDiv");
  const searchWrapperRef = useRef<HTMLDivElement | null>(null);
  const brandName = settings.navbar.brandName;
  const brandStatus = settings.navbar.brandStatus;
  const brandVersion = settings.navbar.brandVersion;
  const hireButtonText = settings.navbar.hireButtonText;
  const hireButtonLink = settings.navbar.hireButtonLink;
  const navLinks = settings.navbar.navLinks.filter((l) => l.visible !== false);
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (searchOpen) setSearchOpen(false);
        if (mobileMenuOpen) setMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [searchOpen, mobileMenuOpen]);
  useEffect(() => {
    const handleOutsideClick = (e: globalThis.MouseEvent) => {
      if (
        searchWrapperRef.current &&
        e.target instanceof Node &&
        !searchWrapperRef.current.contains(e.target)
      ) {
        setSearchOpen(false);
      }
    };
    if (searchOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [searchOpen]);
  useEffect(() => {
    const sectionIds = [
      "landingDiv",
      "about",
      "what-i-do",
      "career",
      "work",
      "contact",
    ];
    const handleScroll = () => {
      const scrollPos = window.scrollY + 200;
      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const el = document.getElementById(sectionIds[i]);
        if (el) {
          const top = el.getBoundingClientRect().top + window.scrollY;
          if (scrollPos >= top) {
            setActiveSection(`#${sectionIds[i]}`);
            break;
          }
        }
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  useEffect(() => {
    const updateTime = () => {
      const options: Intl.DateTimeFormatOptions = {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      };
      const formatted = new Date().toLocaleTimeString("en-US", options);
      setTimeStr(`${formatted} IST`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);
  const queryLower = searchQuery.toLowerCase().trim();
  const matchedSections = PORTFOLIO_SECTIONS.filter(
    (sec) =>
      !queryLower ||
      sec.label.toLowerCase().includes(queryLower) ||
      sec.desc.toLowerCase().includes(queryLower),
  );
  const allProjects = projects;
  const matchedProjects = allProjects
    .filter(
      (p) =>
        queryLower &&
        (p.title.toLowerCase().includes(queryLower) ||
          p.category?.toLowerCase().includes(queryLower) ||
          (p.tools && p.tools.toLowerCase().includes(queryLower)) ||
          (p.description && p.description.toLowerCase().includes(queryLower))),
    )
    .slice(0, 5);
  useEffect(() => {
    const instance = ScrollSmoother.create({
      wrapper: "#smooth-wrapper",
      content: "#smooth-content",
      smooth: 1.7,
      speed: 1.7,
      effects: true,
      autoResize: true,
      ignoreMobileResize: true,
    });
    setSmoother(instance);
    instance.scrollTop(0);
    const handleResize = () => {
      ScrollSmoother.refresh(true);
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      (instance as ScrollSmoother & { kill?: () => void }).kill?.();
    };
  }, []);
  const handleNavClick = (targetId: string) => {
    setActiveSection(targetId);
    if (smoother) {
      smoother.scrollTo(targetId, true, "top top");
    } else {
      const el = document.querySelector(targetId);
      el?.scrollIntoView({ behavior: "smooth" });
    }
    setMobileMenuOpen(false);
  };
  return _jsxs(_Fragment, {
    children: [
      _jsxs("div", {
        className: "navbar-wrapper",
        children: [
          _jsxs("div", {
            className: "navbar-container",
            children: [
              _jsx("a", {
                href: "/",
                className: "navbar-logo-section",
                children: _jsxs("div", {
                  className: "logo-text-area",
                  children: [
                    _jsx("span", {
                      className: "logo-name",
                      children: brandName,
                    }),
                    _jsxs("div", {
                      className: "logo-subtext",
                      children: [
                        _jsx("span", { className: "scene-on-dot" }),
                        _jsx("span", {
                          className: "scene-on-text",
                          children: brandStatus,
                        }),
                      ],
                    }),
                    _jsx("span", {
                      className: "logo-version-tag",
                      children: brandVersion,
                    }),
                  ],
                }),
              }),
              _jsx("div", {
                className: "nav-capsule",
                children: navLinks.map((link, idx) => {
                  const isActive =
                    activeSection === link.href ||
                    (activeSection === "#landingDiv" && idx === 0);
                  return _jsx(
                    "a",
                    {
                      "data-href": link.href,
                      href: link.href,
                      onClick: (e: MouseEvent<HTMLAnchorElement>) => {
                        e.preventDefault();
                        handleNavClick(link.href);
                      },
                      className: `nav-link ${isActive ? "active" : ""}`,
                      children: link.label,
                    },
                    link.id || idx,
                  );
                }),
              }),
              _jsxs("div", {
                className: "nav-right-area",
                children: [
                  _jsx("div", {
                    className: "nav-clock-capsule",
                    children: _jsx("span", {
                      className: "clock-text",
                      children: timeStr || "18:07:50 IST",
                    }),
                  }),
                  _jsxs("div", {
                    className: "nav-search-wrapper",
                    ref: searchWrapperRef,
                    children: [
                      _jsx("button", {
                        className: "nav-search-btn",
                        onClick: () => {
                          setSearchOpen(!searchOpen);
                          if (!searchOpen) setSearchQuery("");
                        },
                        "aria-label": "Search",
                        title: "Search portfolio & projects (Esc to close)",
                        children: _jsx(Search, {
                          size: 14,
                          className: "text-[#c2a4ff]",
                        }),
                      }),
                      searchOpen &&
                        _jsxs("div", {
                          className: "search-popup-bubble",
                          children: [
                            _jsxs("div", {
                              className: "search-bubble-header",
                              children: [
                                _jsx(Search, {
                                  size: 13,
                                  className: "text-[#a855f7] shrink-0",
                                }),
                                _jsx("input", {
                                  type: "text",
                                  placeholder:
                                    "Search projects, skills, sections...",
                                  value: searchQuery,
                                  onChange: (e: ChangeEvent<HTMLInputElement>) =>
                                    setSearchQuery(e.target.value),
                                  className: "search-bubble-input",
                                  autoFocus: true,
                                }),
                                searchQuery &&
                                  _jsx("button", {
                                    type: "button",
                                    onClick: () => setSearchQuery(""),
                                    className:
                                      "text-[#8a7a9e] hover:text-white p-0.5 cursor-pointer",
                                    title: "Clear",
                                    children: _jsx(X, { size: 12 }),
                                  }),
                              ],
                            }),
                            _jsxs("div", {
                              className: "search-results-list",
                              children: [
                                matchedSections.length > 0 &&
                                  _jsxs("div", {
                                    className: "search-category-block",
                                    children: [
                                      _jsx("span", {
                                        className: "search-category-title",
                                        children: "Sections",
                                      }),
                                      matchedSections.map((sec) =>
                                        _jsxs(
                                          "button",
                                          {
                                            type: "button",
                                            onClick: () => {
                                              handleNavClick(sec.href);
                                              setSearchOpen(false);
                                            },
                                            className: "search-result-item",
                                            children: [
                                              _jsx(Sparkles, {
                                                size: 12,
                                                className:
                                                  "text-[#a855f7] shrink-0",
                                              }),
                                              _jsxs("div", {
                                                className:
                                                  "text-left flex-1 min-w-0",
                                                children: [
                                                  _jsx("span", {
                                                    className:
                                                      "search-result-name",
                                                    children: sec.label,
                                                  }),
                                                  _jsx("span", {
                                                    className:
                                                      "search-result-sub",
                                                    children: sec.desc,
                                                  }),
                                                ],
                                              }),
                                              _jsx(ArrowRight, {
                                                size: 11,
                                                className:
                                                  "text-[#6d5b84] shrink-0 opacity-0 group-hover:opacity-100",
                                              }),
                                            ],
                                          },
                                          sec.id,
                                        ),
                                      ),
                                    ],
                                  }),
                                matchedProjects.length > 0 &&
                                  _jsxs("div", {
                                    className: "search-category-block",
                                    children: [
                                      _jsx("span", {
                                        className: "search-category-title",
                                        children: "Projects",
                                      }),
                                      matchedProjects.map((p) =>
                                        _jsxs(
                                          "button",
                                          {
                                            type: "button",
                                            onClick: () => {
                                              handleNavClick("#work");
                                              setSearchOpen(false);
                                            },
                                            className: "search-result-item",
                                            children: [
                                              _jsx(FolderKanban, {
                                                size: 12,
                                                className:
                                                  "text-[#38bdf8] shrink-0",
                                              }),
                                              _jsxs("div", {
                                                className:
                                                  "text-left flex-1 min-w-0",
                                                children: [
                                                  _jsx("span", {
                                                    className:
                                                      "search-result-name truncate",
                                                    children: p.title,
                                                  }),
                                                  _jsx("span", {
                                                    className:
                                                      "search-result-sub truncate",
                                                    children:
                                                      p.tools || p.category,
                                                  }),
                                                ],
                                              }),
                                              _jsx(ArrowRight, {
                                                size: 11,
                                                className:
                                                  "text-[#6d5b84] shrink-0 opacity-0 group-hover:opacity-100",
                                              }),
                                            ],
                                          },
                                          p.id,
                                        ),
                                      ),
                                    ],
                                  }),
                                searchQuery.trim() &&
                                  matchedSections.length === 0 &&
                                  matchedProjects.length === 0 &&
                                  _jsx("div", {
                                    className: "search-no-results",
                                    children: _jsxs("span", {
                                      children: [
                                        'No matches found for "',
                                        searchQuery,
                                        '"',
                                      ],
                                    }),
                                  }),
                                !searchQuery.trim() &&
                                  _jsxs("div", {
                                    className: "search-quick-links",
                                    children: [
                                      _jsx("span", {
                                        className: "search-category-title",
                                        children: "Quick Jumps",
                                      }),
                                      _jsx("div", {
                                        className:
                                          "flex flex-wrap gap-1.5 pt-1",
                                        children: PORTFOLIO_SECTIONS.slice(
                                          1,
                                          5,
                                        ).map((sec) =>
                                          _jsx(
                                            "button",
                                            {
                                              type: "button",
                                              onClick: () => {
                                                handleNavClick(sec.href);
                                                setSearchOpen(false);
                                              },
                                              className: "search-quick-pill",
                                              children: sec.label,
                                            },
                                            sec.id,
                                          ),
                                        ),
                                      }),
                                    ],
                                  }),
                              ],
                            }),
                          ],
                        }),
                    ],
                  }),
                  _jsxs("button", {
                    onClick: () => setView("admin"),
                    className: "nav-admin-btn",
                    title: "Open Admin Panel (Ctrl+Shift+A)",
                    "aria-label": "Admin Panel",
                    id: "navbar-admin-btn",
                    "data-cursor": "disable",
                    children: [
                      _jsxs("span", {
                        className: "relative flex h-2 w-2",
                        children: [
                          _jsx("span", {
                            className:
                              "animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75",
                          }),
                          _jsx("span", {
                            className:
                              "relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_6px_#10b981]",
                          }),
                        ],
                      }),
                      _jsx(ShieldCheck, {
                        size: 15,
                        className: "text-[#e9d5ff]",
                      }),
                      _jsx("span", {
                        className: "nav-admin-text",
                        children: "Admin",
                      }),
                    ],
                  }),
                  _jsx("button", {
                    onClick: () => handleNavClick(hireButtonLink),
                    className: "nav-hire-btn hidden sm:block",
                    children: hireButtonText,
                  }),
                  _jsx("button", {
                    className: "mobile-menu-toggle lg:hidden",
                    onClick: () => setMobileMenuOpen(!mobileMenuOpen),
                    "aria-label": "Toggle Navigation Menu",
                    children: mobileMenuOpen
                      ? _jsx(X, { size: 20, color: "#c2a4ff" })
                      : _jsx(Menu, { size: 20, color: "#c2a4ff" }),
                  }),
                ],
              }),
            ],
          }),
          mobileMenuOpen &&
            _jsx("div", {
              className: "mobile-nav-backdrop",
              onClick: () => setMobileMenuOpen(false),
              "aria-hidden": "true",
            }),
          mobileMenuOpen &&
            _jsx("div", {
              className: "mobile-nav-sheet",
              children: _jsxs("div", {
                className: "mobile-nav-links",
                children: [
                  navLinks.map((link) => {
                    const isActive = activeSection === link.href;
                    return _jsx(
                      "button",
                      {
                        onClick: () => handleNavClick(link.href),
                        className: `mobile-nav-link ${isActive ? "active" : ""}`,
                        children: link.label,
                      },
                      link.id,
                    );
                  }),
                  _jsx("button", {
                    onClick: () => handleNavClick(hireButtonLink),
                    className: "mobile-hire-btn",
                    children: hireButtonText,
                  }),
                  _jsxs("button", {
                    onClick: () => {
                      setView("admin");
                      setMobileMenuOpen(false);
                    },
                    className: "mobile-admin-btn",
                    id: "mobile-admin-panel-btn",
                    children: [
                      _jsx(ShieldCheck, { size: 16 }),
                      _jsx("span", { children: "Admin Panel (CMS)" }),
                    ],
                  }),
                ],
              }),
            }),
        ],
      }),
      _jsx("div", { className: "landing-circle1" }),
      _jsx("div", { className: "landing-circle2" }),
      _jsx("div", { className: "nav-fade" }),
    ],
  });
};
export default Navbar;
