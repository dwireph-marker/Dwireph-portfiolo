import fs from "node:fs/promises";
import path from "node:path";

/**
 * Vercel entry point.
 *
 * Keep public read-only CMS endpoints available from the bundled seed snapshot
 * if the server application cannot initialize (for example, an incompatible
 * server-only dependency or missing Firebase configuration). Normal requests
 * are delegated to Express whenever it imports successfully.
 */
let expressAppPromise: Promise<{ default: (req: any, res: any) => unknown }> | null = null;
let seedPromise: Promise<any> | null = null;

async function getSeed() {
  if (!seedPromise) {
    const candidates = [
      path.join(process.cwd(), "data", "seed-data.json"),
      path.join(process.cwd(), "..", "data", "seed-data.json"),
    ];
    seedPromise = (async () => {
      let lastError: unknown;
      for (const candidate of candidates) {
        try {
          const parsed = JSON.parse(await fs.readFile(candidate, "utf8"));
          if (!parsed?.settings || !parsed?.content || !Array.isArray(parsed?.projects)) {
            throw new Error("Seed data is missing settings, content, or projects.");
          }
          return parsed;
        } catch (error) {
          lastError = error;
        }
      }
      throw lastError instanceof Error ? lastError : new Error("Seed data is unavailable.");
    })().catch((error) => {
      seedPromise = null;
      throw error;
    });
  }
  return seedPromise;
}

function normalizePath(req: any) {
  const url = req.url || "/";
  // Vercel rewrites /api/content to /api/index while retaining the original URL
  // in req.url on supported runtimes. Strip query parameters before matching.
  return url.split("?")[0].replace(/\/$/, "") || "/";
}

export default async function handler(req: any, res: any) {
  try {
    if (!expressAppPromise) {
      expressAppPromise = import("../server.js") as Promise<{ default: (req: any, res: any) => unknown }>;
    }
    const appModule = await expressAppPromise;
    return appModule.default(req, res);
  } catch (startupError) {
    // Do not leak stack traces, environment values, or credentials to visitors.
    console.error("[API] Express application failed to initialize; public seed fallback is active.", startupError);
    if (req.method !== "GET") {
      return res.status(503).json({ success: false, error: "API temporarily unavailable." });
    }

    try {
      const seed = await getSeed();
      const route = normalizePath(req);
      if (route.endsWith("/settings")) return res.status(200).json({ success: true, settings: seed.settings, source: "seed-fallback" });
      if (route.endsWith("/content")) return res.status(200).json({ success: true, content: seed.content, source: "seed-fallback" });
      if (route.endsWith("/projects")) {
        const projects = seed.projects.filter((project: { published?: boolean }) => project.published !== false);
        return res.status(200).json({ success: true, projects, source: "seed-fallback" });
      }
      return res.status(503).json({ success: false, error: "API temporarily unavailable." });
    } catch (seedError) {
      console.error("[API] Public seed fallback failed.", seedError);
      return res.status(503).json({ success: false, error: "Website data is temporarily unavailable." });
    }
  }
}
