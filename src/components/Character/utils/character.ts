import * as THREE from "three";
import { DRACOLoader, GLTF, GLTFLoader } from "three-stdlib";
import { setCharTimeline, setAllTimeline } from "../../utils/GsapScroll";

const setCharacter = (
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera
) => {
  const loader = new GLTFLoader();
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath("/draco/");
  loader.setDRACOLoader(dracoLoader);

  const loadCharacter = () => {
    return new Promise<GLTF | null>((resolve) => {
      let resolved = false;
      const timeout = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          console.log("Model load timed out. Falling back to mascot avatar.");
          resolve(null);
        }
      }, 2500);

      const load = async () => {
        try {
          let character: THREE.Object3D;
          loader.load(
            "/models/character.glb",
            async (gltf) => {
              if (resolved) return;
              resolved = true;
              clearTimeout(timeout);
              character = gltf.scene;
              try {
                await renderer.compileAsync(character, camera, scene);
              } catch (compileErr) {
                console.warn("compileAsync warning:", compileErr);
              }
              character.traverse((child: THREE.Object3D) => {
                if (child instanceof THREE.Mesh) {
                  child.castShadow = true;
                  child.receiveShadow = true;
                  child.frustumCulled = true;
                }
              });
              resolve(gltf);
              setCharTimeline(character, camera);
              setAllTimeline();
              const footR = character.getObjectByName("footR");
              if (footR) footR.position.y = 3.36;
              const footL = character.getObjectByName("footL");
              if (footL) footL.position.y = 3.36;
              dracoLoader.dispose();
            },
            undefined,
            () => {
              if (resolved) return;
              resolved = true;
              clearTimeout(timeout);
              console.log("Could not load binary GLTF model. Gracefully switching to SVG fallback.");
              resolve(null);
            }
          );
        } catch (err) {
          if (!resolved) {
            resolved = true;
            clearTimeout(timeout);
            console.error("Model load exception:", err);
            resolve(null);
          }
        }
      };
      load();
    });
  };

  return { loadCharacter };
};

export default setCharacter;
