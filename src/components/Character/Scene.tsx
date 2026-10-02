import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { motion } from "motion/react";
import setCharacter from "./utils/character";
import setLighting from "./utils/lighting";
import { useLoading } from "../../context/LoadingContext";
import handleResize from "./utils/resizeUtils";
import {
  handleMouseMove,
  handleTouchEnd,
  handleHeadRotation,
  handleTouchMove,
} from "./utils/mouseUtils";
import setAnimations from "./utils/animationUtils";
import { setProgress } from "../utils/progress";
import { isWebGLSupported } from "../../utils/webgl";

const StaticDevAvatar = () => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative select-none">
      {/* Intense futuristic radial neon backlight */}
      <div className="absolute w-[260px] h-[260px] sm:w-[320px] sm:h-[320px] rounded-full bg-radial from-[#1fe5f5]/15 via-[#ff2a6d]/5 to-transparent filter blur-3xl opacity-80 pointer-events-none animate-pulse duration-[8s]"></div>
      
      {/* Sleek orbital rings for tech detail */}
      <div className="absolute w-[340px] h-[340px] border border-[#c2a4ff]/10 rounded-full pointer-events-none animate-spin [animation-duration:50s] hidden sm:block"></div>
      <div className="absolute w-[300px] h-[300px] border border-dashed border-[#ff2a6d]/10 rounded-full pointer-events-none animate-spin [animation-duration:35s] [animation-direction:reverse] hidden sm:block"></div>

      {/* Volumetric Floating Mascot */}
      <motion.div
        className="relative z-10 flex flex-col items-center group cursor-pointer"
        initial={{ y: 25, opacity: 0 }}
        animate={{ y: [0, -18, 0], opacity: 1 }}
        transition={{
          y: {
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          },
          opacity: { duration: 1.0 }
        }}
        whileHover={{ scale: 1.04 }}
      >
        {/* Render 3D-styled Mascot SVG with high contrast drop shadow */}
        <img
          src="/images/bot_avatar.svg"
          alt="3D Mascot Avatar"
          className="w-[260px] sm:w-[320px] md:w-[360px] h-auto drop-shadow-[0_20px_50px_rgba(31,229,245,0.22)] select-none transition-transform duration-300 group-hover:drop-shadow-[0_25px_60px_rgba(255,42,109,0.28)]"
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.currentTarget as HTMLElement).style.display = "none";
          }}
        />

        {/* Hover overlay text */}
        <div className="absolute -bottom-4 px-4 py-1.5 bg-[#0a0514]/95 backdrop-blur-md border border-[#c2a4ff]/20 rounded-full text-[10px] font-mono text-white tracking-wider opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none shadow-[0_0_15px_rgba(194,164,255,0.2)]">
          SATSRIAKAL! 👋
        </div>
      </motion.div>

      {/* Dynamic ground ambient shadow responding to the float */}
      <motion.div
        className="w-[150px] h-[10px] bg-[#000000]/60 rounded-full filter blur-md mt-6 pointer-events-none"
        animate={{
          scaleX: [1, 0.82, 1],
          scaleY: [1, 0.72, 1],
          opacity: [0.65, 0.35, 0.65],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      ></motion.div>
    </div>
  );
};

const Scene = () => {
  const canvasDiv = useRef<HTMLDivElement | null>(null);
  const hoverDivRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef(new THREE.Scene());
  const { setLoading } = useLoading();
  const [hasWebGL, setHasWebGL] = useState(() => isWebGLSupported());

  const [, setChar] = useState<THREE.Object3D | null>(null);

  useEffect(() => {
    setHasWebGL(isWebGLSupported());
  }, []);

  useEffect(() => {
    if (!hasWebGL) {
      setLoading(100);
      return;
    }

    const currentCanvasDiv = canvasDiv.current;
    if (currentCanvasDiv) {
      const rect = currentCanvasDiv.getBoundingClientRect();
      const container = { width: rect.width, height: rect.height };
      const aspect = container.width / container.height;
      const scene = sceneRef.current;

      let renderer: THREE.WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({
          alpha: true,
          antialias: true,
        });
      } catch (error) {
        console.error("WebGLRenderer creation failed inside Scene.tsx:", error);
        setHasWebGL(false);
        setLoading(100);
        return;
      }

      renderer.setSize(container.width, container.height);
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1;
      currentCanvasDiv.appendChild(renderer.domElement);

      const camera = new THREE.PerspectiveCamera(14.5, aspect, 0.1, 1000);
      camera.position.z = 10;
      camera.position.set(0, 13.1, 24.7);
      camera.zoom = 1.1;
      camera.updateProjectionMatrix();

      let headBone: THREE.Object3D | null = null;
      let screenLight: THREE.Object3D | null = null;
      let mixer: THREE.AnimationMixer;

      const clock = new THREE.Clock();

      let activeCharacter: THREE.Object3D | null = null;
      const onResize = () => {
        if (activeCharacter) {
          handleResize(renderer, camera, canvasDiv, activeCharacter);
        }
      };
      window.addEventListener("resize", onResize);

      const light = setLighting(scene);
      const progress = setProgress((value) => setLoading(value));
      const { loadCharacter } = setCharacter(renderer, scene, camera);

      loadCharacter().then((gltf) => {
        if (gltf) {
          const animations = setAnimations(gltf);
          if (hoverDivRef.current) {
            animations.hover(gltf, hoverDivRef.current);
          }
          mixer = animations.mixer;
          const loadedChar = gltf.scene;
          setChar(loadedChar);
          activeCharacter = loadedChar;
          scene.add(loadedChar);
          headBone = loadedChar.getObjectByName("spine006") || null;
          screenLight = loadedChar.getObjectByName("screenlight") || null;
          progress.loaded().then(() => {
            setTimeout(() => {
              light.turnOnLights();
              animations.startIntro();
            }, 2500);
          });
        } else {
          // Graceful fallback to gorgeous 3D-styled SVG avatar
          setHasWebGL(false);
          setLoading(100);
        }
      }).catch((error) => {
        console.log("Could not parse 3D character, falling back to 3D-styled SVG mascot.", error);
        setHasWebGL(false);
        setLoading(100);
      });

      let mouse = { x: 0, y: 0 },
        interpolation = { x: 0.1, y: 0.2 };

      const onMouseMove = (event: MouseEvent) => {
        handleMouseMove(event, (x, y) => (mouse = { x, y }));
      };
      let debounce: ReturnType<typeof setTimeout> | undefined;
      const onTouchStart = (event: TouchEvent) => {
        const element = event.target as HTMLElement;
        debounce = setTimeout(() => {
          element?.addEventListener("touchmove", (e: TouchEvent) =>
            handleTouchMove(e, (x, y) => (mouse = { x, y }))
          );
        }, 200);
      };

      const onTouchEnd = () => {
        handleTouchEnd((x, y, interpolationX, interpolationY) => {
          mouse = { x, y };
          interpolation = { x: interpolationX, y: interpolationY };
        });
      };

      document.addEventListener("mousemove", onMouseMove);
      const landingDiv = document.getElementById("landingDiv");
      if (landingDiv) {
        landingDiv.addEventListener("touchstart", onTouchStart);
        landingDiv.addEventListener("touchend", onTouchEnd);
      }

      let isVisible = true;
      let observer: IntersectionObserver | null = null;
      if (typeof IntersectionObserver !== "undefined" && currentCanvasDiv) {
        observer = new IntersectionObserver(([entry]) => {
          isVisible = entry.isIntersecting;
        }, { threshold: 0.05 });
        observer.observe(currentCanvasDiv);
      }

      let animationFrameId: number;
      const animate = () => {
        animationFrameId = requestAnimationFrame(animate);
        if (!isVisible) return;
        if (headBone) {
          handleHeadRotation(
            headBone,
            mouse.x,
            mouse.y,
            interpolation.x,
            interpolation.y,
            THREE.MathUtils.lerp
          );
          light.setPointLight(screenLight);
        }
        const delta = clock.getDelta();
        if (mixer) {
          mixer.update(delta);
        }
        renderer.render(scene, camera);
      };
      animate();
      return () => {
        cancelAnimationFrame(animationFrameId);
        if (observer) observer.disconnect();
        clearTimeout(debounce);
        scene.clear();
        renderer.dispose();
        window.removeEventListener("resize", onResize);
        document.removeEventListener("mousemove", onMouseMove);
        if (currentCanvasDiv) {
          currentCanvasDiv.removeChild(renderer.domElement);
        }
        if (landingDiv) {
          landingDiv.removeEventListener("touchstart", onTouchStart);
          landingDiv.removeEventListener("touchend", onTouchEnd);
        }
      };
    }
  }, [setLoading, hasWebGL]);

  return (
    <>
      <div className="character-container">
        <div className="character-model" ref={canvasDiv}>
          {!hasWebGL ? (
            <StaticDevAvatar />
          ) : (
            <>
              <div className="character-hover" ref={hoverDivRef}></div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Scene;
