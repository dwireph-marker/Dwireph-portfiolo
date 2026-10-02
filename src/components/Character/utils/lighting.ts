import * as THREE from "three";
import { gsap } from "gsap";

const createProceduralEnvMap = () => {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    // Fill deep dark indigo background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    bgGrad.addColorStop(0, "#080711");
    bgGrad.addColorStop(0.5, "#0d0b21");
    bgGrad.addColorStop(1, "#030207");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Warm top highlight studio light (simulating nice softbox)
    const light1 = ctx.createRadialGradient(512, 128, 5, 512, 128, 200);
    light1.addColorStop(0, "rgba(255, 255, 255, 0.6)");
    light1.addColorStop(0.3, "rgba(235, 220, 255, 0.3)");
    light1.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = light1;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Side soft magenta/pink glow
    const light2 = ctx.createRadialGradient(256, 256, 10, 256, 256, 250);
    light2.addColorStop(0, "rgba(255, 120, 200, 0.25)");
    light2.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = light2;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Dynamic blue rim highlight
    const light3 = ctx.createRadialGradient(768, 200, 15, 768, 200, 220);
    light3.addColorStop(0, "rgba(100, 180, 255, 0.3)");
    light3.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = light3;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.mapping = THREE.EquirectangularReflectionMapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
};

const setLighting = (scene: THREE.Scene) => {
  const directionalLight = new THREE.DirectionalLight(0xc7a9ff, 0);
  directionalLight.intensity = 0;
  directionalLight.position.set(-0.47, -0.32, -1);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = 1024;
  directionalLight.shadow.mapSize.height = 1024;
  directionalLight.shadow.camera.near = 0.5;
  directionalLight.shadow.camera.far = 50;
  scene.add(directionalLight);

  const pointLight = new THREE.PointLight(0xc2a4ff, 0, 100, 3);
  pointLight.position.set(3, 12, 4);
  pointLight.castShadow = true;
  scene.add(pointLight);

  const texture = createProceduralEnvMap();
  scene.environment = texture;
  scene.environmentIntensity = 0;
  scene.environmentRotation.set(5.76, 85.85, 1);

  function setPointLight(screenLight: THREE.Object3D | null | undefined) {
    if (!screenLight) return;
    const mesh = screenLight as THREE.Mesh;
    if (mesh.material && "opacity" in mesh.material) {
      const material = mesh.material as THREE.MeshStandardMaterial;
      if (material.opacity > 0.9) {
        pointLight.intensity = (material.emissiveIntensity ?? 0) * 20;
      } else {
        pointLight.intensity = 0;
      }
    }
  }
  const duration = 2;
  const ease = "power2.inOut";
  function turnOnLights() {
    gsap.to(scene, {
      environmentIntensity: 0.64,
      duration: duration,
      ease: ease,
    });
    gsap.to(directionalLight, {
      intensity: 1,
      duration: duration,
      ease: ease,
    });
    gsap.to(".character-rim", {
      y: "55%",
      opacity: 1,
      delay: 0.2,
      duration: 2,
    });
  }

  return { setPointLight, turnOnLights };
};

export default setLighting;
