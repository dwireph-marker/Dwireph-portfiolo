import React, { useRef } from "react";
import { X, Film, ExternalLink } from "lucide-react";

interface VideoPreviewModalProps {
  url: string;
  title: string;
  poster?: string;
  onClose: () => void;
}

export const VideoPreviewModal: React.FC<VideoPreviewModalProps> = ({
  url,
  title,
  poster,
  onClose,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#140f25] border border-[#342450] rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl relative">
        <div className="flex items-center justify-between p-4 border-b border-[#261d3d]">
          <div className="flex items-center gap-2">
            <Film size={16} className="text-pink-400" />
            <h3 className="text-sm font-bold text-white truncate max-w-md">{title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg bg-[#201838] text-[#9d8ab8] hover:text-white cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <div className="aspect-video bg-black flex items-center justify-center">
          <video
            ref={videoRef}
            src={url}
            poster={poster}
            controls
            autoPlay
            playsInline
            className="w-full h-full object-contain"
          />
        </div>

        <div className="p-3 bg-[#0d0919] flex items-center justify-between text-xs text-[#9d8bb8]">
          <span className="font-mono text-[11px] truncate max-w-xs">{url}</span>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-pink-400 hover:text-pink-300 font-medium"
          >
            <span>Open Original</span>
            <ExternalLink size={12} />
          </a>
        </div>
      </div>
    </div>
  );
};
