// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
/* eslint-disable */
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useState, useRef } from "react";
import { X, Upload, Film, Play, Pause, Volume2, VolumeX, Loader2, Save, Image as ImageIcon, AlertCircle, Link as LinkIcon, } from "lucide-react";
import { mediaStorage } from "../../../services/mediaStorage";
import { getProjectMediaList } from "../../../utils/projectMedia";
import { isVideoMedia } from "../../../utils/media";
import { getVideoPlaybackUrl } from "../../../utils/videoPlayback";
export const VideoFormModal = ({ initialData, onSave, onClose, onOpenMediaPicker, }) => {
    const isEditing = !!initialData?.id;
    const existingMedia = initialData ? getProjectMediaList(initialData) : [];
    const existingVideoMedia = existingMedia.find((m) => m.mediaType === "video" || isVideoMedia(m.url));
    const initialVideoUrl = initialData?.videoUrl ||
        existingVideoMedia?.url ||
        "";
    const initialPoster = initialData?.videoPoster ||
        existingVideoMedia?.poster ||
        (initialData?.image && !isVideoMedia(initialData.image) ? initialData.image : "");
    const [formData, setFormData] = useState({
        title: initialData?.title || (isEditing ? "" : "Cinematic Brand Showreel"),
        workType: "edited-video",
        category: "Edited Videos",
        tools: initialData?.tools || "Premiere Pro, After Effects, DaVinci Resolve",
        description: initialData?.description || "",
        longDescription: initialData?.longDescription || "",
        link: initialData?.link || "",
        githubLink: initialData?.githubLink || "",
        color: initialData?.color || "#EC4899",
        published: initialData?.published !== false,
        featured: initialData?.featured !== undefined ? initialData.featured : true,
        videoUrl: initialVideoUrl,
        videoPoster: initialPoster,
        image: initialPoster,
    });
    const [isUploadingVideo, setIsUploadingVideo] = useState(false);
    const [isUploadingPoster, setIsUploadingPoster] = useState(false);
    const [uploadError, setUploadError] = useState(null);
    const [uploadStatus, setUploadStatus] = useState(null);
    const [formError, setFormError] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const videoPlayerRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(true);
    const [videoPreviewError, setVideoPreviewError] = useState(null);
    const videoFileInputRef = useRef(null);
    const posterFileInputRef = useRef(null);
    const handleUploadVideo = async (files) => {
        if (!files || files.length === 0)
            return;
        const file = files[0];
        if (!file.type.startsWith("video/")) {
            setUploadError(`File "${file.name}" is not a video. Please select an MP4 or WebM file.`);
            return;
        }
        setIsUploadingVideo(true);
        setUploadStatus(file.size > 20 * 1024 * 1024 ? "Auto-compressing and uploading video..." : "Uploading video...");
        setUploadError(null);
        try {
            const res = await mediaStorage.uploadMedia(file, (status) => setUploadStatus(status));
            if (res.success && res.url) {
                setVideoPreviewError(null);
                setFormData((prev) => ({
                    ...prev,
                    videoUrl: res.url,
                    videoPoster: prev.videoPoster || res.poster,
                }));
            }
            else {
                throw new Error(res.error || "Failed to upload video file.");
            }
        }
        catch (err) {
            setUploadError(err instanceof Error ? err.message : "Failed to upload video.");
        }
        finally {
            setIsUploadingVideo(false);
            setUploadStatus(null);
        }
    };
    const handleUploadPoster = async (files) => {
        if (!files || files.length === 0)
            return;
        const file = files[0];
        if (!file.type.startsWith("image/")) {
            setUploadError(`File "${file.name}" is not an image. Poster must be an image file.`);
            return;
        }
        setIsUploadingPoster(true);
        setUploadError(null);
        try {
            const res = await mediaStorage.uploadMedia(file);
            if (res.success && res.url) {
                setFormData((prev) => ({
                    ...prev,
                    videoPoster: res.url,
                    image: res.url,
                    coverImage: res.url,
                }));
            }
            else {
                throw new Error(res.error || "Failed to upload poster image.");
            }
        }
        catch (err) {
            setUploadError(err instanceof Error ? err.message : "Failed to upload poster.");
        }
        finally {
            setIsUploadingPoster(false);
        }
    };
    const togglePlay = () => {
        const video = videoPlayerRef.current;
        if (!video)
            return;
        if (isPlaying) {
            video.pause();
            setIsPlaying(false);
        }
        else {
            video.muted = isMuted;
            video
                .play()
                .then(() => setIsPlaying(true))
                .catch(() => setIsPlaying(false));
        }
    };
    const toggleMute = () => {
        const video = videoPlayerRef.current;
        if (!video)
            return;
        const nextMuted = !isMuted;
        video.muted = nextMuted;
        setIsMuted(nextMuted);
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError(null);
        if (!formData.title?.trim()) {
            setFormError("Video title is required.");
            return;
        }
        const videoUrl = formData.videoUrl?.trim() || "";
        if (!videoUrl) {
            setFormError("Please upload a video to ImageKit before publishing.");
            return;
        }
        try {
            const parsed = new URL(videoUrl);
            if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error();
        } catch {
            setFormError("The uploaded video URL is invalid. Please upload the video again to ImageKit.");
            return;
        }
        const poster = formData.videoPoster?.trim() ||
            (formData.image && !isVideoMedia(formData.image)
                ? formData.image.trim()
                : "");
        const mediaList = [
            {
                id: `m_vid_${Date.now()}`,
                url: videoUrl,
                mediaType: "video",
                poster: poster || undefined,
                title: formData.title,
            },
        ];
        const payload = {
            ...formData,
            workType: "edited-video",
            category: "Edited Videos",
            videoUrl: videoUrl,
            videoPoster: poster || undefined,
            image: poster || undefined,
            coverImage: poster || undefined,
            media: mediaList,
        };
        setIsSaving(true);
        try {
            await onSave(payload);
        } catch (err) {
            setFormError(err instanceof Error ? err.message : "Failed to publish edited video.");
        } finally {
            setIsSaving(false);
        }
    };
    return (_jsxs("div", { className: "fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto", children: [_jsx("input", { type: "file", ref: videoFileInputRef, onChange: (e) => {
                    handleUploadVideo(e.target.files);
                    e.target.value = "";
                }, accept: "video/mp4,video/webm,video/quicktime,video/x-m4v", className: "hidden" }), _jsx("input", { type: "file", ref: posterFileInputRef, onChange: (e) => {
                    handleUploadPoster(e.target.files);
                    e.target.value = "";
                }, accept: "image/png,image/jpeg,image/webp,image/gif", className: "hidden" }), _jsxs("div", { className: "bg-[#140f25] border border-[#392450] rounded-2xl w-full max-w-4xl p-6 shadow-2xl space-y-6 relative my-8 max-h-[90vh] overflow-y-auto", children: [_jsxs("div", { className: "flex items-center justify-between pb-4 border-b border-[#281b3e]", children: [_jsxs("div", { className: "flex items-center gap-2.5", children: [_jsx("div", { className: "w-8 h-8 rounded-lg bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400", children: _jsx(Film, { size: 18 }) }), _jsxs("div", { children: [_jsx("h3", { className: "text-base font-bold text-white", children: isEditing ? `Edit Video: ${initialData?.title}` : "Add New Personally Edited Video" }), _jsx("p", { className: "text-[11px] text-[#a488b7]", children: "Dedicated video editor for uploaded cuts, reels, commercial edits, and sound designs." })] })] }), _jsx("button", { type: "button", onClick: onClose, className: "p-1.5 rounded-lg bg-[#201838] text-[#9d8ab8] hover:text-white cursor-pointer", children: _jsx(X, { size: 16 }) })] }), uploadError && (_jsxs("div", { className: "p-3 bg-red-950/50 border border-red-800/60 rounded-xl text-xs text-red-200 flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(AlertCircle, { size: 14, className: "text-red-400 shrink-0" }), _jsx("span", { children: uploadError })] }), _jsx("button", { type: "button", onClick: () => setUploadError(null), className: "text-red-400 hover:text-white p-0.5 cursor-pointer", children: _jsx(X, { size: 14 }) })] })), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [_jsxs("div", { className: "p-5 rounded-2xl bg-[#0e091a] border border-[#2b1e42] space-y-4", children: [_jsxs("div", { className: "flex flex-wrap items-center justify-between gap-2", children: [_jsxs("div", { children: [_jsxs("span", { className: "text-xs font-bold text-pink-400 uppercase tracking-wider flex items-center gap-1.5", children: [_jsx(Film, { size: 14 }), _jsx("span", { children: "Video File & In-Editor Playback" })] }), _jsx("p", { className: "text-[11px] text-[#9381ad] mt-0.5", children: "Upload an MP4 or WebM video. Uploaded videos are stored on ImageKit and the generated CDN URL is used for playback." })] }), _jsxs("div", { className: "flex items-center gap-2", children: [onOpenMediaPicker && (_jsx("button", { type: "button", onClick: () => onOpenMediaPicker((url) => {
                                                            setFormData((prev) => ({ ...prev, videoUrl: url }));
                                                        }), className: "px-2.5 py-1.5 rounded-lg bg-[#251838] hover:bg-[#34224e] text-xs text-[#d6c4eb] transition cursor-pointer", children: "Select From Library" })), _jsxs("button", { type: "button", onClick: () => videoFileInputRef.current?.click(), disabled: isUploadingVideo, className: "flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#ec4899] hover:bg-[#db2777] text-xs font-semibold text-white transition-colors cursor-pointer shadow-md shadow-pink-500/20", children: [isUploadingVideo ? (_jsx(Loader2, { size: 13, className: "animate-spin" })) : (_jsx(Upload, { size: 13 })), _jsx("span", { children: isUploadingVideo ? (uploadStatus || "Uploading to ImageKit...") : "Upload Video to ImageKit" })] })] })] }), _jsx("div", { className: "aspect-video max-h-[300px] w-full bg-black rounded-xl overflow-hidden relative border border-[#2c2045] flex items-center justify-center", children: formData.videoUrl ? (_jsxs(_Fragment, { children: [_jsx("video", { key: getVideoPlaybackUrl(formData.videoUrl), ref: videoPlayerRef, src: getVideoPlaybackUrl(formData.videoUrl), poster: formData.videoPoster, className: "w-full h-full object-contain", playsInline: true, loop: true, muted: isMuted, preload: "metadata", controls: false, onLoadedMetadata: () => setVideoPreviewError(null), onCanPlay: () => setVideoPreviewError(null), onPlay: () => setIsPlaying(true), onPause: () => setIsPlaying(false), onError: () => { setVideoPreviewError("The browser could not decode this video. ImageKit playback is using an H.264/AAC MP4 representation; upload an MP4/WebM with a browser-compatible codec if this persists."); setIsPlaying(false); } }), _jsxs("div", { className: "absolute bottom-3 left-3 right-3 flex items-center justify-between bg-black/60 backdrop-blur-md px-3 py-2 rounded-xl border border-white/10", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("button", { type: "button", onClick: togglePlay, className: "p-1.5 rounded-lg bg-pink-500/20 hover:bg-pink-500/40 text-pink-300 transition cursor-pointer", title: isPlaying ? "Pause" : "Play", children: isPlaying ? _jsx(Pause, { size: 14 }) : _jsx(Play, { size: 14, className: "fill-pink-300" }) }), _jsx("button", { type: "button", onClick: toggleMute, className: "p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition cursor-pointer", title: isMuted ? "Unmute" : "Mute", children: isMuted ? _jsx(VolumeX, { size: 14 }) : _jsx(Volume2, { size: 14 }) }), _jsx("span", { className: "text-[10px] text-white/70 font-mono", children: isPlaying ? "Playing Video" : "Paused" })] }), _jsx("span", { className: "text-[10px] font-mono text-pink-400 bg-pink-500/10 px-2 py-0.5 rounded border border-pink-500/20", children: videoPreviewError || "LIVE PREVIEW" })] })] })) : (_jsxs("div", { className: "text-center p-6 space-y-2", children: [_jsx(Film, { size: 36, className: "mx-auto text-[#624b7a]" }), _jsx("p", { className: "text-xs text-[#9d8cb4]", children: "No video selected yet" }), _jsx("p", { className: "text-[11px] text-[#6d5c80]", children: "Upload an edited video clip above. The ImageKit CDN URL will appear below after upload." })] })) }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2", children: [_jsxs("div", { children: [_jsxs("label", { className: "block text-[11px] font-semibold text-[#c2a4ff] mb-1 uppercase tracking-wider flex items-center gap-1.5", children: [_jsx(LinkIcon, { size: 12, className: "text-pink-400" }), _jsx("span", { children: "ImageKit Video URL" })] }), _jsx("input", { type: "url", value: formData.videoUrl || "", onChange: (e) => setFormData({ ...formData, videoUrl: e.target.value }), placeholder: "https://ik.imagekit.io/.../video.mp4", readOnly: true, title: "Generated by ImageKit after upload", className: "w-full bg-[#090612] border border-[#271c3c] rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-pink-500" })] }), _jsxs("div", { children: [_jsxs("label", { className: "block text-[11px] font-semibold text-[#c2a4ff] mb-1 uppercase tracking-wider flex items-center justify-between", children: [_jsxs("span", { className: "flex items-center gap-1.5", children: [_jsx(ImageIcon, { size: 12, className: "text-pink-400" }), _jsx("span", { children: "Video Poster / Thumbnail Image" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [onOpenMediaPicker && (_jsx("button", { type: "button", onClick: () => onOpenMediaPicker((url) => {
                                                                            setFormData((prev) => ({
                                                                                ...prev,
                                                                                videoPoster: url,
                                                                                image: url,
                                                                                coverImage: url,
                                                                            }));
                                                                        }), className: "text-[10px] text-pink-400 hover:text-pink-300 font-normal cursor-pointer", children: "From Library" })), _jsx("button", { type: "button", onClick: () => posterFileInputRef.current?.click(), disabled: isUploadingPoster, className: "text-[10px] text-pink-400 hover:text-pink-300 font-normal cursor-pointer", children: isUploadingPoster ? "Uploading..." : "Upload Image" })] })] }), _jsx("input", { type: "text", value: formData.videoPoster || "", onChange: (e) => setFormData({
                                                            ...formData,
                                                            videoPoster: e.target.value,
                                                            image: e.target.value,
                                                        }), placeholder: "/images/... or https://...", className: "w-full bg-[#090612] border border-[#271c3c] rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-pink-500" })] })] })] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4", children: [_jsxs("div", { className: "sm:col-span-2", children: [_jsxs("label", { className: "block text-[11px] font-semibold text-[#c2a4ff] mb-1 uppercase tracking-wider", children: ["Video Title ", _jsx("span", { className: "text-red-400", children: "*" })] }), _jsx("input", { type: "text", value: formData.title || "", onChange: (e) => setFormData({ ...formData, title: e.target.value }), required: true, placeholder: "e.g., Cinematic Brand Showreel 2026", className: "w-full bg-[#0e0a19] border border-[#2b2148] rounded-xl px-3.5 py-2.5 text-sm text-white font-semibold focus:outline-none focus:border-pink-500" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-[11px] font-semibold text-[#c2a4ff] mb-1 uppercase tracking-wider", children: "Accent Theme Color" }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("input", { type: "color", value: formData.color || "#EC4899", onChange: (e) => setFormData({ ...formData, color: e.target.value }), className: "w-8 h-8 rounded-lg bg-transparent border border-[#2b2148] cursor-pointer p-0.5" }), _jsx("input", { type: "text", value: formData.color || "#EC4899", onChange: (e) => setFormData({ ...formData, color: e.target.value }), className: "w-full bg-[#0e0a19] border border-[#2b2148] rounded-xl px-3 py-2 text-xs text-white font-mono" })] })] }), _jsxs("div", { className: "sm:col-span-2", children: [_jsx("label", { className: "block text-[11px] font-semibold text-[#c2a4ff] mb-1 uppercase tracking-wider", children: "Editing Software & Plugins Used" }), _jsx("input", { type: "text", value: formData.tools || "", onChange: (e) => setFormData({ ...formData, tools: e.target.value }), placeholder: "Premiere Pro, After Effects, DaVinci Resolve, Mocha, Blender", className: "w-full bg-[#0e0a19] border border-[#2b2148] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-pink-500" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-[11px] font-semibold text-[#c2a4ff] mb-1 uppercase tracking-wider", children: "External Link (YouTube / Vimeo / Drive)" }), _jsx("input", { type: "url", value: formData.link || "", onChange: (e) => setFormData({ ...formData, link: e.target.value }), placeholder: "https://youtube.com/watch?v=...", className: "w-full bg-[#0e0a19] border border-[#2b2148] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500" })] }), _jsxs("div", { className: "sm:col-span-3", children: [_jsx("label", { className: "block text-[11px] font-semibold text-[#c2a4ff] mb-1 uppercase tracking-wider", children: "Description of the Edit & Creative Techniques" }), _jsx("textarea", { value: formData.description || "", onChange: (e) => setFormData({ ...formData, description: e.target.value }), rows: 2, placeholder: "Describe your editing role, pacing, visual effects, motion graphics, and audio mix...", className: "w-full bg-[#0e0a19] border border-[#2b2148] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-pink-500" })] }), _jsxs("div", { className: "sm:col-span-3 flex items-center gap-6 pt-1", children: [_jsxs("label", { className: "flex items-center gap-2 text-xs text-white cursor-pointer select-none", children: [_jsx("input", { type: "checkbox", checked: formData.published !== false, onChange: (e) => setFormData({ ...formData, published: e.target.checked }), className: "rounded accent-pink-500 w-4 h-4 cursor-pointer" }), _jsx("span", { children: "Published (Visible in My Work section)" })] }), _jsxs("label", { className: "flex items-center gap-2 text-xs text-white cursor-pointer select-none", children: [_jsx("input", { type: "checkbox", checked: !!formData.featured, onChange: (e) => setFormData({ ...formData, featured: e.target.checked }), className: "rounded accent-pink-500 w-4 h-4 cursor-pointer" }), _jsx("span", { children: "Featured Video Showcase" })] })] })] }), formError && (_jsxs("div", { className: "p-3 bg-red-950/70 border border-red-800 text-red-200 text-xs rounded-xl flex items-center gap-2", children: [_jsx(AlertCircle, { size: 15, className: "text-red-400 shrink-0" }), _jsx("span", { children: formError })] })), _jsxs("div", { className: "flex items-center justify-end gap-3 pt-4 border-t border-[#261d3e]", children: [_jsx("button", { type: "button", onClick: onClose, className: "px-4 py-2 rounded-xl bg-[#201838] hover:bg-[#2e2250] text-xs font-medium text-[#baa9d2] transition-colors cursor-pointer", children: "Cancel" }), _jsxs("button", { type: "submit", disabled: isSaving, className: "flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-xs font-semibold text-white shadow-lg shadow-pink-500/25 transition-all cursor-pointer disabled:opacity-50", children: [isSaving ? _jsx(Loader2, { size: 14, className: "animate-spin" }) : _jsx(Save, { size: 14 }), _jsx("span", { children: isSaving ? "Saving..." : isEditing ? "Save Video Changes" : "Publish Edited Video" })] })] })] })] })] }));
};
