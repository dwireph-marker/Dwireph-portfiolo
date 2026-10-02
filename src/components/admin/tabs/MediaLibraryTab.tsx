// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
/* eslint-disable */
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useState, useEffect } from "react";
import { Image as ImageIcon, Film, Upload, Trash2, Copy, Check, Search, AlertTriangle, Play, Eye, X, CheckCircle2, Loader2, } from "lucide-react";
import { cmsApi } from "../../../services/cmsApi";
import { mediaStorage } from "../../../services/mediaStorage";
export const MediaLibraryTab = ({ onSelectMedia, isPickerMode = false, }) => {
    const [mediaList, setMediaList] = useState([]);
    const [filterType, setFilterType] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [copiedId, setCopiedId] = useState(null);
    const [previewItem, setPreviewItem] = useState(null);
    const [deleteWarning, setDeleteWarning] = useState(null);
    const [pendingDeleteMedia, setPendingDeleteMedia] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [uploadStatus, setUploadStatus] = useState("");
    const showNotification = (text, type = "success") => {
        setFeedback({ type, text });
        setTimeout(() => setFeedback(null), 4500);
    };
    const loadMedia = async () => {
        try {
            const data = await cmsApi.getMedia();
            setMediaList(data);
        }
        catch (e) {
            console.error("Failed to load media:", e);
            showNotification(e instanceof Error ? e.message : "database error", "error");
        }
    };
    useEffect(() => {
        loadMedia();
    }, []);
    const handleFileUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file)
            return;
        setIsUploading(true);
        setDeleteWarning(null);
        try {
            const res = await mediaStorage.uploadMedia(file, (status) => setUploadStatus(status), file.name);
            if (res.success) {
                await loadMedia();
                showNotification(`Media file "${file.name}" uploaded successfully.`, "success");
                if (isPickerMode && onSelectMedia && res.url) {
                    onSelectMedia(res.url);
                }
            }
            else {
                showNotification("Upload failed: " + (res.error || "Unknown error"), "error");
            }
        }
        catch {
            showNotification("Network error during file upload.", "error");
        }
        finally {
            setIsUploading(false);
            setUploadStatus("");
            e.target.value = "";
        }
    };
    const handleCopyUrl = (item) => {
        navigator.clipboard.writeText(item.url);
        setCopiedId(item.id);
        setTimeout(() => setCopiedId(null), 2000);
    };
    const handleConfirmDelete = async () => {
        if (!pendingDeleteMedia)
            return;
        setIsDeleting(true);
        setDeleteWarning(null);
        try {
            const res = await cmsApi.deleteMedia(pendingDeleteMedia.id);
            if (res.success) {
                await loadMedia();
                showNotification(`Asset "${pendingDeleteMedia.filename}" deleted successfully.`, "success");
                setPendingDeleteMedia(null);
            }
            else {
                setDeleteWarning(res.error || "Cannot delete media asset.");
                setPendingDeleteMedia(null);
            }
        }
        catch {
            setDeleteWarning("Network error while deleting media asset.");
            setPendingDeleteMedia(null);
        }
        finally {
            setIsDeleting(false);
        }
    };
    const filteredMedia = mediaList.filter((item) => {
        const matchesType = filterType === "all" || item.mediaType === filterType;
        const matchesSearch = item.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.title && item.title.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesType && matchesSearch;
    });
    return (_jsxs("div", { className: "space-y-6 max-w-6xl", children: [feedback && (_jsxs("div", { className: `p-3.5 rounded-xl flex items-center gap-2.5 text-xs font-medium transition-all ${feedback.type === "success"
                    ? "bg-emerald-950/70 border border-emerald-500/40 text-emerald-300"
                    : "bg-red-950/70 border border-red-500/40 text-red-300"}`, children: [feedback.type === "success" ? (_jsx(CheckCircle2, { size: 16, className: "text-emerald-400 shrink-0" })) : (_jsx(AlertTriangle, { size: 16, className: "text-red-400 shrink-0" })), _jsx("span", { children: feedback.text })] })), _jsxs("div", { className: "flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#241c38]", children: [_jsxs("div", { children: [_jsxs("h2", { className: "text-xl font-bold text-white flex items-center gap-2", children: [_jsx(ImageIcon, { size: 20, className: "text-[#a855f7]" }), _jsx("span", { children: "Central Media Library" })] }), _jsx("p", { className: "text-xs text-[#9d8bb8] mt-1", children: "Store, preview, reference, and manage all images and video assets used throughout your portfolio." })] }), _jsxs("label", { className: "flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#9333ea] hover:from-[#6d28d9] hover:to-[#7e22ce] text-xs font-semibold text-white shadow-lg shadow-[#7c3aed]/25 transition-all cursor-pointer", children: [_jsx(Upload, { size: 14, className: isUploading ? "animate-bounce" : "" }), _jsx("span", { children: isUploading ? "Uploading..." : "Upload New Media" }), _jsx("input", { type: "file", accept: "image/*,video/mp4,video/webm,video/quicktime", onChange: handleFileUpload, disabled: isUploading, className: "hidden" })] })] }), deleteWarning && (_jsxs("div", { className: "p-3.5 bg-amber-950/70 border border-amber-800 text-amber-200 text-xs rounded-xl flex items-start gap-2.5", children: [_jsx(AlertTriangle, { size: 16, className: "text-amber-400 shrink-0 mt-0.5" }), _jsxs("div", { className: "flex-1", children: [_jsx("div", { className: "font-semibold mb-0.5", children: "Asset Reference Protected" }), _jsx("div", { children: deleteWarning })] }), _jsx("button", { onClick: () => setDeleteWarning(null), className: "text-amber-400 hover:text-white cursor-pointer", children: _jsx(X, { size: 14 }) })] })), _jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3 bg-[#130f22] border border-[#261d3e] p-3 rounded-2xl", children: [_jsxs("div", { className: "flex items-center gap-2 flex-1 min-w-[240px]", children: [_jsx(Search, { size: 15, className: "text-[#76658f]" }), _jsx("input", { type: "text", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), placeholder: "Search media files...", className: "bg-transparent text-xs text-white placeholder-[#685782] focus:outline-none w-full" })] }), _jsxs("div", { className: "flex items-center gap-1.5", children: [_jsxs("button", { type: "button", onClick: () => setFilterType("all"), className: `px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${filterType === "all"
                                    ? "bg-[#7c3aed] text-white"
                                    : "bg-[#1d1733] text-[#a99abb] hover:text-white"}`, children: ["All (", mediaList.length, ")"] }), _jsx("button", { type: "button", onClick: () => setFilterType("image"), className: `px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${filterType === "image"
                                    ? "bg-[#7c3aed] text-white"
                                    : "bg-[#1d1733] text-[#a99abb] hover:text-white"}`, children: "Images" }), _jsx("button", { type: "button", onClick: () => setFilterType("video"), className: `px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${filterType === "video"
                                    ? "bg-[#7c3aed] text-white"
                                    : "bg-[#1d1733] text-[#a99abb] hover:text-white"}`, children: "Videos" })] })] }), filteredMedia.length === 0 ? (_jsxs("div", { className: "py-16 text-center bg-[#130f21] border border-[#241c38] rounded-2xl", children: [_jsx(ImageIcon, { size: 36, className: "mx-auto text-[#685781] mb-2" }), _jsx("h3", { className: "text-sm font-semibold text-white", children: "No media items found" }), _jsx("p", { className: "text-xs text-[#8c7a9f] mt-1", children: "Upload images or videos (auto-compressed & optimized) to populate your library." })] })) : (_jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4", children: filteredMedia.map((item) => {
                    const isVideo = item.mediaType === "video";
                    return (_jsxs("div", { className: "group bg-[#140f24] border border-[#271e3f] rounded-2xl overflow-hidden hover:border-[#7c3aed]/50 transition-all flex flex-col justify-between", children: [_jsxs("div", { onClick: () => {
                                    if (isPickerMode && onSelectMedia) {
                                        onSelectMedia(item.url);
                                    }
                                    else {
                                        setPreviewItem(item);
                                    }
                                }, className: "aspect-video bg-[#0b0814] relative flex items-center justify-center overflow-hidden cursor-pointer", children: [isVideo ? (_jsxs("div", { className: "relative w-full h-full flex items-center justify-center bg-[#120e21]", children: [item.poster ? (_jsx("img", { src: item.poster, alt: item.filename, className: "w-full h-full object-cover" })) : (_jsx(Film, { size: 28, className: "text-[#a855f7]" })), _jsx("div", { className: "absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity", children: _jsx(Play, { size: 24, className: "text-white" }) }), _jsx("span", { className: "absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/70 text-[9px] font-bold text-white uppercase", children: "Video" })] })) : (_jsx("img", { src: item.url, alt: item.filename, onError: (e) => {
                                            e.currentTarget.style.display = "none";
                                        }, className: "w-full h-full object-cover transition-transform duration-300 group-hover:scale-105", loading: "lazy" })), isPickerMode && (_jsx("div", { className: "absolute inset-0 bg-[#7c3aed]/70 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white font-bold text-xs transition-opacity", children: "Select This Asset" }))] }), _jsxs("div", { className: "p-2.5 space-y-1.5", children: [_jsx("div", { className: "text-xs font-semibold text-white truncate", title: item.filename, children: item.title || item.filename }), _jsxs("div", { className: "flex items-center justify-between text-[10px] text-[#817099]", children: [_jsxs("span", { children: [(item.size / 1024).toFixed(0), " KB"] }), _jsx("span", { className: "uppercase", children: item.mimeType.split("/")[1] })] }), _jsxs("div", { className: "flex items-center justify-between pt-1.5 border-t border-[#201835]", children: [_jsxs("button", { type: "button", onClick: () => handleCopyUrl(item), className: "flex items-center gap-1 text-[11px] text-[#c2a4ff] hover:text-white transition-colors cursor-pointer", title: "Copy URL", children: [copiedId === item.id ? _jsx(Check, { size: 12, className: "text-emerald-400" }) : _jsx(Copy, { size: 12 }), _jsx("span", { children: copiedId === item.id ? "Copied" : "Copy" })] }), _jsx("button", { type: "button", onClick: () => setPreviewItem(item), className: "text-[#9e8cb8] hover:text-white transition-colors cursor-pointer p-1", title: "Preview Asset", children: _jsx(Eye, { size: 12 }) }), _jsx("button", { type: "button", onClick: () => setPendingDeleteMedia(item), className: "text-red-400 hover:text-red-300 transition-colors cursor-pointer p-1", title: "Delete Asset", children: _jsx(Trash2, { size: 12 }) })] })] })] }, item.id));
                }) })), pendingDeleteMedia && (_jsx("div", { className: "fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4", children: _jsxs("div", { className: "bg-[#140f25] border border-[#392b5b] rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4 animate-fade-in", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 rounded-xl bg-red-950/60 border border-red-700/40 flex items-center justify-center text-red-400 shrink-0", children: _jsx(Trash2, { size: 20 }) }), _jsxs("div", { children: [_jsx("h3", { className: "text-base font-bold text-white", children: "Delete Media Asset?" }), _jsx("p", { className: "text-xs text-[#9c8bb5]", children: "This will permanently delete the uploaded asset file." })] })] }), _jsxs("div", { className: "p-3.5 bg-[#0f0b1c] rounded-xl border border-[#281e42] text-xs flex items-center gap-3", children: [_jsx("div", { className: "w-12 h-12 rounded-lg bg-black/60 overflow-hidden shrink-0 flex items-center justify-center border border-[#281e42]", children: pendingDeleteMedia.mediaType === "video" ? (_jsx(Film, { size: 20, className: "text-[#a855f7]" })) : (_jsx("img", { src: pendingDeleteMedia.url, alt: pendingDeleteMedia.filename, onError: (e) => {
                                            e.currentTarget.style.display = "none";
                                        }, className: "w-full h-full object-cover" })) }), _jsxs("div", { className: "min-w-0 flex-1", children: [_jsx("div", { className: "text-white font-semibold truncate", children: pendingDeleteMedia.filename }), _jsxs("div", { className: "text-[11px] text-[#8e7da7]", children: [(pendingDeleteMedia.size / 1024).toFixed(1), " KB"] })] })] }), _jsxs("div", { className: "flex items-center justify-end gap-3 pt-2", children: [_jsx("button", { type: "button", onClick: () => setPendingDeleteMedia(null), disabled: isDeleting, className: "px-4 py-2 rounded-xl bg-[#231b39] hover:bg-[#31264e] text-xs font-medium text-[#c0b1d8] transition-colors cursor-pointer", children: "Cancel" }), _jsx("button", { type: "button", onClick: handleConfirmDelete, disabled: isDeleting, className: "flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow-lg shadow-red-900/40 transition-colors cursor-pointer", children: isDeleting ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { size: 13, className: "animate-spin" }), _jsx("span", { children: "Deleting..." })] })) : (_jsxs(_Fragment, { children: [_jsx(Trash2, { size: 13 }), _jsx("span", { children: "Delete Asset" })] })) })] })] }) })), previewItem && (_jsx("div", { className: "fixed inset-0 z-[70] bg-black/85 backdrop-blur-md flex items-center justify-center p-4", children: _jsxs("div", { className: "bg-[#140f24] border border-[#2e234c] rounded-2xl max-w-3xl w-full p-4 space-y-4 shadow-2xl relative animate-fade-in", children: [_jsxs("div", { className: "flex items-center justify-between pb-2 border-b border-[#251d3b]", children: [_jsxs("div", { className: "flex items-center gap-2 text-sm font-semibold text-white", children: [previewItem.mediaType === "video" ? _jsx(Film, { size: 16, className: "text-[#a855f7]" }) : _jsx(ImageIcon, { size: 16, className: "text-[#a855f7]" }), _jsx("span", { className: "truncate max-w-md", children: previewItem.filename })] }), _jsx("button", { type: "button", onClick: () => setPreviewItem(null), className: "p-1 rounded-lg bg-[#201838] text-[#9f8db9] hover:text-white cursor-pointer", children: _jsx(X, { size: 16 }) })] }), _jsx("div", { className: "max-h-[65vh] flex items-center justify-center overflow-hidden rounded-xl bg-black", children: previewItem.mediaType === "video" ? (_jsx("video", { src: previewItem.url, controls: true, autoPlay: true, className: "max-h-[60vh] max-w-full rounded-lg" })) : (_jsx("img", { src: previewItem.url, alt: previewItem.filename, onError: (e) => {
                                    e.currentTarget.style.display = "none";
                                }, className: "max-h-[60vh] max-w-full object-contain rounded-lg" })) }), _jsxs("div", { className: "flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#251d3b] text-xs", children: [_jsxs("div", { className: "text-[#9f8db9] truncate max-w-md", children: [_jsx("span", { children: "URL: " }), _jsx("span", { className: "text-white select-all", children: previewItem.url })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("button", { type: "button", onClick: () => handleCopyUrl(previewItem), className: "flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#261c42] text-white hover:bg-[#37285e] cursor-pointer", children: [_jsx(Copy, { size: 12 }), _jsx("span", { children: "Copy URL" })] }), onSelectMedia && (_jsxs("button", { type: "button", onClick: () => {
                                                onSelectMedia(previewItem.url);
                                                setPreviewItem(null);
                                            }, className: "flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#7c3aed] text-white hover:bg-[#6d28d9] cursor-pointer font-semibold", children: [_jsx(Check, { size: 12 }), _jsx("span", { children: "Select Asset" })] }))] })] })] }) }))] }));
};
