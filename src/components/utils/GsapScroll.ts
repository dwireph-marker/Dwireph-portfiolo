import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const textureLoader = new THREE.TextureLoader();
const screenTexture = textureLoader.load("/images/bot_avatar_3d_hoodie.png");
screenTexture.flipY = false;
screenTexture.colorSpace = THREE.SRGBColorSpace;


export function setCharTimeline(
  character: THREE.Object3D<THREE.Object3DEventMap> | null,
  camera: THREE.PerspectiveCamera
) {
  let intensity: number = 0;
  setInterval(() => {
    intensity = Math.random();
  }, 200);

  let screenLight: THREE.Mesh | undefined, monitor: THREE.Mesh | undefined;
  character?.children.forEach((object: THREE.Object3D) => {
    if (object.name === "Plane004") {
      object.children.forEach((child: THREE.Object3D) => {
        if (child instanceof THREE.Mesh) {
          const material = child.material as THREE.MeshStandardMaterial;
          if (material) {
            material.transparent = true;
            material.opacity = 0;
            if (material.name === "Material.027") {
              monitor = child;
              material.color.set("#FFFFFF");
              material.map = screenTexture;
              material.needsUpdate = true;
            }
          }
        }
      });
    }
    if (object.name === "screenlight" && object instanceof THREE.Mesh) {
      const material = object.material as THREE.MeshStandardMaterial;
      if (material) {
        material.transparent = true;
        material.opacity = 0;
        material.emissive.set("#C8BFFF");
        gsap.timeline({ repeat: -1, repeatRefresh: true }).to(material, {
          emissiveIntensity: () => intensity * 8,
          duration: () => Math.random() * 0.6,
          delay: () => Math.random() * 0.1,
        });
      }
      screenLight = object;
    }
  });
  const neckBone = character?.getObjectByName("spine005");
  if (window.innerWidth > 1024) {
    const tl1 = gsap.timeline({
      scrollTrigger: {
        trigger: ".landing-section",
        start: "top top",
        end: "bottom top",
        scrub: true,
        invalidateOnRefresh: true,
      },
    });
    const tl2 = gsap.timeline({
      scrollTrigger: {
        trigger: ".about-section",
        start: "center 55%",
        end: "bottom top",
        scrub: true,
        invalidateOnRefresh: true,
      },
    });
    const tl3 = gsap.timeline({
      scrollTrigger: {
        trigger: ".whatIDO",
        start: "top top",
        end: "bottom top",
        scrub: true,
        invalidateOnRefresh: true,
      },
    });

    if (character) {
      tl1
        .fromTo(character.rotation, { y: 0 }, { y: 0.7, duration: 1 }, 0)
        .to(camera.position, { z: 22 }, 0)
        .fromTo(".character-model", { opacity: 0, y: "20%", x: 0 }, { opacity: 1, y: "0%", x: "-25%", duration: 1 }, 0)
        .to(".landing-container", { opacity: 0, duration: 0.4 }, 0)
        .to(".landing-container", { y: "40%", duration: 0.8 }, 0)
        .fromTo(".about-info-col", { y: "80px", opacity: 0 }, { y: "0px", opacity: 1, duration: 0.8, ease: "power2.out" }, 0.2)
        .fromTo(".stats-card", { y: "120px", opacity: 0 }, { y: "0px", opacity: 1, stagger: 0.12, duration: 0.8, ease: "power2.out" }, 0.2);

      tl2
        .to(
          camera.position,
          { z: 75, y: 8.4, duration: 6, delay: 2, ease: "power3.inOut" },
          0
        )
        .to(".about-section", { y: "30%", duration: 6 }, 0)
        .to(".about-section", { opacity: 0, delay: 3, duration: 2 }, 0)
        .fromTo(
          ".character-model",
          { pointerEvents: "inherit" },
          { pointerEvents: "none", x: "-12%", delay: 2, duration: 5 },
          0
        )
        .to(character.rotation, { y: 0.92, x: 0.12, delay: 3, duration: 3 }, 0)
        .fromTo(
          ".character-rim",
          { opacity: 1, scaleX: 1.4 },
          { opacity: 0, scale: 0, y: "-70%", duration: 5, delay: 2 },
          0.3
        )
        .fromTo(
          ".what-box-in",
          { opacity: 0.6 },
          { opacity: 1, duration: 1, delay: 3 },
          0
        );

      if (neckBone) {
        tl2.to(neckBone.rotation, { x: 0.6, delay: 2, duration: 3 }, 0);
      }
      if (monitor) {
        if (monitor.material) {
          tl2.to(monitor.material, { opacity: 1, duration: 0.8, delay: 3.2 }, 0);
        }
        tl2.fromTo(
          monitor.position,
          { y: -10, z: 2 },
          { y: 0, z: 0, delay: 1.5, duration: 3 },
          0
        );
      }
      if (screenLight && screenLight.material) {
        tl2.to(screenLight.material, { opacity: 1, duration: 0.8, delay: 4.5 }, 0);
      }

      tl3
        .fromTo(
          ".character-model",
          { y: "0%" },
          { y: "-100%", duration: 4, ease: "none", delay: 1 },
          0
        )
        .fromTo(".whatIDO", { y: 0 }, { y: "0%", duration: 2 }, 0)
        .to(character.rotation, { x: -0.04, duration: 2, delay: 1 }, 0);
    }
  } else {
    // Mobile layout has default display: flex in CSS now, ensuring it's always visible and correctly placed!
  }
}

export function setAllTimeline() {
  // Clean up any existing ScrollTriggers for the career section to avoid overlap/stale triggers
  ScrollTrigger.getAll().forEach((trigger) => {
    if (trigger.vars && (trigger.vars as Record<string, unknown>).trigger === ".career-section") {
      trigger.kill();
    }
  });

  const careerTimeline = gsap.timeline({
    scrollTrigger: {
      trigger: ".career-section",
      start: "top 30%",
      end: "100% center",
      scrub: true,
      invalidateOnRefresh: true,
    },
  });
  
  careerTimeline
    .fromTo(
      ".career-timeline",
      { height: "10%" },
      { height: "100%", duration: 0.5 },
      0
    )

    .fromTo(
      ".career-timeline",
      { opacity: 0 },
      { opacity: 1, duration: 0.1 },
      0
    )
    .fromTo(
      ".career-info-box",
      { opacity: 0 },
      { opacity: 1, stagger: 0.1, duration: 0.5 },
      0
    )
    .fromTo(
      ".career-dot",
      { animationIterationCount: "infinite" },
      {
        animationIterationCount: "1",
        delay: 0.3,
        duration: 0.1,
      },
      0
    );

  // Refresh ScrollTrigger to recalculate layout positions for Career, Work and subsequent sections
  ScrollTrigger.refresh();
}
