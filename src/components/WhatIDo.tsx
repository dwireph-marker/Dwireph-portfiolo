import { useEffect, useRef } from "react";
import "./styles/WhatIDo.css";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useCMS } from "../context/CMSContext";



const WhatIDo = () => {
  const { content } = useCMS();
  const whatIDo = content.whatIDo;
  const services = whatIDo.services;

  const containerRef = useRef<(HTMLDivElement | null)[]>([]);
  const setRef = (el: HTMLDivElement | null, index: number) => {
    containerRef.current[index] = el;
  };

  useEffect(() => {
    const currentContainers = containerRef.current;
    const listeners = new Map<HTMLDivElement, () => void>();

    if (ScrollTrigger.isTouch) {
      currentContainers.forEach((container) => {
        if (container) {
          container.classList.remove("what-noTouch");
          const handler = () => handleClick(container);
          listeners.set(container, handler);
          container.addEventListener("click", handler);
        }
      });
    }
    return () => {
      currentContainers.forEach((container) => {
        if (container) {
          const handler = listeners.get(container);
          if (handler) {
            container.removeEventListener("click", handler);
          }
        }
      });
    };
  }, [services]);

  return (
    <div className="whatIDO">
      <div className="what-box">
        <h2 className="title">
          {whatIDo.title}
        </h2>
      </div>
      <div className="what-box">
        <div className="what-box-in">
          <div className="what-border2">
            <svg width="100%" height="100%">
              <line
                x1="0"
                y1="0"
                x2="0"
                y2="100%"
                stroke="white"
                strokeWidth="2"
                strokeDasharray="7,7"
              />
              <line
                x1="100%"
                y1="0"
                x2="100%"
                y2="100%"
                stroke="white"
                strokeWidth="2"
                strokeDasharray="7,7"
              />
            </svg>
          </div>

          {services.map((service, index) => (
            <div
              key={service.id || index}
              className="what-content what-noTouch"
              ref={(el) => setRef(el, index)}
            >
              <div className="what-border1">
                <svg width="100%" height="100%">
                  {index === 0 && (
                    <line
                      x1="0"
                      y1="0"
                      x2="100%"
                      y2="0"
                      stroke="white"
                      strokeWidth="2"
                      strokeDasharray="6,6"
                    />
                  )}
                  <line
                    x1="0"
                    y1="100%"
                    x2="100%"
                    y2="100%"
                    stroke="white"
                    strokeWidth="2"
                    strokeDasharray="6,6"
                  />
                </svg>
              </div>
              <div className="what-corner"></div>

              <div className="what-content-in">
                <h3>{service.title}</h3>
                <h4>Description</h4>
                <p>{service.description}</p>
                <h5>Skillset & tools</h5>
                <div className="what-content-flex">
                  {service.tags.map((tag, tagIdx) => (
                    <div key={tagIdx} className="what-tags">
                      {tag}
                    </div>
                  ))}
                </div>
                <div className="what-arrow"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WhatIDo;

function handleClick(container: HTMLDivElement) {
  container.classList.toggle("what-content-active");
  container.classList.remove("what-sibling");
  if (container.parentElement) {
    const siblings = Array.from(container.parentElement.children);

    siblings.forEach((sibling) => {
      if (sibling !== container) {
        sibling.classList.remove("what-content-active");
        sibling.classList.toggle("what-sibling");
      }
    });
  }
}
