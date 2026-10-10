import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { defineConfig } from "vite";

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    // Make the deployment artifact location explicit for Vercel and local builds.
    build: {
      outDir: "dist",
      emptyOutDir: true,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes("node_modules")) return;
            if (/[\/]node_modules[\/](react|react-dom|scheduler)[\/]/.test(id)) return "vendor-react";
            if (/[\/]node_modules[\/](three|@react-three|three-stdlib)[\/]/.test(id)) return "vendor-three";
            if (/[\/]node_modules[\/](gsap|gsap-trial|motion)[\/]/.test(id)) return "vendor-animation";
            if (/[\/]node_modules[\/](@firebase|firebase|@google)[\/]/.test(id)) return "vendor-integrations";
            if (/[\/]node_modules[\/](lucide-react|react-icons)[\/]/.test(id)) return "vendor-icons";
            if (/[\/]node_modules[\/]/.test(id)) return "vendor-misc";
          },
        },
      },
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "."),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== "true",
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === "true" ? null : {},
    },
  };
});
