import { MediaType } from "../types/project";
import { cmsApi } from "./cmsApi";
import { compressImageIfNeeded, formatBytes } from "../utils/mediaCompression";

export interface UploadResult {
  success: boolean;
  url: string;
  fileId: string;
  mediaType: MediaType;
  poster?: string;
  error?: string;
}

interface ImageKitAuth {
  token: string;
  expire: number;
  signature: string;
  publicKey: string;
  urlEndpoint: string;
}

const MAX_UPLOAD_BYTES = 500 * 1024 * 1024;

function safeFileName(name: string) {
  const ext = name.includes(".") ? name.slice(name.lastIndexOf(".")).toLowerCase() : "";
  const base = name.slice(0, name.length - ext.length).replace(/[^a-zA-Z0-9_-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 100) || "portfolio-media";
  return `${base}-${Date.now()}${ext}`;
}

async function getImageKitAuth(): Promise<ImageKitAuth> {
  const res = await fetch("/api/media/upload-auth", { credentials: "include", cache: "no-store" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.success) throw new Error(data.error || "Unable to authorize ImageKit upload.");
  return data as ImageKitAuth;
}

export const mediaStorage = {
  async uploadMedia(file: File, onStatusUpdate?: (status: string) => void, title?: string): Promise<UploadResult> {
    let processedFile = file;
    const isVideo = file.type.startsWith("video/") || /\.(mp4|webm)$/i.test(file.name);
    const mediaType: MediaType = isVideo ? "video" : "image";

    if (!isVideo && file.size > 1.5 * 1024 * 1024) {
      onStatusUpdate?.(`Optimizing image (${formatBytes(file.size)})...`);
      try { processedFile = await compressImageIfNeeded(file); } catch (err) { console.warn("Image auto-compression fallback:", err); }
    }
    if (processedFile.size > MAX_UPLOAD_BYTES) throw new Error(`File size (${formatBytes(processedFile.size)}) exceeds the maximum 500MB limit.`);
    if (isVideo && !["video/mp4", "video/webm"].includes(processedFile.type)) throw new Error("For reliable browser playback, upload an MP4 or WebM video.");
    if (!isVideo && !["image/jpeg", "image/png", "image/webp", "image/gif"].includes(processedFile.type)) throw new Error("Unsupported image format.");

    onStatusUpdate?.(isVideo ? `Authorizing ImageKit upload (${formatBytes(processedFile.size)})...` : "Authorizing ImageKit upload...");
    const auth = await getImageKitAuth();
    const form = new FormData();
    form.append("file", processedFile);
    form.append("fileName", safeFileName(processedFile.name));
    form.append("publicKey", auth.publicKey);
    form.append("signature", auth.signature);
    form.append("expire", String(auth.expire));
    form.append("token", auth.token);
    form.append("folder", isVideo ? "/portfolio/videos" : "/portfolio/images");
    form.append("useUniqueFileName", "true");
    form.append("overwriteFile", "false");
    form.append("responseFields", "fileId,url,filePath,thumbnailUrl,name");
    if (isVideo) form.append("transformation", JSON.stringify({ post: [{ type: "transformation", value: "f-mp4,vc-h264,ac-aac" }] }));

    onStatusUpdate?.(isVideo ? "Uploading video directly to ImageKit..." : "Uploading media directly to ImageKit...");
    const response = await fetch("https://upload.imagekit.io/api/v1/files/upload", { method: "POST", body: form });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || typeof data.url !== "string" || typeof data.fileId !== "string") {
      throw new Error(typeof data.message === "string" ? data.message : `ImageKit upload failed (${response.status}).`);
    }

    onStatusUpdate?.("Saving media metadata...");
    const registered = await cmsApi.registerMedia({
      url: data.url,
      fileId: data.fileId,
      filePath: data.filePath,
      thumbnailUrl: data.thumbnailUrl,
      name: data.name || processedFile.name,
      mimeType: processedFile.type,
      size: processedFile.size,
      title: title || processedFile.name,
    });
    if (!registered.success || !registered.media) throw new Error(registered.error || "ImageKit upload succeeded but metadata could not be saved.");

    return { success: true, url: registered.url || data.url, fileId: data.fileId, mediaType, poster: registered.poster || data.thumbnailUrl };
  },
};
