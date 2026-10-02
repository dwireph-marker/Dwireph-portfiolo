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

export const mediaStorage = {
  async uploadMedia(
    file: File,
    onStatusUpdate?: (status: string) => void
  ): Promise<UploadResult> {
    let processedFile = file;

    const isVideo =
      file.type.startsWith("video/") ||
      /\.(mp4|webm)$/i.test(file.name);
    const mediaType: MediaType = isVideo ? "video" : "image";

    // Auto-adjust and compress large images before upload
    if (!isVideo && file.size > 1.5 * 1024 * 1024) {
      onStatusUpdate?.(`Optimizing image (${formatBytes(file.size)})...`);
      try {
        processedFile = await compressImageIfNeeded(file);
      } catch (err) {
        console.warn("Image auto-compression fallback:", err);
      }
    } else if (isVideo && file.size > 25 * 1024 * 1024) {
      onStatusUpdate?.(`Uploading video to ImageKit (${formatBytes(file.size)})...`);
    }

    // Safety ceiling of 500MB (no artificial 50MB restriction)
    const absoluteMax = 500 * 1024 * 1024;
    if (processedFile.size > absoluteMax) {
      throw new Error(
        `File size (${formatBytes(processedFile.size)}) exceeds the maximum 500MB limit. Please upload a file under 500MB.`
      );
    }

    // Server-side upload; videos and images are stored in ImageKit
    const res = await cmsApi.uploadMedia(processedFile, mediaType);
    if (res.success && res.url) {
      return {
        success: true,
        url: res.url,
        fileId: res.media?.id || `file_${Date.now()}`,
        mediaType,
        poster: res.poster || res.media?.poster,
      };
    }
    throw new Error(
      res.error ||
        "Server upload failed. Please verify your connection and admin session."
    );
  },
};

