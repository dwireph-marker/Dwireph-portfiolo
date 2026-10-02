import express from "express";
import path from "path";
import crypto from "node:crypto";
import cookieParser from "cookie-parser";
import "./server/env.js";
import { serverDB, ensureDatabaseReady } from "./server/db.js";
import { getImageKitVideoPlaybackUrl } from "./server/imagekit.js";
import { IMAGEKIT_PRIVATE_KEY, IMAGEKIT_PUBLIC_KEY, IMAGEKIT_URL_ENDPOINT } from "./server/env.js";

const app = express();
app.set("trust proxy", process.env.TRUST_PROXY_HOPS ? Number(process.env.TRUST_PROXY_HOPS) : 0);

const PORT = Number(process.env.PORT) || 3000;
const IS_PRODUCTION = process.env.NODE_ENV === "production";
const IS_VERCEL = process.env.VERCEL === "1";

function getExpectedOrigin(req: express.Request): string | null {
  const configured = process.env.APP_ORIGIN?.trim().replace(/\/$/, "");
  if (configured) return configured;
  const host = req.get("host");
  if (!host) return null;
  const protocol = IS_PRODUCTION ? "https" : req.protocol;
  return `${protocol}://${host}`;
}

app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-XSS-Protection", "0");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  res.setHeader("Cross-Origin-Resource-Policy", "same-origin");
  res.setHeader(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=()",
  );
  res.setHeader(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "frame-ancestors 'none'",
      "form-action 'self'",
      "img-src 'self' https: data: blob:",
      "media-src 'self' https: blob:",
      "font-src 'self' https: data:",
      "connect-src 'self' https:",
      "style-src 'self' 'unsafe-inline' https:",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https:",
    ].join("; "),
  );
  if (IS_PRODUCTION) {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }
  next();
});

// This application uses same-origin cookie authentication. Never reflect an
// arbitrary Origin while allowing credentials. For unsafe requests we also
// enforce the expected browser Origin as a CSRF defense-in-depth measure.
app.use((req, res, next) => {
  if (req.method === "OPTIONS") return res.sendStatus(204);
  const origin = req.get("origin");
  if (["GET", "HEAD"].includes(req.method)) return next();
  const expectedOrigin = getExpectedOrigin(req);
  if (origin && expectedOrigin && origin !== expectedOrigin) {
    return res.status(403).json({ success: false, error: "Invalid request origin." });
  }
  if (IS_PRODUCTION && !origin && req.path.startsWith("/api/")) {
    return res.status(403).json({ success: false, error: "Missing request origin." });
  }
  next();
});

app.use(express.json({ limit: "512kb", strict: true }));
app.use(express.urlencoded({ extended: false, limit: "256kb" }));
app.use(cookieParser());
const loginAttempts = new Map<
  string,
  { count: number; firstFailedAt: number; lockedUntil?: number }
>();
const loginIpAttempts = new Map<string, { count: number; resetAt: number }>();

function checkIpLoginRateLimit(ip: string) {
  const now = Date.now();
  const max = 20;
  const windowMs = 10 * 60 * 1000;
  const existing = loginIpAttempts.get(ip);
  if (!existing || now >= existing.resetAt) {
    loginIpAttempts.set(ip, { count: 1, resetAt: now + windowMs });
    return { allowed: true, waitSeconds: 0 };
  }
  if (existing.count >= max) return { allowed: false, waitSeconds: Math.ceil((existing.resetAt - now) / 1000) };
  existing.count += 1;
  return { allowed: true, waitSeconds: 0 };
}

// Keep brute-force protection, but scope it to IP + account identifier so a
// typo for one account cannot lock every administrator behind the same NAT.
// Values are configurable through environment variables and are intentionally
// not persisted in Firestore: restarting the server clears only the temporary
// in-memory lock state.
const LOGIN_MAX_ATTEMPTS = Math.max(3, Number(process.env.LOGIN_MAX_ATTEMPTS) || 5);
const LOGIN_WINDOW_MS = Math.max(60_000, Number(process.env.LOGIN_WINDOW_MINUTES) || 10) * 60_000;
const LOGIN_LOCKOUT_MS = Math.max(60_000, Number(process.env.LOGIN_LOCKOUT_MINUTES) || 10) * 60_000;

function getLoginRateLimitKey(ip: string, email?: string) {
  const account = email?.trim().toLowerCase() || "__no_email__";
  return `${ip}|${account}`;
}

function checkLoginRateLimit(key: string): {
  allowed: boolean;
  waitSeconds?: number;
} {
  const record = loginAttempts.get(key);
  if (!record) return { allowed: true };

  const now = Date.now();
  if (record.lockedUntil) {
    if (now < record.lockedUntil) {
      return {
        allowed: false,
        waitSeconds: Math.ceil((record.lockedUntil - now) / 1000),
      };
    }
    loginAttempts.delete(key);
    return { allowed: true };
  }

  // Start a fresh rolling window after the previous one expires.
  if (now - record.firstFailedAt >= LOGIN_WINDOW_MS) {
    loginAttempts.delete(key);
    return { allowed: true };
  }

  return { allowed: true };
}

function recordLoginAttempt(key: string, success: boolean) {
  if (success) {
    loginAttempts.delete(key);
    return;
  }

  const now = Date.now();
  const existing = loginAttempts.get(key);
  const current = existing && now - existing.firstFailedAt < LOGIN_WINDOW_MS
    ? existing
    : { count: 0, firstFailedAt: now };

  current.count += 1;
  if (current.count >= LOGIN_MAX_ATTEMPTS) {
    current.lockedUntil = now + LOGIN_LOCKOUT_MS;
  }

  loginAttempts.set(key, current);
}
const uploadAttempts = new Map<string, { count: number; resetAt: number }>();
function checkUploadRateLimit(key: string) {
  const now = Date.now();
  const windowMs = 60 * 60 * 1000;
  const maxUploads = 20;
  const current = uploadAttempts.get(key);
  if (!current || now >= current.resetAt) {
    uploadAttempts.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  }
  if (current.count >= maxUploads) return { allowed: false, retryAfterSeconds: Math.ceil((current.resetAt - now) / 1000) };
  current.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}

const contactAttempts = new Map<string, { count: number; resetAt: number }>();
function checkContactRateLimit(ip: string): {
  allowed: boolean;
  retryAfterSeconds?: number;
} {
  const now = Date.now();
  const windowMs = 10 * 60 * 1000;
  const maxAttempts = 5;
  const record = contactAttempts.get(ip);
  if (!record || now > record.resetAt) {
    contactAttempts.set(ip, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }
  if (record.count >= maxAttempts) {
    const retryAfterSeconds = Math.ceil((record.resetAt - now) / 1000);
    return { allowed: false, retryAfterSeconds };
  }
  record.count += 1;
  return { allowed: true };
}
function getSessionToken(req: express.Request): string | undefined {
  return typeof req.cookies?.admin_session === "string" ? req.cookies.admin_session : undefined;
}

function getCsrfToken(req: express.Request): string | undefined {
  return typeof req.cookies?.admin_csrf === "string" ? req.cookies.admin_csrf : undefined;
}

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

async function requireAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  try {
    const token = getSessionToken(req);
    if (!token) return res.status(401).json({ success: false, error: "Unauthorized." });
    const session = await serverDB.verifySession(token);
    if (!session || !session.firebaseUid) return res.status(401).json({ success: false, error: "Unauthorized." });
    // Authorization is resolved from Firebase Auth + the UID-keyed Firestore admin record,
    // not from a client-controlled role or a stale session field.
    const adminProfile = await serverDB.getAdminProfile(session.firebaseUid);
    if (!adminProfile || !["admin", "superadmin"].includes(adminProfile.role)) {
      await serverDB.destroySession(token);
      return res.status(403).json({ success: false, error: "Forbidden." });
    }
    session.role = adminProfile.role;
    session.email = adminProfile.email;
    if (!["GET", "HEAD", "OPTIONS"].includes(req.method)) {
      const csrfHeader = req.get("X-CSRF-Token");
      const csrfCookie = getCsrfToken(req);
      if (!csrfHeader || !csrfCookie || !safeEqual(csrfHeader, csrfCookie) || !(await serverDB.verifyCsrfToken(token, csrfHeader))) {
        return res.status(403).json({ success: false, error: "Invalid CSRF token." });
      }
    }
    (req as express.Request & { adminSession?: typeof session }).adminSession = session;
    next();
  } catch (error) {
    console.error("[AUTH] Authorization check failed:", error instanceof Error ? error.message : error);
    return res.status(500).json({ success: false, error: "Authentication service unavailable." });
  }
}

function requireSuperAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const session = (req as express.Request & { adminSession?: { role?: string } }).adminSession;
  if (session?.role !== "superadmin") return res.status(403).json({ success: false, error: "Super-admin privileges required." });
  next();
}

function validateText(value: unknown, field: string, max = 10000): string {
  if (typeof value !== "string") throw new Error(`${field} must be a string.`);
  const normalized = value.trim();
  if (!normalized || normalized.length > max) throw new Error(`${field} is invalid.`);
  return normalized;
}

function validateOptionalText(value: unknown, field: string, max = 10000): string {
  if (value === undefined || value === null) return "";
  if (typeof value !== "string") throw new Error(`${field} must be a string.`);
  const normalized = value.trim();
  if (normalized.length > max) throw new Error(`${field} is invalid.`);
  return normalized;
}

function validateProjectPayload(input: unknown): Record<string, unknown> {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("Invalid project payload.");
  const body = input as Record<string, unknown>;
  const allowed = ["id", "title", "workType", "category", "link", "githubLink", "description", "longDescription", "tools", "image", "imageUrl", "thumbnail", "coverImage", "color", "media", "published", "featured", "order", "date", "videoUrl", "videoPoster"];
  const result: Record<string, unknown> = {};
  for (const key of Object.keys(body)) {
    if (!allowed.includes(key)) continue;
    result[key] = body[key];
  }
  if ("title" in result) result.title = validateText(result.title, "title", 200);
  if ("description" in result) result.description = validateOptionalText(result.description, "description", 10000);
  if ("longDescription" in result) result.longDescription = validateOptionalText(result.longDescription, "longDescription", 30000);
  for (const key of ["link", "githubLink", "image", "imageUrl", "thumbnail", "coverImage", "videoUrl", "videoPoster"]) {
    if (key in result && result[key] !== "" && typeof result[key] !== "string") throw new Error(`${key} is invalid.`);
  }
  if (typeof result.videoUrl === "string" && result.videoUrl.trim()) {
    let parsed: URL;
    try { parsed = new URL(result.videoUrl.trim()); } catch { throw new Error("videoUrl must be a valid absolute URL."); }
    if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error("videoUrl must use HTTP or HTTPS.");
    result.videoUrl = parsed.toString();
  }
  if ("order" in result && (!Number.isInteger(result.order) || Number(result.order) < 0 || Number(result.order) > 100000)) throw new Error("order is invalid.");
  for (const key of ["published", "featured"]) if (key in result && typeof result[key] !== "boolean") throw new Error(`${key} is invalid.`);
  if ("media" in result && (!Array.isArray(result.media) || result.media.length > 100)) throw new Error("media is invalid.");
  return result;
}

function validateJsonDocument(input: unknown, label: string, maxBytes = 500_000) {
  const serialized = JSON.stringify(input);
  if (!serialized || serialized.length > maxBytes) throw new Error(`${label} is too large or invalid.`);
  const walk = (value: unknown, depth = 0): void => {
    if (depth > 12) throw new Error(`${label} is too deeply nested.`);
    if (Array.isArray(value)) {
      if (value.length > 1000) throw new Error(`${label} contains too many items.`);
      value.forEach((item) => walk(item, depth + 1));
    } else if (value && typeof value === "object") {
      for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
        if (["__proto__", "prototype", "constructor"].includes(key)) throw new Error(`${label} contains an invalid property.`);
        walk(child, depth + 1);
      }
    } else if (typeof value === "string" && value.length > 30000) throw new Error(`${label} contains an oversized string.`);
  };
  walk(input);
}

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});
app.post("/api/auth/login", async (req, res) => {
  const clientIp = req.ip || req.socket.remoteAddress || "unknown";
  const { password, email } = req.body || {};
  const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
  const ipLimit = checkIpLoginRateLimit(clientIp);
  if (!ipLimit.allowed) {
    res.setHeader("Retry-After", String(ipLimit.waitSeconds));
    return res.status(429).json({ success: false, error: "Too many login attempts. Please try again later." });
  }
  const rateLimitKey = getLoginRateLimitKey(clientIp, normalizedEmail);
  const { allowed, waitSeconds } = checkLoginRateLimit(rateLimitKey);
  if (!allowed) {
    res.setHeader("Retry-After", String(waitSeconds || 600));
    return res.status(429).json({ success: false, error: "Too many failed attempts. Please try again later." });
  }
  if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail) || normalizedEmail.length > 254) {
    return res.status(400).json({ success: false, error: "Valid administrator email is required." });
  }
  if (typeof password !== "string" || password.length < 12 || password.length > 128) {
    return res.status(401).json({ success: false, error: "Invalid credentials. Please verify your password." });
  }

  try {
    const identity = await serverDB.authenticateWithFirebase(normalizedEmail, password);
    if (!identity) {
      recordLoginAttempt(rateLimitKey, false);
      return res.status(401).json({ success: false, error: "Invalid credentials. Please verify your password." });
    }
    recordLoginAttempt(rateLimitKey, true);
    const sessionToken = await serverDB.createSession(identity);
    const useSecureCookie = IS_PRODUCTION || req.secure;
    res.cookie("admin_session", sessionToken, {
      httpOnly: true,
      sameSite: "strict",
      secure: useSecureCookie,
      maxAge: 12 * 60 * 60 * 1000,
      path: "/",
    });
    const csrfToken = crypto.randomBytes(32).toString("hex");
    await serverDB.setCsrfToken(sessionToken, csrfToken);
    res.cookie("admin_csrf", csrfToken, {
      httpOnly: false,
      sameSite: "strict",
      secure: useSecureCookie,
      maxAge: 12 * 60 * 60 * 1000,
      path: "/",
    });
    return res.json({ success: true, user: await serverDB.getAdminProfile(identity.uid) });
  } catch (error) {
    console.error("[AUTH] Firebase login failed:", error instanceof Error ? error.message : error);
    return res.status(503).json({ success: false, error: "Authentication service unavailable. Check Firebase Authentication configuration." });
  }
});
app.get("/api/auth/me", async (req, res) => {
  try {
    const token = getSessionToken(req);
    if (!token || !(await serverDB.verifySession(token))) {
      // Not being logged in is an expected state for the admin login page.
      // Return a normal response so the browser does not report a noisy 401
      // every time React checks authentication on initial render.
      return res.json({ authenticated: false });
    }
    const useSecureCookie = IS_PRODUCTION || req.secure;
    if (!getCsrfToken(req)) {
      const csrfToken = crypto.randomBytes(32).toString("hex");
      await serverDB.setCsrfToken(token, csrfToken);
      res.cookie("admin_csrf", csrfToken, {
        httpOnly: false, sameSite: "strict", secure: useSecureCookie, maxAge: 12 * 60 * 60 * 1000, path: "/",
      });
    }
    const session = await serverDB.verifySession(token);
    if (!session?.firebaseUid) return res.json({ authenticated: false });
    return res.json({ authenticated: true, user: await serverDB.getAdminProfile(session.firebaseUid) });
  } catch (error) {
    console.error("[AUTH] /api/auth/me failed:", error instanceof Error ? error.stack || error.message : error);
    return res.status(503).json({ authenticated: false, error: "Authentication service temporarily unavailable." });
  }
});
app.post("/api/auth/logout", async (req, res) => {
  const token = getSessionToken(req);
  if (token) {
    await serverDB.destroySession(token);
  }
  res.clearCookie("admin_session", { path: "/" });
  res.clearCookie("admin_csrf", { path: "/" });
  res.json({ success: true });
});
app.post("/api/auth/change-password", requireAuth, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const session = (req as express.Request & { adminSession?: { firebaseUid?: string } }).adminSession;
  const result = await serverDB.changePassword(String(session?.firebaseUid || ""), currentPassword, newPassword);
  if (!result.success) {
    return res.status(400).json(result);
  }
  res.clearCookie("admin_session", { path: "/" });
  res.clearCookie("admin_csrf", { path: "/" });
  const profile = await serverDB.getAdminProfile(String(session?.firebaseUid || ""));
  const newToken = await serverDB.createSession({ uid: String(session?.firebaseUid || ""), email: profile.email, role: profile.role });
  const useSecureCookie = IS_PRODUCTION || req.secure;
  const csrfToken = crypto.randomBytes(32).toString("hex");
  await serverDB.setCsrfToken(newToken, csrfToken);
  res.cookie("admin_session", newToken, {
    httpOnly: true,
    sameSite: "strict",
    secure: useSecureCookie,
    maxAge: 12 * 60 * 60 * 1000,
    path: "/",
  });
  res.cookie("admin_csrf", csrfToken, {
    httpOnly: false, sameSite: "strict", secure: useSecureCookie, maxAge: 12 * 60 * 60 * 1000, path: "/",
  });
  return res.json({ success: true });
});
app.get("/api/settings", async (_req, res) => {
  try {
    const settings = await serverDB.getSettings();
    res.json({ success: true, settings });
  } catch (error) {
    console.error("[CMS] Failed to fetch settings:", error instanceof Error ? error.stack || error.message : error);
    res.status(503).json({ success: false, error: "Database temporarily unavailable." });
  }
});
app.put("/api/settings", requireAuth, async (req, res) => {
  try {
    validateJsonDocument(req.body, "settings");
    const updated = await serverDB.updateSettings(req.body);
    res.json({ success: true, settings: updated });
  } catch (e) {
    res
      .status(500)
      .json({
        success: false,
        error: "Failed to update settings",
      });
  }
});
app.get("/api/content", async (_req, res) => {
  try {
    const content = await serverDB.getContent();
    res.json({ success: true, content });
  } catch (error) {
    console.error("[CMS] Failed to fetch content:", error instanceof Error ? error.stack || error.message : error);
    res.status(503).json({ success: false, error: "Database temporarily unavailable." });
  }
});
app.put("/api/content", requireAuth, async (req, res) => {
  try {
    validateJsonDocument(req.body, "content");
    const updated = await serverDB.updateContent(req.body);
    res.json({ success: true, content: updated });
  } catch (e) {
    res
      .status(500)
      .json({
        success: false,
        error: "Failed to update content",
      });
  }
});
app.get("/api/projects", async (req, res) => {
  try {
    let includeDrafts = false;
    if (req.query.all === "true") {
      const token = getSessionToken(req);
      const session = token ? await serverDB.verifySession(token) : null;
      if (!session?.firebaseUid) return res.status(401).json({ success: false, error: "Unauthorized." });
      const profile = await serverDB.getAdminProfile(session.firebaseUid);
      if (!profile || !["admin", "superadmin"].includes(profile.role)) {
        return res.status(403).json({ success: false, error: "Forbidden." });
      }
      includeDrafts = true;
    }
    const projects = await serverDB.getProjects(includeDrafts);
    res.json({ success: true, projects });
  } catch {
    res.status(500).json({ success: false, error: "Failed to fetch projects" });
  }
});
app.get("/api/projects/:id", async (req, res) => {
  const project = await serverDB.getProject(req.params.id);
  if (!project) {
    return res.status(404).json({ success: false, error: "Project not found" });
  }

  // Draft projects must never be exposed through a public detail endpoint.
  if (project.published === false) {
    const token = getSessionToken(req);
    const session = token ? await serverDB.verifySession(token) : null;
    if (!session?.firebaseUid) return res.status(404).json({ success: false, error: "Project not found" });
    const profile = await serverDB.getAdminProfile(session.firebaseUid);
    if (!profile || !["admin", "superadmin"].includes(profile.role)) {
      return res.status(404).json({ success: false, error: "Project not found" });
    }
  }

  return res.json({ success: true, project });
});
app.post("/api/projects", requireAuth, async (req, res) => {
  try {
    const project = validateProjectPayload(req.body);
    if (!project.title) return res.status(400).json({ success: false, error: "Project title is required." });
    const created = await serverDB.createProject(project);
    return res.status(201).json({ success: true, project: created });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to create project";
    const status = /invalid|required|must be|too (large|deeply)|unsupported/i.test(message) ? 400 : 500;
    return res.status(status).json({ success: false, error: status === 400 ? message : "Failed to create project. Please try again." });
  }
});
app.put("/api/projects/reorder", requireAuth, async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length > 1000 || ids.some((id: unknown) => typeof id !== "string" || !/^[A-Za-z0-9_-]{1,128}$/.test(id))) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid IDs array" });
    }
    const reordered = await serverDB.reorderProjects(ids);
    return res.json({ success: true, projects: reordered });
  } catch (e) {
    return res
      .status(500)
      .json({
        success: false,
        error: e instanceof Error ? e.message : "Failed to reorder projects",
      });
  }
});
app.put("/api/projects/:id", requireAuth, async (req, res) => {
  try {
    const updates = validateProjectPayload(req.body);
    const updated = await serverDB.updateProject(req.params.id, updates);
    if (!updated) {
      return res
        .status(404)
        .json({ success: false, error: "Project not found" });
    }
    return res.json({ success: true, project: updated });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to update project";
    const status = /invalid|required|must be|too (large|deeply)|unsupported/i.test(message) ? 400 : 500;
    return res.status(status).json({ success: false, error: status === 400 ? message : "Failed to update project. Please try again." });
  }
});
app.delete("/api/projects/:id", requireAuth, async (req, res) => {
  const success = await serverDB.deleteProject(req.params.id);
  if (!success) {
    return res.status(404).json({ success: false, error: "Project not found" });
  }
  return res.json({ success: true });
});
app.post("/api/projects/:id/duplicate", requireAuth, async (req, res) => {
  const duplicated = await serverDB.duplicateProject(req.params.id);
  if (!duplicated) {
    return res
      .status(404)
      .json({ success: false, error: "Original project not found" });
  }
  return res.json({ success: true, project: duplicated });
});
app.get("/api/media", requireAuth, async (_req, res) => {
  try {
    const media = await serverDB.getMedia();
    const projects = await serverDB.getProjects(true);
    const withUsage = media.map((item) => {
      const referencedIn = projects
        .filter((p) => {
          const inMedia = p.media?.some((m) => m.url === item.url);
          const inLegacy =
            p.image === item.url ||
            p.imageUrl === item.url ||
            p.thumbnail === item.url ||
            p.coverImage === item.url;
          return inMedia || inLegacy;
        })
        .map((p) => p.title);
      return {
        ...item,
        usageCount: referencedIn.length,
        referencedBy: referencedIn,
      };
    });
    res.json({ success: true, media: withUsage });
  } catch {
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch media library" });
  }
});
app.get("/api/media/upload-auth", requireAuth, (req, res) => {
  if (!IMAGEKIT_PRIVATE_KEY || !IMAGEKIT_PUBLIC_KEY || !IMAGEKIT_URL_ENDPOINT) {
    return res.status(503).json({ success: false, error: "ImageKit upload is not configured." });
  }
  const token = crypto.randomUUID();
  const expire = Math.floor(Date.now() / 1000) + 30 * 60;
  const signature = crypto.createHmac("sha1", IMAGEKIT_PRIVATE_KEY).update(token + expire).digest("hex");
  res.setHeader("Cache-Control", "no-store");
  return res.json({ success: true, token, expire, signature, publicKey: IMAGEKIT_PUBLIC_KEY, urlEndpoint: IMAGEKIT_URL_ENDPOINT });
});

app.post("/api/media/register", requireAuth, async (req, res) => {
  try {
    const body = req.body && typeof req.body === "object" ? req.body as Record<string, unknown> : {};
    const url = typeof body.url === "string" ? body.url.trim() : "";
    const fileId = typeof body.fileId === "string" ? body.fileId.trim() : "";
    const filePath = typeof body.filePath === "string" ? body.filePath.trim() : "";
    const thumbnailUrl = typeof body.thumbnailUrl === "string" ? body.thumbnailUrl.trim() : "";
    const name = typeof body.name === "string" ? body.name.trim().slice(0, 255) : "";
    const mimeType = typeof body.mimeType === "string" ? body.mimeType.trim().toLowerCase() : "";
    const size = Number(body.size);
    const title = typeof body.title === "string" ? body.title.trim().slice(0, 200) : name.slice(0, 200);
    if (!url || !fileId || !name || !mimeType || !Number.isFinite(size) || size < 1 || size > 500 * 1024 * 1024) {
      return res.status(400).json({ success: false, error: "Invalid uploaded media metadata." });
    }
    const parsed = new URL(url);
    const endpoint = new URL(IMAGEKIT_URL_ENDPOINT);
    if (parsed.protocol !== "https:" || parsed.origin !== endpoint.origin) {
      return res.status(400).json({ success: false, error: "Uploaded media URL is not from the configured ImageKit endpoint." });
    }
    const isVideo = mimeType.startsWith("video/");
    if (isVideo && !["video/mp4", "video/webm"].includes(mimeType)) {
      return res.status(400).json({ success: false, error: "Only MP4 and WebM videos are supported." });
    }
    if (!isVideo && !["image/jpeg", "image/png", "image/webp", "image/gif"].includes(mimeType)) {
      return res.status(400).json({ success: false, error: "Unsupported image format." });
    }
    const mediaItem = await serverDB.addMedia({
      filename: name,
      url: isVideo ? getImageKitVideoPlaybackUrl(url) : url,
      mediaType: isVideo ? "video" : "image",
      mimeType,
      size,
      title: title || name.slice(0, 200),
      fileId,
      filePath: filePath || undefined,
      thumbnailUrl: thumbnailUrl || undefined,
    });
    return res.status(201).json({ success: true, media: mediaItem, url: mediaItem.url, poster: isVideo ? thumbnailUrl || undefined : undefined });
  } catch (error) {
    console.error("[IMAGEKIT] Media registration failed:", error instanceof Error ? error.message : error);
    return res.status(400).json({ success: false, error: "Unable to register the uploaded media." });
  }
});

app.delete("/api/media/:id", requireAuth, async (req, res) => {
  const result = await serverDB.deleteMedia(req.params.id);
  if (!result.success) {
    return res.status(400).json(result);
  }
  return res.json({ success: true });
});
app.post("/api/contact", async (req, res) => {
  const clientIp = req.ip || req.socket.remoteAddress || "unknown";
  const { allowed, retryAfterSeconds } = checkContactRateLimit(clientIp);
  if (!allowed) {
    return res
      .status(429)
      .json({
        success: false,
        error: `Too many submissions. Please wait ${retryAfterSeconds} seconds before sending another message.`,
      });
  }
  const name =
    typeof req.body.name === "string" ? req.body.name.trim().slice(0, 100) : "";
  const email =
    typeof req.body.email === "string"
      ? req.body.email.trim().slice(0, 120)
      : "";
  const message =
    typeof req.body.message === "string"
      ? req.body.message.trim().slice(0, 5000)
      : "";
  if (!name || !email || !message || /[\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(message)) {
    return res
      .status(400)
      .json({ success: false, error: "All fields are required." });
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res
      .status(400)
      .json({ success: false, error: "Invalid email address format." });
  }
  if (/javascript:/i.test(message) || /data:/i.test(message)) {
    return res
      .status(400)
      .json({
        success: false,
        error: "Invalid character sequence in message.",
      });
  }
  const submission = await serverDB.addMessage({ name, email, message });
  return res
    .status(201)
    .json({
      success: true,
      message: "Thank you! Your message has been received.",
      submission,
    });
});
app.get("/api/contact", requireAuth, async (_req, res) => {
  res.json({ success: true, messages: await serverDB.getMessages() });
});
app.delete("/api/contact/read/all", requireAuth, async (_req, res) => {
  const result = await serverDB.deleteReadMessages();
  return res.json({ success: true, count: result.count });
});
app.patch("/api/contact/:id/read", requireAuth, async (req, res) => {
  const messageId = String(req.params.id || "").trim();
  const { read } = req.body;
  const updated = await serverDB.toggleMessageRead(
    messageId,
    typeof read === "boolean" ? read : undefined,
  );
  if (!updated) {
    return res
      .status(404)
      .json({ success: false, error: "Message not found." });
  }
  return res.json({ success: true });
});
app.delete("/api/contact/:id", requireAuth, async (req, res) => {
  const messageId = String(req.params.id || "").trim();
  if (!messageId) {
    return res
      .status(400)
      .json({ success: false, error: "Missing message ID" });
  }
  const deleted = await serverDB.deleteMessage(messageId);
  if (!deleted) {
    return res
      .status(404)
      .json({
        success: false,
        error: `Message with ID "${messageId}" was not found or has already been deleted.`,
      });
  }
  return res.json({ success: true, id: messageId });
});
app.get("/api/audit-logs", requireAuth, async (_req, res) => {
  res.json({ success: true, logs: await serverDB.getAuditLogs() });
});
app.get("/api/backup/export", requireAuth, requireSuperAdmin, async (_req, res) => {
  const backup = await serverDB.exportBackup();
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="portfolio_cms_backup_${Date.now()}.json"`,
  );
  res.setHeader("Content-Type", "application/json");
  res.send(JSON.stringify(backup, null, 2));
});
app.post("/api/backup/import", requireAuth, requireSuperAdmin, async (req, res) => {
  try {
    validateJsonDocument(req.body, "backup", 5_000_000);
    const result = await serverDB.importBackup(req.body);
    if (!result.success) return res.status(400).json(result);
    return res.json({ success: true, message: "Backup successfully restored." });
  } catch (error) {
    console.error("[BACKUP] Import rejected:", error instanceof Error ? error.message : error);
    return res.status(400).json({ success: false, error: "Invalid backup data." });
  }
});
app.post("/api/backup/reset", requireAuth, requireSuperAdmin, async (_req, res) => {
  await serverDB.resetToDefaults();
  return res.json({
    success: true,
    message: "Website CMS reset to default state.",
  });
});
async function startServer() {
  // Start the HTTP server immediately. Firestore initialization runs in the background;
  // ImageKit is used only when an administrator explicitly uploads media.
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use("/uploads", express.static(path.join(process.cwd(), "public", "uploads"), {
      fallthrough: false,
      index: false,
      dotfiles: "deny",
      maxAge: "7d",
    }));
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(
      `[SERVER] Portfolio CMS Server running at http://0.0.0.0:${PORT}`,
    );
    void ensureDatabaseReady().catch((error) => {
      console.error("[FIREBASE] Database initialization failed; API requests will return database error until connectivity is restored:", error);
    });
  });
}
export { app };
export default app;

if (!IS_VERCEL) {
  void startServer();
}
