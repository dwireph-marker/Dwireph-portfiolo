// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
/* eslint-disable */
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState, useRef } from "react";
import { X, Upload, Image as ImageIcon, Star, Trash2, ArrowLeft, ArrowRight, Loader2, Plus, Save, Code, AlertTriangle, } from "lucide-react";
import { mediaStorage } from "../../../services/mediaStorage";
import { getProjectMediaList } from "../../../utils/projectMedia";
export const ProjectFormModal = ({ initialData, onSave, onClose, onOpenMediaPicker, }) => {
    const isEditing = !!initialData?.id;
    const normalizedInitialMedia = initialData ? getProjectMediaList(initialData) : [];
    const photosOnlyMedia = normalizedInitialMedia.filter((m) => m.mediaType !== "video");
    const [formData, setFormData] = useState({
        title: initialData?.title || (isEditing ? "" : "New Software Project"),
        workType: "project",
        category: initialData?.category || "Projects",
        tools: initialData?.tools || "React, TypeScript, Tailwind CSS",
        description: initialData?.description || "",
        longDescription: initialData?.longDescription || "",
        link: initialData?.link || "",
        githubLink: initialData?.githubLink || "",
        color: initialData?.color || "#A855F7",
        published: initialData?.published !== false,
        featured: !!initialData?.featured,
        image: initialData?.image || photosOnlyMedia[0]?.url || "",
        media: photosOnlyMedia,
    });
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState(null);
    const [formError, setFormError] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const imageInputRef = useRef(null);
    const handleUploadImages = async (files) => {
        if (!files || files.length === 0)
            return;
        setIsUploading(true);
        setUploadError(null);
        try {
            const newItems = [];
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                if (!file.type.startsWith("image/")) {
                    throw new Error(`File "${file.name}" is not an image. Projects only accept image files.`);
                }
                const res = await mediaStorage.uploadMedia(file);
                if (res.success && res.url) {
                    newItems.push({
                        id: res.fileId || `m_${Date.now()}_${i}`,
                        url: res.url,
                        mediaType: "image",
                        title: file.name.replace(/\.[^/.]+$/, ""),
                    });
                }
            }
            if (newItems.length > 0) {
                const existingMedia = formData.media || [];
                const updated = [...existingMedia, ...newItems];
                setFormData({
                    ...formData,
                    media: updated,
                    image: formData.image || updated[0]?.url,
                    coverImage: formData.image || updated[0]?.url,
                });
            }
        }
        catch (err) {
            setUploadError(err instanceof Error ? err.message : "Failed to upload image.");
        }
        finally {
            setIsUploading(false);
        }
    };
    const handleSetCover = (url) => {
        setFormData({
            ...formData,
            image: url,
            coverImage: url,
        });
    };
    const handleRemoveMedia = (index) => {
        const current = formData.media || [];
        const updated = current.filter((_, i) => i !== index);
        const fallbackImage = updated[0]?.url || "";
        setFormData({
            ...formData,
            media: updated,
            image: formData.image === current[index]?.url ? fallbackImage : formData.image,
            coverImage: formData.coverImage === current[index]?.url ? fallbackImage : formData.coverImage,
        });
    };
    const handleMoveMedia = (index, direction) => {
        const current = [...(formData.media || [])];
        const target = direction === "left" ? index - 1 : index + 1;
        if (target < 0 || target >= current.length)
            return;
        const temp = current[index];
        current[index] = current[target];
        current[target] = temp;
        setFormData({ ...formData, media: current });
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError(null);
        if (!formData.title?.trim()) {
            setFormError("Project title is required.");
            return;
        }
        const mediaList = (formData.media || []).filter((m) => m.mediaType === "image");
        const safeImage = formData.image ||
            formData.coverImage ||
            mediaList[0]?.url ||
            initialData?.image ||
            "";
        const payload = {
            ...formData,
            workType: "project",
            category: formData.category || "Projects",
            image: safeImage,
            coverImage: safeImage,
            media: mediaList,
            videoUrl: undefined,
            videoPoster: undefined,
        };
        setIsSaving(true);
        try {
            await onSave(payload);
        }
        finally {
            setIsSaving(false);
        }
    };
    return (_jsxs("div", { className: "fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto", children: [_jsx("input", { type: "file", ref: imageInputRef, onChange: (e) => {
                    handleUploadImages(e.target.files);
                    e.target.value = "";
                }, accept: "image/png,image/jpeg,image/webp,image/svg+xml,image/gif", multiple: true, className: "hidden" }), _jsxs("div", { className: "bg-[#140f25] border border-[#302450] rounded-2xl w-full max-w-4xl p-6 shadow-2xl space-y-6 relative my-8 max-h-[90vh] overflow-y-auto", children: [_jsxs("div", { className: "flex items-center justify-between pb-4 border-b border-[#261d3e]", children: [_jsxs("div", { className: "flex items-center gap-2.5", children: [_jsx("div", { className: "w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400", children: _jsx(Code, { size: 18 }) }), _jsxs("div", { children: [_jsx("h3", { className: "text-base font-bold text-white", children: isEditing ? `Edit Project: ${initialData?.title}` : "Add New Software Project" }), _jsx("p", { className: "text-[11px] text-[#9a88b5]", children: "Manage website and software projects. Upload high-resolution screenshot photos." })] })] }), _jsx("button", { type: "button", onClick: onClose, className: "p-1.5 rounded-lg bg-[#201838] text-[#9d8ab8] hover:text-white cursor-pointer", children: _jsx(X, { size: 16 }) })] }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4", children: [_jsxs("div", { className: "sm:col-span-2", children: [_jsxs("label", { className: "block text-[11px] font-semibold text-[#c2a4ff] mb-1 uppercase tracking-wider", children: ["Project Title ", _jsx("span", { className: "text-red-400", children: "*" })] }), _jsx("input", { type: "text", value: formData.title || "", onChange: (e) => setFormData({ ...formData, title: e.target.value }), required: true, placeholder: "e.g., 3D Portfolio Website", className: "w-full bg-[#0e0a19] border border-[#2b2148] rounded-xl px-3.5 py-2.5 text-sm text-white font-semibold focus:outline-none focus:border-[#a855f7]" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-[11px] font-semibold text-[#c2a4ff] mb-1 uppercase tracking-wider", children: "Category" }), _jsxs("select", { value: formData.category || "Projects", onChange: (e) => setFormData({ ...formData, category: e.target.value }), className: "w-full bg-[#0e0a19] border border-[#2b2148] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#a855f7]", children: [_jsx("option", { value: "Projects", children: "Projects" }), _jsx("option", { value: "Certificates", children: "Certificates" }), _jsx("option", { value: "Experiences", children: "Experiences" }), _jsx("option", { value: "Skillsflat", children: "Skills" })] })] }), _jsxs("div", { className: "sm:col-span-2", children: [_jsx("label", { className: "block text-[11px] font-semibold text-[#c2a4ff] mb-1 uppercase tracking-wider", children: "Technologies & Tools" }), _jsx("input", { type: "text", value: formData.tools || "", onChange: (e) => setFormData({ ...formData, tools: e.target.value }), placeholder: "React, TypeScript, Tailwind CSS, Three.js", className: "w-full bg-[#0e0a19] border border-[#2b2148] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#a855f7]" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-[11px] font-semibold text-[#c2a4ff] mb-1 uppercase tracking-wider", children: "Accent Theme Color" }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("input", { type: "color", value: formData.color || "#A855F7", onChange: (e) => setFormData({ ...formData, color: e.target.value }), className: "w-8 h-8 rounded-lg bg-transparent border border-[#2b2148] cursor-pointer p-0.5" }), _jsx("input", { type: "text", value: formData.color || "#A855F7", onChange: (e) => setFormData({ ...formData, color: e.target.value }), className: "w-full bg-[#0e0a19] border border-[#2b2148] rounded-xl px-3 py-2 text-xs text-white font-mono" })] })] }), _jsxs("div", { className: "sm:col-span-3", children: [_jsx("label", { className: "block text-[11px] font-semibold text-[#c2a4ff] mb-1 uppercase tracking-wider", children: "Short Overview (Shown on Card)" }), _jsx("textarea", { value: formData.description || "", onChange: (e) => setFormData({ ...formData, description: e.target.value }), rows: 2, placeholder: "A concise summary of what this project accomplishes...", className: "w-full bg-[#0e0a19] border border-[#2b2148] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#a855f7]" })] }), _jsxs("div", { className: "sm:col-span-1", children: [_jsx("label", { className: "block text-[11px] font-semibold text-[#c2a4ff] mb-1 uppercase tracking-wider", children: "Live Website Link" }), _jsx("input", { type: "url", value: formData.link || "", onChange: (e) => setFormData({ ...formData, link: e.target.value }), placeholder: "https://...", className: "w-full bg-[#0e0a19] border border-[#2b2148] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#a855f7]" })] }), _jsxs("div", { className: "sm:col-span-2", children: [_jsx("label", { className: "block text-[11px] font-semibold text-[#c2a4ff] mb-1 uppercase tracking-wider", children: "GitHub Repository Link" }), _jsx("input", { type: "url", value: formData.githubLink || "", onChange: (e) => setFormData({ ...formData, githubLink: e.target.value }), placeholder: "https://github.com/...", className: "w-full bg-[#0e0a19] border border-[#2b2148] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#a855f7]" })] }), _jsxs("div", { className: "sm:col-span-3 flex items-center gap-6 pt-2", children: [_jsxs("label", { className: "flex items-center gap-2 text-xs text-white cursor-pointer select-none", children: [_jsx("input", { type: "checkbox", checked: formData.published !== false, onChange: (e) => setFormData({ ...formData, published: e.target.checked }), className: "rounded accent-[#a855f7] w-4 h-4 cursor-pointer" }), _jsx("span", { children: "Published (Visible on public portfolio)" })] }), _jsxs("label", { className: "flex items-center gap-2 text-xs text-white cursor-pointer select-none", children: [_jsx("input", { type: "checkbox", checked: !!formData.featured, onChange: (e) => setFormData({ ...formData, featured: e.target.checked }), className: "rounded accent-[#a855f7] w-4 h-4 cursor-pointer" }), _jsx("span", { children: "Featured Project" })] })] })] }), _jsxs("div", { className: "pt-5 border-t border-[#261d3e] space-y-4", children: [_jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3", children: [_jsxs("div", { children: [_jsxs("span", { className: "text-xs font-bold text-[#c2a4ff] uppercase tracking-wider flex items-center gap-1.5", children: [_jsx(ImageIcon, { size: 14, className: "text-[#a855f7]" }), _jsx("span", { children: "Project Photos & Screenshots" })] }), _jsx("p", { className: "text-[11px] text-[#9381ad] mt-0.5", children: "Normal website projects use image screenshots (.webp, .png, .jpg). Choose one as the primary Cover Photo." })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("button", { type: "button", onClick: () => imageInputRef.current?.click(), disabled: isUploading, className: "flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#7c3aed] hover:bg-[#6d28d9] text-xs font-semibold text-white transition-colors cursor-pointer shadow-md shadow-[#7c3aed]/20", children: [isUploading ? _jsx(Loader2, { size: 13, className: "animate-spin" }) : _jsx(Upload, { size: 13 }), _jsx("span", { children: isUploading ? "Uploading Image..." : "Upload Screenshot" })] }), onOpenMediaPicker && (_jsxs("button", { type: "button", onClick: () => onOpenMediaPicker((url) => {
                                                            const current = formData.media || [];
                                                            const newItem = {
                                                                id: `m_${Date.now()}`,
                                                                url,
                                                                mediaType: "image",
                                                                title: `Photo ${current.length + 1}`,
                                                            };
                                                            const updated = [...current, newItem];
                                                            setFormData({
                                                                ...formData,
                                                                media: updated,
                                                                image: formData.image || url,
                                                            });
                                                        }), className: "flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#271d44] hover:bg-[#392960] text-xs text-[#d3c4ed] transition-colors cursor-pointer", children: [_jsx(Plus, { size: 13 }), _jsx("span", { children: "From Library" })] }))] })] }), uploadError && (_jsxs("div", { className: "p-3 bg-red-950/50 border border-red-800/60 rounded-xl text-xs text-red-200 flex items-center justify-between", children: [_jsx("span", { children: uploadError }), _jsx("button", { type: "button", onClick: () => setUploadError(null), className: "text-red-400 hover:text-white p-0.5 cursor-pointer", children: _jsx(X, { size: 14 }) })] })), (formData.media || []).length === 0 ? (_jsxs("div", { className: "p-8 border border-dashed border-[#342456] rounded-xl flex flex-col items-center justify-center text-center space-y-2 bg-[#0d0918]", children: [_jsx(ImageIcon, { size: 32, className: "text-[#a855f7] opacity-50" }), _jsx("p", { className: "text-xs text-[#d6c4eb] font-medium", children: "No project screenshots uploaded yet" }), _jsx("p", { className: "text-[11px] text-[#86759e]", children: "Click \"Upload Images\" above to upload high-resolution screenshots." })] })) : (_jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3", children: (formData.media || []).map((m, idx) => {
                                            const isCover = formData.image === m.url;
                                            return (_jsxs("div", { className: `p-2.5 rounded-xl border bg-[#0f0b1a] relative group flex flex-col justify-between transition-all ${isCover
                                                    ? "border-[#a855f7] ring-1 ring-[#a855f7] shadow-[0_0_15px_rgba(168,85,247,0.15)]"
                                                    : "border-[#271e3f] hover:border-[#3d2f60]"}`, children: [_jsxs("div", { className: "aspect-video bg-black/60 rounded-lg overflow-hidden relative flex items-center justify-center", children: [_jsx("img", { src: m.url, alt: m.title || "Project screenshot", onError: (e) => {
                                                                    e.currentTarget.style.display = "none";
                                                                }, className: "w-full h-full object-cover" }), isCover && (_jsxs("span", { className: "absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full bg-[#a855f7] text-[9px] font-bold text-white tracking-wide uppercase flex items-center gap-1 shadow-md", children: [_jsx(Star, { size: 9, className: "fill-white" }), _jsx("span", { children: "Cover Photo" })] }))] }), _jsxs("div", { className: "pt-2 flex items-center justify-between gap-1 text-[11px]", children: [_jsx("span", { className: "text-[#a190ba] truncate max-w-[120px]", children: m.title || `Photo ${idx + 1}` }), _jsxs("div", { className: "flex items-center gap-1", children: [!isCover && (_jsx("button", { type: "button", onClick: () => handleSetCover(m.url), className: "px-2 py-0.5 rounded bg-[#201838] hover:bg-[#322354] text-[#c1a5ed] text-[10px] font-medium transition cursor-pointer", children: "Set Cover" })), _jsx("button", { type: "button", onClick: () => handleMoveMedia(idx, "left"), disabled: idx === 0, className: "p-1 rounded bg-[#1c1532] text-[#8c7aab] hover:text-white disabled:opacity-30 cursor-pointer", title: "Move left", children: _jsx(ArrowLeft, { size: 11 }) }), _jsx("button", { type: "button", onClick: () => handleMoveMedia(idx, "right"), disabled: idx === (formData.media?.length || 0) - 1, className: "p-1 rounded bg-[#1c1532] text-[#8c7aab] hover:text-white disabled:opacity-30 cursor-pointer", title: "Move right", children: _jsx(ArrowRight, { size: 11 }) }), _jsx("button", { type: "button", onClick: () => handleRemoveMedia(idx), className: "p-1 rounded bg-red-950/40 text-red-400 hover:text-red-200 cursor-pointer", title: "Remove image", children: _jsx(Trash2, { size: 11 }) })] })] })] }, m.id || idx));
                                        }) }))] }), formError && (_jsxs("div", { className: "p-3 bg-red-950/70 border border-red-800 text-red-200 text-xs rounded-xl flex items-center gap-2", children: [_jsx(AlertTriangle, { size: 15, className: "text-red-400 shrink-0" }), _jsx("span", { children: formError })] })), _jsxs("div", { className: "flex items-center justify-end gap-3 pt-4 border-t border-[#261d3e]", children: [_jsx("button", { type: "button", onClick: onClose, className: "px-4 py-2 rounded-xl bg-[#201838] hover:bg-[#2e2250] text-xs font-medium text-[#baa9d2] transition-colors cursor-pointer", children: "Cancel" }), _jsxs("button", { type: "submit", disabled: isSaving, className: "flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#9333ea] hover:from-[#6d28d9] hover:to-[#7e22ce] text-xs font-semibold text-white shadow-lg shadow-[#7c3aed]/25 transition-all cursor-pointer disabled:opacity-50", children: [isSaving ? _jsx(Loader2, { size: 14, className: "animate-spin" }) : _jsx(Save, { size: 14 }), _jsx("span", { children: isSaving ? "Saving..." : isEditing ? "Save Project Changes" : "Create Project" })] })] })] })] })] }));
};
