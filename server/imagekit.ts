import { IMAGEKIT_PRIVATE_KEY, IMAGEKIT_URL_ENDPOINT } from "./env";

const IMAGEKIT_MANAGEMENT_ENDPOINT = "https://api.imagekit.io/v1/files";

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
