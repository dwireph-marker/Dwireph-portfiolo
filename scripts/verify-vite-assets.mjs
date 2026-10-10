import { access, readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

const outputDir = path.resolve(process.cwd(), "dist");
const indexPath = path.join(outputDir, "index.html");

try {
  await access(indexPath);
  const index = await readFile(indexPath, "utf8");
  if (!index.includes('<div id="root"></div>')) {
    throw new Error("dist/index.html does not contain the expected React root element.");
  }
  const assetsDir = path.join(outputDir, "assets");
  const assets = await readdir(assetsDir);
  if (!assets.some((file) => /\.(js|mjs)$/.test(file))) {
    throw new Error("No JavaScript bundle was found in dist/assets.");
  }
  if (!assets.some((file) => /\.css$/.test(file))) {
    console.warn("[build-check] No CSS bundle found in dist/assets; verify whether this is expected.");
  }
  const info = await stat(outputDir);
  if (!info.isDirectory()) throw new Error("dist exists but is not a directory.");
  console.log(`[build-check] Verified Vite output at ${outputDir} (${assets.length} assets).`);
} catch (error) {
  console.error(`[build-check] Vite output verification failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
}
