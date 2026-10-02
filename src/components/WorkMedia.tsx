import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import type { SyntheticEvent } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Film,
  Loader2,
  RotateCcw,
  ExternalLink,
} from "lucide-react";
import { MdArrowOutward } from "react-icons/md";
import {
  isVideoMedia,
  isDirectPlayableVideo,
  isInstagramUrl,
  isSocialVideoUrl,
} from "../utils/media";
import { getProjectMediaList } from "../utils/projectMedia";
import { videoPlaybackManager } from "../utils/videoManager";
import { isEditedVideoWork } from "../utils/workType";
import { getVideoPlaybackUrl } from "../utils/videoPlayback";
import MediaLightbox from "./MediaLightbox";
import { ProjectItem } from "../types/project";

type WorkMediaProps = {
  project: ProjectItem;
};

export default function WorkMedia({ project }: WorkMediaProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isInView, setIsInView] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const [mediaError, setMediaError] = useState<Record<string, boolean>>({});

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const isEditedVideo = isEditedVideoWork(project);
  const mediaList = useMemo(() => getProjectMediaList(project), [project]);
  const currentMedia = mediaList[currentIndex] || mediaList[0];
  const currentMediaUrl = currentMedia?.url || "";
  const playbackUrl = isEditedVideoWork(project) && currentMedia?.mediaType === "video"
    ? getVideoPlaybackUrl(currentMediaUrl)
    : currentMediaUrl;
  const currentMediaId = currentMedia?.id || "media_0";

  // ONLY treat as video if this is an edited video work item AND has a direct video URL
  const isDirectVideo =
    isEditedVideo &&
    (isDirectPlayableVideo(currentMediaUrl) ||
      isVideoMedia(currentMediaUrl, currentMedia?.mediaType));

  const isSocialReel =
    isEditedVideo &&
    !isDirectVideo &&
    isSocialVideoUrl(currentMediaUrl || project.link);

  const hasError = !!mediaError[currentMediaId];
  const posterUrl =
    currentMedia?.poster ||
    project.videoPoster ||
    (!isVideoMedia(project.image) ? project.image : undefined);

  // 1. Video registration with playback manager (only on mount / unmount or url change)
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isDirectVideo) return;

    videoPlaybackManager.register(video);
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
  }, [isDirectVideo, currentMediaUrl]);

  // 2. Audio mute synchronization (never pauses or toggles playback)
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  // 3. Viewport intersection observer for auto-playing when scrolled into view
  useEffect(() => {
    const el = containerRef.current;
    if (!el || !isDirectVideo) return;

    let isMounted = true;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!isMounted) return;
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.15, rootMargin: "60px" },
    );

    observer.observe(el);
    return () => {
      isMounted = false;
      observer.disconnect();
    };
  }, [isDirectVideo, currentMediaUrl]);

  // 4. Video playback controller (strictly respects userPaused and only acts if state differs)
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isDirectVideo || hasError) return;

    if (isInView && !userPaused) {
      if (video.paused) {
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise.catch((err) => {
            console.debug("Autoplay note:", err);
          });
        }
      }
    } else {
      if (!video.paused) {
        video.pause();
      }
    }
  }, [isDirectVideo, isInView, userPaused, hasError, currentMediaUrl]);

  const handlePlayPause = useCallback(
    (e: SyntheticEvent) => {
      e.stopPropagation();
      const video = videoRef.current;
      if (!video) return;

      if (!video.paused) {
        video.pause();
        setUserPaused(true);
      } else {
        videoPlaybackManager.pauseAll(video);
        video.muted = isMuted;
        setUserPaused(false);
        video.play().catch(() => {});
      }
    },
    [isMuted],
  );

  const handleToggleMute = useCallback((e: SyntheticEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    const nextMuted = !video.muted;
    video.muted = nextMuted;
    setIsMuted(nextMuted);
  }, []);

  const [videoDims, setVideoDims] = useState<{ width: number; height: number } | null>(null);
  const [startFullscreen, setStartFullscreen] = useState(false);

  const handleOpenLightbox = useCallback((e: SyntheticEvent, asFullscreen = false) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (video) {
      if (video.videoWidth && video.videoHeight) {
        setVideoDims({ width: video.videoWidth, height: video.videoHeight });
      }
      if (!video.paused) {
        video.pause();
      }
    }
    setStartFullscreen(asFullscreen);
    setLightboxOpen(true);
  }, []);

  const handleError = (mediaId: string) => {
    setMediaError((prev) => ({ ...prev, [mediaId]: true }));
    setIsLoading(false);
  };

  const handleRetry = (e: SyntheticEvent, mediaId: string) => {
    e.stopPropagation();
    setMediaError((prev) => ({ ...prev, [mediaId]: false }));
    setIsLoading(true);
    setUserPaused(false);
    const video = videoRef.current;
    if (video) {
      video.load();
      video.muted = isMuted;
      video.play().catch(() => {});
    }
  };

  return (
    <>
      <div className="work-image" ref={containerRef}>
        <div
          className="work-image-in cursor-pointer relative group overflow-hidden select-none"
          onClick={() => {
            if (isDirectVideo) {
              // Clicking the container toggles play/pause or opens lightbox
              setLightboxOpen(true);
            } else {
              setLightboxOpen(true);
            }
          }}
          data-cursor="pointer"
          role="region"
          aria-label={`Project media: ${project.title}`}
        >
          {/* External site link if present (top-right link icon) */}
          {project.link && (
            <a
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              className="work-link z-20"
              onClick={(e: SyntheticEvent<HTMLAnchorElement>) => e.stopPropagation()}
              data-cursor="disable"
              title="Visit Live Site"
            >
              <MdArrowOutward />
            </a>
          )}

          {/* 1. Error state */}
          {hasError ? (
            <div className="relative w-full h-full bg-[#120a22] border border-[#2e1d52] flex flex-col items-center justify-center p-6 text-center">
              {isDirectVideo ? (
                <>
                  <Film size={32} className="text-[#a855f7] mb-2 opacity-70" />
                  <p className="text-xs text-[#eae5ec] font-semibold">{project.title}</p>
                  <span className="text-[10px] text-[#8a81a3] font-mono mt-1">
                    Video playback unavailable
                  </span>
                  <div className="flex items-center gap-2 mt-3">
                    <button
                      type="button"
                      onClick={(e) => handleRetry(e, currentMedia.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#271842] hover:bg-[#38235f] text-xs text-[#c2a4ff] font-mono transition cursor-pointer"
                    >
                      <RotateCcw size={12} />
                      <span>Retry Playback</span>
                    </button>
                    {project.link && (
                      <a
                        href={project.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-pink-500/20 hover:bg-pink-500/30 text-xs text-pink-300 font-mono transition cursor-pointer"
                      >
                        <span>Watch Link</span>
                        <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <p className="text-xs text-[#eae5ec] font-semibold">{project.title}</p>
                  <span className="text-[10px] text-[#8a81a3] font-mono mt-1">Image preview</span>
                </>
              )}
            </div>
          ) : isDirectVideo ? (
            /* 2. DIRECT VIDEO PLAYER (Edited Videos ONLY) */
            <div className="relative w-full h-full bg-black overflow-hidden">
              <video
                ref={videoRef}
                key={playbackUrl}
                src={playbackUrl}
                poster={posterUrl}
                muted={isMuted}
                loop={true}
                playsInline={true}
                preload="metadata"
                controls={false}
                onWaiting={() => setIsLoading(true)}
                onCanPlay={() => setIsLoading(false)}
                onLoadedData={() => setIsLoading(false)}
                onPlaying={() => {
                  setIsLoading(false);
                  setIsPlaying(true);
                }}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onError={() => handleError(currentMediaId)}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />

              {/* Buffering indicator */}
              {isLoading && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center pointer-events-none z-10">
                  <div className="p-2.5 rounded-full bg-black/70 backdrop-blur-md border border-pink-500/40 shadow-lg">
                    <Loader2 size={24} className="text-pink-400 animate-spin" />
                  </div>
                </div>
              )}

              {/* Edited Video badge */}
              <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-mono tracking-wider font-semibold text-[#eae5ec] flex items-center gap-1.5 border border-white/10 z-10">
                <Film size={12} className="text-pink-400" />
                <span>EDITED VIDEO</span>
              </div>

              {/* Bottom Video Controls Bar */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between z-20 transition-all duration-300 opacity-90 group-hover:opacity-100">
                <div className="flex items-center gap-2 bg-black/75 backdrop-blur-md border border-white/15 px-2.5 py-1.5 rounded-xl shadow-xl">
                  {/* Play / Pause button */}
                  <button
                    type="button"
                    onClick={handlePlayPause}
                    aria-label={isPlaying ? "Pause video" : "Play video"}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                    title={isPlaying ? "Pause" : "Play"}
                  >
                    {isPlaying ? (
                      <Pause size={15} />
                    ) : (
                      <Play size={15} className="fill-white ml-0.5" />
                    )}
                  </button>

                  {/* Mute / Unmute button */}
                  <button
                    type="button"
                    onClick={handleToggleMute}
                    aria-label={isMuted ? "Unmute audio" : "Mute audio"}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                    title={isMuted ? "Unmute" : "Mute"}
                  >
                    {isMuted ? (
                      <VolumeX size={15} className="text-red-400" />
                    ) : (
                      <Volume2 size={15} className="text-emerald-400" />
                    )}
                  </button>
                </div>

                {/* Theater view expand button */}
                <button
                  type="button"
                  onClick={(e) => handleOpenLightbox(e, true)}
                  aria-label="Expand video to fullscreen (uploaded ratio)"
                  className="p-2 rounded-xl bg-black/75 hover:bg-black/90 backdrop-blur-md border border-white/15 text-white shadow-xl hover:scale-105 transition cursor-pointer group/exp"
                  title="Expand to Fullscreen Theater (Uploaded Ratio)"
                >
                  <Maximize2 size={14} className="group-hover/exp:scale-110 transition-transform" />
                </button>
              </div>

              {/* Large interactive Center Play Button when paused */}
              {!isPlaying && (
                <button
                  type="button"
                  onClick={handlePlayPause}
                  className="absolute inset-0 bg-black/30 hover:bg-black/20 flex items-center justify-center transition duration-300 cursor-pointer group/play z-15"
                  aria-label="Play video"
                >
                  <div className="w-13 h-13 rounded-full bg-pink-600/90 hover:bg-pink-500 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shadow-2xl transition-transform transform group-hover/play:scale-110">
                    <Play size={22} className="fill-white ml-1" />
                  </div>
                </button>
              )}
            </div>
          ) : isSocialReel ? (
            /* 3. SOCIAL REEL PREVIEW (Instagram / YouTube links) */
            <div className="relative w-full h-full bg-black overflow-hidden flex flex-col justify-end p-4 group/social">
              {posterUrl ? (
                <img
                  src={posterUrl}
                  alt={project.title}
                  className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover/social:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-pink-950/60 to-purple-950/60" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

              <div className="relative z-10 space-y-2">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-pink-500/20 border border-pink-500/40 text-pink-300 text-[10px] font-mono font-semibold">
                  <Film size={12} />
                  <span>
                    {isInstagramUrl(currentMedia?.url || project.link)
                      ? "INSTAGRAM REEL"
                      : "SOCIAL VIDEO"}
                  </span>
                </div>

                <h4 className="text-white font-bold text-sm line-clamp-1">{project.title}</h4>

                {(currentMedia?.url || project.link) && (
                  <a
                    href={currentMedia?.url || project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-semibold shadow-lg transition cursor-pointer"
                  >
                    <span>Watch Reel</span>
                    <ExternalLink size={13} />
                  </a>
                )}
              </div>
            </div>
          ) : (
            /* 4. STANDARD PROJECT IMAGE (Websites, Apps, Software Projects) */
            /* STRICTLY NO PLAY / PAUSE BUTTONS HERE */
            <div className="relative w-full h-full overflow-hidden">
              <img
                src={
                  currentMedia?.url ||
                  (!isVideoMedia(project.image) ? project.image : "")
                }
                alt={currentMedia?.title || project.title}
                loading="lazy"
                decoding="async"
                onError={() => handleError(currentMedia?.id || "default")}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          )}

          {/* Media list slide count badge (for multi-media projects) */}
          {mediaList.length > 1 && (
            <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-mono text-[#eae5ec] border border-white/10 z-10">
              {currentIndex + 1} / {mediaList.length}
            </div>
          )}
        </div>
      </div>

      {/* Lightbox / Theater Modal */}
      {lightboxOpen && (
        <MediaLightbox
          mediaList={mediaList}
          initialIndex={currentIndex}
          projectTitle={project.title}
          isEditedVideo={isEditedVideo && isDirectVideo}
          initialDimensions={videoDims}
          initialFullscreen={startFullscreen}
          onClose={() => {
            setLightboxOpen(false);
            setStartFullscreen(false);
            const video = videoRef.current;
            if (video && isDirectVideo && isInView && !userPaused) {
              video.muted = true;
              setIsMuted(true);
              video.play().catch(() => {});
            }
          }}
          onIndexChange={(idx: number) => setCurrentIndex(idx)}
        />
      )}
    </>
  );
}
