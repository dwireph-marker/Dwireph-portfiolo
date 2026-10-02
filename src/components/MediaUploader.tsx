import React, { useState, useRef } from "react";
import { Upload, X, Film, Image as ImageIcon, AlertCircle, Loader2 } from "lucide-react";
import { ProjectMedia, MediaType } from "../types/project";
import { mediaStorage } from "../services/mediaStorage";
import { isVideoMedia } from "../utils/media";

interface MediaUploaderProps {
  mediaList: ProjectMedia[];
  onChange: (mediaList: ProjectMedia[]) => void;
}

export default function MediaUploader({ mediaList, onChange }: MediaUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | File[]) => {
    setError(null);
    setIsUploading(true);
    setUploadStatus(null);

    try {
      const newMediaItems: ProjectMedia[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Validation
        const isVideo = file.type.startsWith("video/") || /\.(mp4|webm|mov|m4v)$/i.test(file.name);
        const isImage = file.type.startsWith("image/") || /\.(png|jpg|jpeg|webp|gif|svg)$/i.test(file.name);

        if (!isVideo && !isImage) {
          setError(`File "${file.name}" is not a supported image or video format.`);
          continue;
        }

        const result = await mediaStorage.uploadMedia(file, (status) => setUploadStatus(status));
        newMediaItems.push({
          id: result.fileId || `media_${Date.now()}_${i}`,
          url: result.url,
          mediaType: result.mediaType as MediaType,
          title: file.name.replace(/\.[^/.]+$/, "")
        });
      }

      if (newMediaItems.length > 0) {
        onChange([...mediaList, ...newMediaItems]);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to upload file(s). Please try again.";
      setError(message);
    } finally {
      setIsUploading(false);
      setUploadStatus(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleRemove = (id: string) => {
    onChange(mediaList.filter((m) => m.id !== id));
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-[#c2a4ff]">
        Project Media (Images & Videos)
      </label>

      {/* Dropzone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-[#2a1b4e] hover:border-[#a855f7] bg-[#0c0814]/60 hover:bg-[#150f24] rounded-xl p-6 text-center cursor-pointer transition duration-300 flex flex-col items-center justify-center gap-3"
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
          multiple
          accept="image/*,video/mp4,video/webm,video/quicktime,video/m4v"
          className="hidden"
        />

        {isUploading ? (
          <div className="flex flex-col items-center gap-2 text-[#a855f7]">
            <Loader2 className="animate-spin" size={32} />
            <p className="text-sm font-medium">{uploadStatus || "Uploading and processing media..."}</p>
            <p className="text-xs text-[#8a81a3]">Automatically adjusting size and optimizing for web...</p>
          </div>
        ) : (
          <>
            <div className="w-12 h-12 rounded-full bg-[#1e1438] flex items-center justify-center text-[#a855f7]">
              <Upload size={22} />
            </div>
            <div>
              <p className="text-sm font-medium text-[#eae5ec]">
                Drag & drop files here, or <span className="text-[#a855f7] underline">browse</span>
              </p>
              <p className="text-xs text-[#8a81a3] mt-1">
                Supports PNG, JPG, WEBP, MP4, WEBM, MOV (Auto-compressed & optimized)
              </p>
            </div>
          </>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-400 text-xs bg-red-950/30 border border-red-900/50 p-3 rounded-lg">
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Media Previews Grid */}
      {mediaList.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
          {mediaList.map((media) => {
            const isVideo = isVideoMedia(media.url, media.mediaType);
            return (
              <div
                key={media.id}
                className="relative group bg-[#120a22] border border-[#23173d] rounded-xl overflow-hidden aspect-video flex items-center justify-center"
              >
                {isVideo ? (
                  <div className="relative w-full h-full bg-black flex items-center justify-center">
                    <video
                      src={media.url}
                      className="w-full h-full object-cover"
                      muted
                      preload="metadata"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <Film className="text-[#a855f7]" size={24} />
                    </div>
                  </div>
                ) : (
                  <img
                    src={media.url}
                    alt={media.title || "Project preview"}
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = "none";
                    }}
                    className="w-full h-full object-cover"
                  />
                )}

                <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded text-[10px] uppercase font-mono text-[#eae5ec] flex items-center gap-1">
                  {isVideo ? <Film size={12} className="text-[#a855f7]" /> : <ImageIcon size={12} className="text-blue-400" />}
                  <span>{isVideo ? "Video" : "Image"}</span>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(media.id);
                  }}
                  className="absolute top-2 right-2 bg-red-600/80 hover:bg-red-600 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition duration-200"
                  title="Remove media"
                >
                  <X size={14} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
