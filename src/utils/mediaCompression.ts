/**
 * Media compression and auto-adjustment utilities
 * Automatically downsizes and compresses large images in the browser
 * before uploading, and formats sizes for video processing.
 */

export interface CompressionResult {
  file: File;
  compressed: boolean;
  originalSize: number;
  newSize: number;
}

/**
 * Format bytes to human readable string
 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Automatically adjusts dimensions and compresses an image file if it exceeds standard limits
 * Scales down high-resolution images (> 2560px) and compresses files > 1.5MB to WebP/JPEG
 */
export async function compressImageIfNeeded(
  file: File,
  maxDimension = 2560,
  quality = 0.85
): Promise<File> {
  // If not an image or is SVG/GIF (animated), leave as-is
  if (
    !file.type.startsWith("image/") ||
    file.type === "image/svg+xml" ||
    file.type === "image/gif"
  ) {
    return file;
  }

  // If already under 1.5MB and not huge, skip
  if (file.size <= 1.5 * 1024 * 1024) {
    return file;
  }

  return new Promise<File>((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        try {
          let { width, height } = img;

          // If image is larger than 5MB, cap dimension to 1920 for maximum optimization
          const effectiveMaxDim = file.size > 5 * 1024 * 1024 ? Math.min(maxDimension, 1920) : maxDimension;

          if (width > effectiveMaxDim || height > effectiveMaxDim) {
            if (width > height) {
              height = Math.round((height * effectiveMaxDim) / width);
              width = effectiveMaxDim;
            } else {
              width = Math.round((width * effectiveMaxDim) / height);
              height = effectiveMaxDim;
            }
          }

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");

          if (!ctx) {
            resolve(file);
            return;
          }

          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";
          ctx.drawImage(img, 0, 0, width, height);

          // Choose optimal format: WebP if supported, otherwise JPEG
          const outputType = file.type === "image/png" ? "image/webp" : "image/jpeg";

          canvas.toBlob(
            (blob) => {
              if (blob && blob.size < file.size) {
                const newFileName = file.name.replace(/\.[^/.]+$/, outputType === "image/webp" ? ".webp" : ".jpg");
                const compressedFile = new File([blob], newFileName, {
                  type: outputType,
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              } else {
                // If compression didn't reduce size, keep original
                resolve(file);
              }
            },
            outputType,
            quality
          );
        } catch (err) {
          console.warn("Canvas compression failed, using original file:", err);
          resolve(file);
        }
      };

      img.onerror = () => resolve(file);
      img.src = e.target?.result as string;
    };

    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}
