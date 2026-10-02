import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  X,
  Play,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  ChevronLeft,
  ChevronRight,
  Film,
  Image as ImageIcon,
} from "lucide-react";
import { isVideoMedia } from "../utils/media";
import { videoPlaybackManager } from "../utils/videoManager";

type MediaItem = {
  id: string | number;
  url: string;
  title?: string;
  poster?: string;
  mediaType?: Parameters<typeof isVideoMedia>[1];
};

type MediaLightboxProps = {
  mediaList: MediaItem[];
  initialIndex?: number;
  projectTitle: string;
  isEditedVideo?: boolean;
  initialDimensions?: { width: number; height: number } | null;
  initialFullscreen?: boolean;
  onClose: () => void;
  onIndexChange?: (index: number) => void;
};

interface VideoDimensions {
  width: number;
  height: number;
  aspectRatio: number;
}

function calculateDimensions(width: number, height: number): VideoDimensions {
  const ratio = width / height;
  return { width, height, aspectRatio: ratio };
}

export default function MediaLightbox({
  mediaList,
  initialIndex = 0,
  projectTitle,
  isEditedVideo,
  initialDimensions,
  initialFullscreen = false,
  onClose,
  onIndexChange,
}: MediaLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(initialFullscreen);
  const isFullscreenRef = useRef(isFullscreen);

  useEffect(() => {
    isFullscreenRef.current = isFullscreen;
  }, [isFullscreen]);

  // Pre-seed dimensions if passed from the video card to avoid any layout flash
  const [videoDimensions, setVideoDimensions] = useState<VideoDimensions | null>(() => {
    if (initialDimensions?.width && initialDimensions?.height) {
      return calculateDimensions(initialDimensions.width, initialDimensions.height);
    }
    return null;
  });

  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  const currentMedia = mediaList[currentIndex] || mediaList[0];
  const isVideo =
    (isEditedVideo ?? true) && isVideoMedia(currentMedia?.url, currentMedia?.mediaType);

  // Notify parent of index changes
  useEffect(() => {
    if (onIndexChange) {
      onIndexChange(currentIndex);
    }
  }, [currentIndex, onIndexChange]);

  // Sync mute state with video
  const isMutedRef = useRef(isMuted);
  useEffect(() => {
    isMutedRef.current = isMuted;
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  // Video registration & playback
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isVideo) return;

    videoPlaybackManager.register(video);
    videoPlaybackManager.pauseAll(video);
    video.muted = isMutedRef.current;

    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
        })
        .catch(() => {
          // If unmuted autoplay blocked by browser policy, fallback to muted
          if (!video.muted) {
            video.muted = true;
            setIsMuted(true);
            video.play().catch(() => {});
          }
        });
    }

    return () => {
      videoPlaybackManager.unregister(video);
      try {
        if (!video.paused) {
          video.pause();
        }
      } catch (err) {
        void err;
      }
    };
  }, [currentIndex, isVideo]);

  // Read and update dimensions from video metadata
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isVideo) return;

    const updateDims = () => {
      if (video.videoWidth && video.videoHeight) {
        setVideoDimensions(calculateDimensions(video.videoWidth, video.videoHeight));
      }
    };

    if (video.readyState >= 1) {
      updateDims();
    }
    video.addEventListener("loadedmetadata", updateDims);
    return () => {
      video.removeEventListener("loadedmetadata", updateDims);
    };
  }, [currentIndex, isVideo]);

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;
    const dur = video.duration || 1;
    setProgress((video.currentTime / dur) * 100);
  };

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (!video.paused) {
      video.pause();
    } else {
      video.play().catch(() => {});
    }
  }, []);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    const nextMuted = !video.muted;
    video.muted = nextMuted;
    setIsMuted(nextMuted);
  }, []);

  // Fullscreen controller triggered by direct user gesture
  const toggleFullscreen = useCallback(() => {
    const nextFullscreen = !isFullscreenRef.current;
    setIsFullscreen(nextFullscreen);

    const doc = document as Document & {
      webkitFullscreenElement?: Element;
      mozFullScreenElement?: Element;
      msFullscreenElement?: Element;
      webkitExitFullscreen?: () => Promise<void>;
      mozCancelFullScreen?: () => Promise<void>;
      msExitFullscreen?: () => Promise<void>;
    };

    const isNativeFs = !!(
      doc.fullscreenElement ||
      doc.webkitFullscreenElement ||
      doc.mozFullScreenElement ||
      doc.msFullscreenElement
    );

    try {
      if (nextFullscreen && !isNativeFs) {
        const el = (containerRef.current || videoRef.current) as HTMLElement & {
          webkitRequestFullscreen?: () => Promise<void>;
          mozRequestFullScreen?: () => Promise<void>;
          msRequestFullscreen?: () => Promise<void>;
        };
        if (el?.requestFullscreen) {
          el.requestFullscreen().catch(() => {});
        } else if (el?.webkitRequestFullscreen) {
          el.webkitRequestFullscreen();
        } else if (el?.mozRequestFullScreen) {
          el.mozRequestFullScreen();
        } else if (el?.msRequestFullscreen) {
          el.msRequestFullscreen();
        }
      } else if (!nextFullscreen && isNativeFs) {
        if (doc.exitFullscreen) {
          doc.exitFullscreen().catch(() => {});
        } else if (doc.webkitExitFullscreen) {
          doc.webkitExitFullscreen();
        } else if (doc.mozCancelFullScreen) {
          doc.mozCancelFullScreen();
        } else if (doc.msExitFullscreen) {
          doc.msExitFullscreen();
        }
      }
    } catch (err) {
      console.debug("Fullscreen toggle note:", err);
    }
  }, []);

  // Listen to native fullscreen changes
  useEffect(() => {
    const handleFsChange = () => {
      const doc = document as Document & {
        webkitFullscreenElement?: Element;
        mozFullScreenElement?: Element;
        msFullscreenElement?: Element;
      };
      const isFs = !!(
        doc.fullscreenElement ||
        doc.webkitFullscreenElement ||
        doc.mozFullScreenElement ||
        doc.msFullscreenElement
      );
      if (!isFs && isFullscreenRef.current) {
        setIsFullscreen(false);
      }
    };

    document.addEventListener("fullscreenchange", handleFsChange);
    document.addEventListener("webkitfullscreenchange", handleFsChange);
    document.addEventListener("mozfullscreenchange", handleFsChange);
    document.addEventListener("MSFullscreenChange", handleFsChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFsChange);
      document.removeEventListener("webkitfullscreenchange", handleFsChange);
      document.removeEventListener("mozfullscreenchange", handleFsChange);
      document.removeEventListener("MSFullscreenChange", handleFsChange);
    };
  }, []);

  const nextMedia = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % mediaList.length);
  }, [mediaList.length]);

  const prevMedia = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + mediaList.length) % mediaList.length);
  }, [mediaList.length]);

  // Keyboard navigation & shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key === "Escape") {
        if (isFullscreen) {
          toggleFullscreen();
        } else {
          onClose();
        }
      }
      if (e.key === "ArrowRight") {
        if (mediaList.length > 1) {
          nextMedia();
        } else if (videoRef.current) {
          videoRef.current.currentTime = Math.min(
            videoRef.current.duration,
            videoRef.current.currentTime + 5,
          );
        }
      }
      if (e.key === "ArrowLeft") {
        if (mediaList.length > 1) {
          prevMedia();
        } else if (videoRef.current) {
          videoRef.current.currentTime = Math.max(
            0,
            videoRef.current.currentTime - 5,
          );
        }
      }
      if (e.key === " " || e.key === "k" || e.key === "K") {
        e.preventDefault();
        togglePlay();
      }
      if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        toggleFullscreen();
      }
      if (e.key === "m" || e.key === "M") {
        e.preventDefault();
        toggleMute();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen, mediaList.length, nextMedia, onClose, prevMedia, toggleFullscreen, toggleMute, togglePlay]);

  useEffect(() => {
    const previouslyFocused = document.activeElement;
    closeButtonRef.current?.focus();
    return () => {
      (previouslyFocused as HTMLElement | null)?.focus?.();
    };
  }, []);

  const isVertical = !!(videoDimensions && videoDimensions.aspectRatio < 0.95);

  return (
    <div
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      aria-label={`Media gallery lightbox for ${projectTitle}`}
      className={`fixed inset-0 z-50 bg-[#06040a]/96 backdrop-blur-2xl flex flex-col justify-between select-none focus:outline-none overflow-hidden transition-all duration-300 ${
        isFullscreen ? "p-1.5 sm:p-2.5 md:p-3" : "p-3 sm:p-4 md:p-6"
      }`}
      tabIndex={-1}
    >
      {/* Header bar (shrink-0 so it never collapses or causes vertical overflow) */}
      <div className="w-full max-w-7xl mx-auto flex items-center justify-between text-white z-20 gap-3 shrink-0 pb-2">
        <div className="min-w-0 flex-1 flex items-center gap-3">
          <div className="min-w-0">
            <h3 className="text-sm sm:text-base md:text-lg font-semibold tracking-wide text-[#eae5ec] truncate">
              {projectTitle}
            </h3>
            <p className="text-[11px] text-[#8a81a3] font-mono mt-0.5 truncate">
              {currentMedia.title ||
                `${isVideo ? "Edited Video" : "Image"} ${currentIndex + 1} of ${mediaList.length}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Audio Mute / Unmute button */}
          {isVideo && (
            <button
              type="button"
              onClick={toggleMute}
              aria-label={isMuted ? "Unmute audio (M)" : "Mute audio (M)"}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#1c122e] hover:bg-[#2b1c47] border border-[#3b2763] flex items-center justify-center text-white transition duration-200 cursor-pointer"
              title={isMuted ? "Unmute (M)" : "Mute (M)"}
            >
              {isMuted ? (
                <VolumeX size={16} className="text-red-400" />
              ) : (
                <Volume2 size={16} className="text-emerald-400" />
              )}
            </button>
          )}

          {/* Fullscreen toggle button */}
          <button
            type="button"
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? "Exit expanded view (F / Esc)" : "Expand to fullscreen (F)"}
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl border flex items-center justify-center transition duration-200 cursor-pointer shadow-lg ${
              isFullscreen
                ? "bg-pink-500/25 border-pink-500/50 hover:bg-pink-500/35 text-pink-300"
                : "bg-[#1c122e] hover:bg-[#2b1c47] border-[#3b2763] text-white"
            }`}
            title={isFullscreen ? "Exit expanded view (F / Esc)" : "Expand to fullscreen (F)"}
          >
            {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
          </button>

          {/* Slide counter */}
          {mediaList.length > 1 && (
            <span className="text-xs font-mono px-2.5 sm:px-3 py-1.5 rounded-xl bg-[#1c122e] border border-[#3b2763] text-[#c2a4ff]">
              {currentIndex + 1} / {mediaList.length}
            </span>
          )}

          {/* Close button */}
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close lightbox"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-pink-500/20 hover:bg-pink-500/30 border border-pink-500/40 flex items-center justify-center text-white transition duration-200 cursor-pointer"
            title="Close (Esc)"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Primary media display area (min-h-0 prevents flex children from pushing outside the viewport) */}
      <div className="relative w-full flex-1 min-h-0 flex items-center justify-center overflow-hidden my-auto py-2">
        {isVideo ? (
          /* VIDEO CONTAINER: Proportionally scaled to show comfortably smaller, never filling entire display edge-to-edge */
          <div
            className={`relative flex items-center justify-center rounded-2xl overflow-hidden bg-black shadow-2xl border border-[#2a1b4e]/80 group transition-all duration-300 ${
              isFullscreen ? "ring-2 ring-pink-500/30" : ""
            }`}
            style={{
              maxHeight: isFullscreen
                ? (isVertical ? "92vh" : "88vh")
                : (isVertical ? "66vh" : "70vh"),
              maxWidth: isFullscreen
                ? (isVertical ? "min(56vh, 95vw)" : "96vw")
                : (isVertical ? "360px" : "880px"),
              aspectRatio: videoDimensions
                ? `${videoDimensions.width} / ${videoDimensions.height}`
                : isVertical
                ? "9 / 16"
                : "16 / 9",
              width: isFullscreen
                ? (isVertical ? "auto" : "100%")
                : (isVertical ? "auto" : "100%"),
              height: isFullscreen
                ? (isVertical ? "90vh" : "auto")
                : (isVertical ? "66vh" : "auto"),
            }}
          >
            <video
              ref={videoRef}
              src={currentMedia.url}
              poster={currentMedia.poster}
              preload="metadata"
              playsInline
              className="w-full h-full object-contain cursor-pointer"
              onLoadedMetadata={(e) => {
                const v = e.currentTarget;
                if (v.videoWidth && v.videoHeight) {
                  setVideoDimensions(calculateDimensions(v.videoWidth, v.videoHeight));
                }
              }}
              onTimeUpdate={handleTimeUpdate}
              onEnded={() => setIsPlaying(false)}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onClick={togglePlay}
              onDoubleClick={toggleFullscreen}
            />

            {/* Center Play indicator when paused */}
            {!isPlaying && (
              <button
                type="button"
                onClick={togglePlay}
                aria-label="Play video"
                className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center transition duration-200 cursor-pointer group/play z-10"
              >
                <div className="w-14 h-14 rounded-full bg-pink-600/90 hover:bg-pink-500 backdrop-blur-md border border-white/25 flex items-center justify-center text-white shadow-2xl transition-transform group-hover/play:scale-110">
                  <Play size={24} className="fill-white ml-0.5" />
                </div>
              </button>
            )}

            {/* Floating corner audio mute toggle on video */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleMute();
              }}
              aria-label={isMuted ? "Unmute audio (M)" : "Mute audio (M)"}
              className="absolute top-3 right-3 p-2 rounded-full bg-black/65 hover:bg-black/85 backdrop-blur-md border border-white/20 text-white transition duration-200 z-20 cursor-pointer shadow-lg"
              title={isMuted ? "Unmute (M)" : "Mute (M)"}
            >
              {isMuted ? (
                <VolumeX size={15} className="text-red-400" />
              ) : (
                <Volume2 size={15} className="text-emerald-400" />
              )}
            </button>

            {/* Hairline progress indicator on bottom edge */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 pointer-events-none z-10">
              <div
                className="h-full bg-pink-500/85 transition-all duration-100"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : imageErrors[currentMedia.url] ? (
          /* Image error placeholder */
          <div className="max-h-[72vh] w-full max-w-lg aspect-video rounded-2xl bg-[#120a22] border border-[#2a1b4e] flex flex-col items-center justify-center p-6 text-center shadow-2xl">
            <ImageIcon size={40} className="text-[#a855f7] mb-3 opacity-60" />
            <p className="text-sm text-[#eae5ec] font-semibold">
              {currentMedia.title || projectTitle}
            </p>
            <span className="text-xs text-[#8a81a3] mt-1 font-mono">
              Image preview unavailable
            </span>
          </div>
        ) : (
          /* Standard image display */
          <img
            src={currentMedia.url}
            alt={currentMedia.title || projectTitle}
            onError={() =>
              setImageErrors((prev) => ({
                ...prev,
                [currentMedia.url]: true,
              }))
            }
            className={`${isFullscreen ? "max-h-[92vh] max-w-[96vw]" : "max-h-[70vh] max-w-full"} w-auto rounded-2xl shadow-2xl border border-[#2a1b4e] object-contain transition-all duration-300`}
          />
        )}

        {/* Previous / Next navigation buttons for multi-item galleries */}
        {mediaList.length > 1 && (
          <>
            <button
              type="button"
              onClick={prevMedia}
              aria-label="Previous media"
              className="absolute left-2 sm:left-4 z-30 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#1c122e]/85 hover:bg-[#2e1d52] border border-[#3b2763] text-white backdrop-blur-md flex items-center justify-center transition duration-200 shadow-xl cursor-pointer"
              title="Previous media (Left Arrow)"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              type="button"
              onClick={nextMedia}
              aria-label="Next media"
              className="absolute right-2 sm:right-4 z-30 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#1c122e]/85 hover:bg-[#2e1d52] border border-[#3b2763] text-white backdrop-blur-md flex items-center justify-center transition duration-200 shadow-xl cursor-pointer"
              title="Next media (Right Arrow)"
            >
              <ChevronRight size={22} />
            </button>
          </>
        )}
      </div>

      {/* Thumbnail strip for multi-media galleries (shrink-0 so it never compresses media) */}
      {mediaList.length > 1 && !isFullscreen && (
        <div className="w-full max-w-xl mx-auto flex items-center justify-center gap-2 overflow-x-auto pt-2 shrink-0 z-10 px-2">
          {mediaList.map((media, idx) => {
            const isVid = isVideoMedia(media.url, media.mediaType);
            const active = idx === currentIndex;
            return (
              <button
                key={media.id}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                aria-label={`View media ${idx + 1}`}
                className={`relative w-16 h-12 rounded-lg overflow-hidden border-2 transition duration-200 shrink-0 cursor-pointer ${
                  active
                    ? "border-pink-500 scale-105 shadow-lg shadow-pink-500/30"
                    : "border-[#23173d] opacity-60 hover:opacity-100"
                }`}
              >
                {isVid ? (
                  <div className="w-full h-full bg-black flex items-center justify-center">
                    <video
                      src={media.url}
                      className="w-full h-full object-cover"
                      muted
                      preload="metadata"
                    />
                    <Film size={12} className="absolute text-pink-400" />
                  </div>
                ) : imageErrors[media.url] ? (
                  <div className="w-full h-full bg-[#160d29] flex items-center justify-center">
                    <ImageIcon size={14} className="text-pink-400/60" />
                  </div>
                ) : (
                  <img
                    src={media.url}
                    alt=""
                    onError={() =>
                      setImageErrors((prev) => ({
                        ...prev,
                        [media.url]: true,
                      }))
                    }
                    className="w-full h-full object-cover"
                  />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
