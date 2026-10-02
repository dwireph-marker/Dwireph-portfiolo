/**
 * Returns a browser-friendly ImageKit playback URL.
 * ImageKit can transcode video on delivery; forcing MP4/H.264/AAC gives
 * Chromium/Firefox/Safari a broadly supported playback representation.
 */
export function getVideoPlaybackUrl(url?: string): string {
  if (!url || typeof url !== "string") return "";
  const value = url.trim();
  if (!value) return "";

  try {
    const parsed = new URL(value, typeof window !== "undefined" ? window.location.origin : "http://localhost");
    const host = parsed.hostname.toLowerCase();
    const isImageKit = host === "imagekit.io" || host.endsWith(".imagekit.io");
    if (!isImageKit) return value;

    // Avoid stacking the transformation if a URL has already been optimized.
    const current = parsed.searchParams.get("tr") || "";
    if (current.includes("f-mp4") && current.includes("vc-h264") && current.includes("ac-aac")) {
      return parsed.toString();
    }

    const transform = "f-mp4,vc-h264,ac-aac";
    parsed.searchParams.set("tr", current ? `${current},${transform}` : transform);
    return parsed.toString();
  } catch {
    return value;
  }
}
