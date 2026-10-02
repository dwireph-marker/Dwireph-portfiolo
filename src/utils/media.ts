import { MediaType } from "../types/project";

export const isSocialVideoUrl = (url?: string): boolean => {
  if (!url) return false;
  const lower = url.toLowerCase();
  return (
    lower.includes("instagram.com") ||
    lower.includes("youtube.com") ||
    lower.includes("youtu.be") ||
    lower.includes("tiktok.com") ||
    lower.includes("vimeo.com")
  );
};

export const isInstagramUrl = (url?: string): boolean => {
  if (!url) return false;
  return url.toLowerCase().includes("instagram.com");
};

export const isYouTubeUrl = (url?: string): boolean => {
  if (!url) return false;
  const lower = url.toLowerCase();
  return lower.includes("youtube.com") || lower.includes("youtu.be");
};

export const getYouTubeEmbedUrl = (url: string): string | null => {
  try {
    if (url.includes("youtu.be/")) {
      const id = url.split("youtu.be/")[1]?.split(/[?#]/)[0];
      return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
    }
    if (url.includes("watch?v=")) {
      const id = new URL(url).searchParams.get("v");
      return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
    }
    if (url.includes("/shorts/")) {
      const id = url.split("/shorts/")[1]?.split(/[?#]/)[0];
      return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
    }
    return null;
  } catch {
    return null;
  }
};

export const isDirectPlayableVideo = (url?: string): boolean => {
  if (!url || typeof url !== "string") return false;
  const value = url.trim();
  if (!value) return false;
  if (isSocialVideoUrl(value)) return false;
  if (value.startsWith("data:video/") || value.startsWith("blob:")) return true;

  try {
    const parsed = new URL(value, typeof window !== "undefined" ? window.location.origin : "http://localhost");
    const pathname = parsed.pathname.toLowerCase();
    const host = parsed.hostname.toLowerCase();
    const isImageKit = host === "imagekit.io" || host.endsWith(".imagekit.io");
    const hasVideoExtension = /\.(mp4|webm|m4v|mov)$/i.test(pathname);
    const isLocalUpload = pathname.includes("/uploads/");
    return isImageKit || hasVideoExtension || isLocalUpload;
  } catch {
    const lower = value.toLowerCase();
    return /\.(mp4|webm|m4v|mov)(?:[?#].*)?$/.test(lower) || lower.includes("/uploads/");
  }
};

export const isVideoMedia = (
  url?: string,
  mediaType?: MediaType
): boolean => {
  if (mediaType === "image") return false;
  if (url && isDirectPlayableVideo(url)) return true;
  if (mediaType === "video" && url && !isSocialVideoUrl(url)) return true;
  return false;
};
