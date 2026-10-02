import { useEffect, useState, useLayoutEffect, useRef, useMemo } from "react";
import "./styles/Work.css";
import WorkMedia from "./WorkMedia";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useCMS } from "../context/CMSContext";
import { isEditedVideoWork, getWorkTypeMeta } from "../utils/workType";
import { Film, Code } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const Work = () => {
  const { projects } = useCMS();
  const sectionRef = useRef<HTMLDivElement>(null);

  // Published items
  const listToRender = useMemo(() => {
    return projects.filter((p) => p.published !== false);
  }, [projects]);

  // Refresh ScrollTrigger when projects change
  useEffect(() => {
    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 150);
    return () => clearTimeout(timer);
  }, [listToRender]);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      // Single source-of-truth measurement function independent of CSS transforms
      const measureTrackMetrics = () => {
        const flex = sectionRef.current?.querySelector(".work-flex") as HTMLElement;
        const container = sectionRef.current?.querySelector(".work-container") as HTMLElement;
        if (!flex || !container) {
          return { scrollAmount: 0, trackWidth: 0, containerWidth: 0 };
        }
        const slides = Array.from(flex.querySelectorAll(".glass-slide")) as HTMLElement[];
        if (slides.length === 0) {
          return { scrollAmount: 0, trackWidth: 0, containerWidth: 0 };
        }

        // Calculate accurate layout width from slides independent of current transform:
        let totalTrackWidth = 0;
        slides.forEach((slide, idx) => {
          const slideWidth = slide.offsetWidth || 500;
          const style = window.getComputedStyle(slide);
          const marginRight = parseFloat(style.marginRight) || 40;
          totalTrackWidth += slideWidth + (idx < slides.length - 1 ? marginRight : 0);
        });

        const containerWidth = container.clientWidth || 1200;
        // 40px right padding so last card aligns nicely
        const scrollAmount = Math.max(0, totalTrackWidth - containerWidth + 40);
        return { scrollAmount, trackWidth: totalTrackWidth, containerWidth };
      };

      mm.add("(min-width: 1025px)", () => {
        const initialMetrics = measureTrackMetrics();
        if (initialMetrics.scrollAmount <= 0) {
          gsap.set(".work-flex", { x: 0 });
          gsap.set(".scroll-progress-bar", { width: "100%" });
          return;
        }

        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: () => `+=${measureTrackMetrics().scrollAmount}`,
            scrub: 0.3,
            pin: true,
            anticipatePin: 1,
            id: "work",
            invalidateOnRefresh: true,
          },
        });

        timeline.to(".work-flex", {
          x: () => -measureTrackMetrics().scrollAmount,
          ease: "none",
        });

        timeline.fromTo(
          ".scroll-progress-bar",
          { width: "0%" },
          { width: "100%", ease: "none" },
          0
        );

        // Attach listeners for image/video media loads within the track
        const mediaElements = sectionRef.current?.querySelectorAll("img, video");
        const handleMediaLoaded = () => {
          ScrollTrigger.refresh();
        };

        mediaElements?.forEach((media) => {
          if (media instanceof HTMLImageElement) {
            if (!media.complete) {
              media.addEventListener("load", handleMediaLoaded, { once: true });
              media.addEventListener("error", handleMediaLoaded, { once: true });
            }
          } else if (media instanceof HTMLVideoElement) {
            if (media.readyState < 1) {
              media.addEventListener("loadedmetadata", handleMediaLoaded, { once: true });
              media.addEventListener("error", handleMediaLoaded, { once: true });
            }
          }
        });

        const containerEl = sectionRef.current?.querySelector(".work-container") as HTMLElement;
        let resizeObserver: ResizeObserver | null = null;
        let timeoutId: number | null = null;
        if (containerEl && typeof ResizeObserver !== "undefined") {
          resizeObserver = new ResizeObserver(() => {
            if (timeoutId) window.clearTimeout(timeoutId);
            timeoutId = window.setTimeout(() => {
              ScrollTrigger.refresh();
            }, 150);
          });
          resizeObserver.observe(containerEl);
        }

        return () => {
          if (timeoutId) window.clearTimeout(timeoutId);
          if (resizeObserver && containerEl) {
            resizeObserver.unobserve(containerEl);
            resizeObserver.disconnect();
          }
        };
      });
    }, sectionRef);

    return () => {
      ctx.revert();
    };
  }, [listToRender]);

  return (
    <div
      ref={sectionRef}
      className="work-section"
      id="work"
      style={{ zIndex: 13, backgroundColor: "var(--backgroundColor)" }}
    >
      <div className="work-container section-container">
        <div className="work-header flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <h2>
              My <span>Work</span>
            </h2>
          </div>

          <div className="scroll-progress-container hidden sm:block">
            <div className="scroll-progress-bar"></div>
          </div>
        </div>

        <div className="work-flex">
          {listToRender.length === 0 ? (
            <div className="w-full py-16 flex flex-col items-center justify-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#9c8bb5] mb-4">
                <Film size={24} />
              </div>
              <h4 className="text-lg font-semibold text-white mb-1">No items found</h4>
              <p className="text-xs text-[#8a81a3] max-w-sm">
                No items are currently published under this category.
              </p>
            </div>
          ) : (
            listToRender.map((project, index) => {
            const numStr = (index + 1).toString().padStart(2, "0");
            const isVideo = isEditedVideoWork(project);
            const meta = getWorkTypeMeta(project);
            const accentColor = project.color || (isVideo ? "#EC4899" : "#A855F7");

            return (
              <div
                className="work-box glass-slide"
                key={project.id || index}
                style={{ "--accent-theme": accentColor } as React.CSSProperties}
              >
                <div className="slide-bg-watermark">{numStr}</div>
                <div className="slide-accent-glow" style={{ backgroundColor: accentColor }}></div>
                <div className="work-info">
                  <div className="work-title">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="project-category flex items-center gap-1 font-bold"
                        style={{ color: accentColor }}
                      >
                        {isVideo ? <Film size={11} /> : <Code size={11} />}
                        <span>{isVideo ? meta.label : project.category || "Project"}</span>
                      </span>
                    </div>
                    <h3>{project.title}</h3>
                  </div>
                  {project.description && (
                    <p className="text-xs text-[#8a81a3] mt-2 line-clamp-2">{project.description}</p>
                  )}
                  <div className="tools-container">
                    {project.tools ? (
                      project.tools.split(",").map((tool, idx) => (
                        <span className="tool-chip" key={idx}>
                          {tool.trim()}
                        </span>
                      ))
                    ) : (
                      <span className="tool-chip">
                        {isVideo ? "Premiere Pro, After Effects" : "React, TypeScript"}
                      </span>
                    )}
                  </div>
                </div>
                <WorkMedia project={project} />
              </div>
            );
          }))}
        </div>
      </div>
    </div>
  );
};

export default Work;
