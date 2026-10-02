import crypto from "node:crypto";
import { IMAGEKIT_PRIVATE_KEY, IMAGEKIT_URL_ENDPOINT } from "./env";

const IMAGEKIT_UPLOAD_ENDPOINT = "https://upload.imagekit.io/api/v1/files/upload";
const IMAGEKIT_MANAGEMENT_ENDPOINT = "https://api.imagekit.io/v1/files";
const DEFAULT_TIMEOUT_MS = 10 * 60 * 1000;

export interface ImageKitUploadResult {
  fileId: string;
  url: string;
  filePath?: string;
  thumbnailUrl?: string;
  name?: string;
}

function requireConfig() {
  if (!IMAGEKIT_PRIVATE_KEY) {
    throw new Error("ImageKit is not configured: IMAGEKIT_PRIVATE_KEY is missing.");
  }
  if (!IMAGEKIT_URL_ENDPOINT) {
    throw new Error("ImageKit is not configured: IMAGEKIT_URL_ENDPOINT is missing.");
  }
}

function authHeader() {
  return `Basic ${Buffer.from(`${IMAGEKIT_PRIVATE_KEY}:`, "utf8").toString("base64")}`;
}

function safeFileName(name: string) {
  const ext = name.includes(".") ? name.slice(name.lastIndexOf(".")) : "";
  const base = name
    .slice(0, name.length - ext.length)
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100) || "portfolio-video";
  return `${base}-${Date.now()}-${crypto.randomBytes(6).toString("hex")}${ext.toLowerCase()}`;
}

export async function uploadToImageKit(params: {
  buffer: Buffer;
  originalName: string;
  mimeType: string;
  folder: string;
}): Promise<ImageKitUploadResult> {
  requireConfig();

  const body = new FormData();
  body.append("file", new Blob([new Uint8Array(params.buffer)], { type: params.mimeType }), params.originalName);
  body.append("fileName", safeFileName(params.originalName));
  body.append("folder", params.folder);
  body.append("useUniqueFileName", "true");
  body.append("overwriteFile", "false");
  body.append("responseFields", "fileId,url,filePath,thumbnailUrl,name");
  // Ask ImageKit to eagerly prepare a broadly browser-compatible video representation.
  if (params.mimeType.startsWith("video/")) {
    body.append("transformation", JSON.stringify({
      post: [{ type: "transformation", value: "f-mp4,vc-h264,ac-aac" }],
    }));
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    const response = await fetch(IMAGEKIT_UPLOAD_ENDPOINT, {
      method: "POST",
      headers: { Authorization: authHeader() },
      body,
      signal: controller.signal,
    });

    const raw = await response.text();
    let data: Record<string, unknown> = {};
    try {
      data = JSON.parse(raw) as Record<string, unknown>;
    } catch {
      // ImageKit should return JSON; retain a safe generic error below.
    }

    if (!response.ok || typeof data.url !== "string" || typeof data.fileId !== "string") {
      const message = typeof data.message === "string" ? data.message : `ImageKit upload failed (${response.status}).`;
      throw new Error(message);
    }

    return {
      fileId: data.fileId,
      url: data.url,
      filePath: typeof data.filePath === "string" ? data.filePath : undefined,
      thumbnailUrl: typeof data.thumbnailUrl === "string" ? data.thumbnailUrl : undefined,
      name: typeof data.name === "string" ? data.name : undefined,
    };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("ImageKit upload timed out after 10 minutes. Check the video size and server connection.");
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

export function getImageKitVideoPlaybackUrl(url: string): string {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    if (!(host === "imagekit.io" || host.endsWith(".imagekit.io"))) return url;
    const current = parsed.searchParams.get("tr") || "";
    const transform = "f-mp4,vc-h264,ac-aac";
    if (!current.includes("f-mp4") || !current.includes("vc-h264") || !current.includes("ac-aac")) {
      parsed.searchParams.set("tr", current ? `${current},${transform}` : transform);
    }
    return parsed.toString();
  } catch {
    return url;
  }
}

export async function deleteFromImageKit(fileId: string): Promise<void> {
  requireConfig();
  if (!fileId || !/^[A-Za-z0-9_-]{4,256}$/.test(fileId)) return;

  const response = await fetch(`${IMAGEKIT_MANAGEMENT_ENDPOINT}/${encodeURIComponent(fileId)}`, {
    method: "DELETE",
    headers: { Authorization: authHeader() },
  });

  if (!response.ok && response.status !== 404) {
    const text = await response.text().catch(() => "");
    throw new Error(`ImageKit asset deletion failed (${response.status})${text ? `: ${text.slice(0, 200)}` : ""}`);
  }
}
