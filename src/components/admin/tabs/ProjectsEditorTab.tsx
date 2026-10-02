// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
/* eslint-disable */
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState, useMemo } from "react";
import { FolderKanban, Plus, Edit2, Trash2, Copy, ArrowUp, ArrowDown, Eye, EyeOff, Film, Code, Award, Briefcase, Wrench, Layers, Play, Star, ExternalLink, CheckCircle2, AlertTriangle, } from "lucide-react";
import { cmsApi } from "../../../services/cmsApi";
import { isVideoMedia } from "../../../utils/media";
import { isEditedVideoWork, isNormalProjectWork, getWorkTypeMeta } from "../../../utils/workType";
import { ProjectFormModal } from "./ProjectFormModal";
import { VideoFormModal } from "./VideoFormModal";
import { VideoPreviewModal } from "./VideoPreviewModal";
import { DeleteWorkItemModal } from "./DeleteWorkItemModal";
export const ProjectsEditorTab = ({ projects, onRefresh, onOpenMediaPicker, initialTab = "all", }) => {
    const [activeTab, setActiveTab] = useState(initialTab);
    const [editingProject, setEditingProject] = useState(null);
    const [isCreatingProject, setIsCreatingProject] = useState(false);
    const [editingVideo, setEditingVideo] = useState(null);
    const [isCreatingVideo, setIsCreatingVideo] = useState(false);
    const [previewVideo, setPreviewVideo] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const showNotification = (text, type = "success") => {
        setFeedback({ type, text });
        setTimeout(() => setFeedback(null), 4500);
    };
    const filteredItems = useMemo(() => {
        switch (activeTab) {
            case "projects":
                return projects.filter((p) => isNormalProjectWork(p));
            case "videos":
                return projects.filter((p) => isEditedVideoWork(p));
            case "Certificates":
                return projects.filter((p) => p.category === "Certificates");
            case "Experiences":
                return projects.filter((p) => p.category === "Experiences");
            case "Skillsflat":
                return projects.filter((p) => p.category === "Skillsflat" || p.category === "Skills");
            case "all":
            default:
                return projects;
        }
    }, [projects, activeTab]);
    const projectCount = useMemo(() => projects.filter((p) => isNormalProjectWork(p)).length, [projects]);
    const videoCount = useMemo(() => projects.filter((p) => isEditedVideoWork(p)).length, [projects]);
    const certCount = useMemo(() => projects.filter((p) => p.category === "Certificates").length, [projects]);
    const expCount = useMemo(() => projects.filter((p) => p.category === "Experiences").length, [projects]);
    const skillCount = useMemo(() => projects.filter((p) => p.category === "Skillsflat" || p.category === "Skills").length, [projects]);
    const handleSaveProject = async (payload) => {
        if (editingProject) {
            const res = await cmsApi.updateProject(editingProject.id, payload);
            if (res.success) {
                await onRefresh();
                setEditingProject(null);
                showNotification("Project updated successfully.", "success");
            }
            else {
                showNotification("Failed to update project: " + res.error, "error");
            }
        }
        else {
            const res = await cmsApi.createProject(payload);
            if (res.success) {
                await onRefresh();
                setIsCreatingProject(false);
                showNotification("Project created successfully.", "success");
            }
            else {
                showNotification("Failed to create project: " + res.error, "error");
            }
        }
    };
    const handleSaveVideo = async (payload) => {
        if (editingVideo) {
            const res = await cmsApi.updateProject(editingVideo.id, payload);
            if (res.success) {
                await onRefresh();
                setEditingVideo(null);
                showNotification("Video updated successfully.", "success");
            }
            else {
                const message = res.error || "Failed to update video.";
                showNotification(message, "error");
                throw new Error(message);
            }
        }
        else {
            const res = await cmsApi.createProject(payload);
            if (res.success) {
                await onRefresh();
                setIsCreatingVideo(false);
                showNotification("Video created successfully.", "success");
            }
            else {
                const message = res.error || "Failed to publish edited video.";
                showNotification(message, "error");
                throw new Error(message);
            }
        }
    };
    const handleConfirmDelete = async () => {
        if (!deleteTarget)
            return;
        setIsDeleting(true);
        try {
            const res = await cmsApi.deleteProject(deleteTarget.id);
            if (res.success) {
                await onRefresh();
                showNotification(`"${deleteTarget.title}" deleted successfully.`, "success");
                setDeleteTarget(null);
            }
            else {
                showNotification("Failed to delete item: " + res.error, "error");
            }
        }
        catch {
            showNotification("Network error while deleting item.", "error");
        }
        finally {
            setIsDeleting(false);
        }
    };
    const handleDuplicate = async (id) => {
        try {
            const res = await cmsApi.duplicateProject(id);
            if (res.success) {
                await onRefresh();
                showNotification("Item duplicated successfully.", "success");
            }
            else {
                showNotification("Failed to duplicate: " + res.error, "error");
            }
        }
        catch {
            showNotification("Network error duplicating item.", "error");
        }
    };
    const handleTogglePublish = async (item) => {
        try {
            await cmsApi.updateProject(item.id, { published: !item.published });
            await onRefresh();
            showNotification(`Item "${item.title}" ${item.published ? "hidden" : "published"} successfully.`, "success");
        }
        catch {
            showNotification("Failed to update status.", "error");
        }
    };
    const handleMove = async (index, direction) => {
        const list = [...projects];
        const currentItem = filteredItems[index];
        if (!currentItem)
            return;
        const globalIndex = list.findIndex((p) => p.id === currentItem.id);
        if (globalIndex === -1)
            return;
        const targetGlobalIndex = direction === "up" ? globalIndex - 1 : globalIndex + 1;
        if (targetGlobalIndex < 0 || targetGlobalIndex >= list.length)
            return;
        const temp = list[globalIndex];
        list[globalIndex] = list[targetGlobalIndex];
        list[targetGlobalIndex] = temp;
        const ids = list.map((item) => item.id);
        await cmsApi.reorderProjects(ids);
        await onRefresh();
    };
    const handleOpenEdit = (item) => {
        if (isEditedVideoWork(item)) {
            setEditingVideo(item);
        }
        else {
            setEditingProject(item);
        }
    };
    return (_jsxs("div", { className: "space-y-6 max-w-5xl", children: [_jsxs("div", { className: "flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#241c38]", children: [_jsxs("div", { children: [_jsxs("h2", { className: "text-xl font-bold text-white flex items-center gap-2", children: [activeTab === "videos" ? _jsx(Film, { size: 20, className: "text-pink-500" }) : _jsx(FolderKanban, { size: 20, className: "text-[#a855f7]" }), _jsx("span", { children: activeTab === "videos" ? "My Edited Videos" : activeTab === "projects" ? "My Projects" : "Work & Projects Manager" })] }), _jsx("p", { className: "text-xs text-[#9d8bb8] mt-1", children: activeTab === "videos" ? "Manage video editing showcases, motion reels, and cinematic cuts shown in your showcase." : activeTab === "projects" ? "Manage frontend, full-stack, and software development projects." : "Separately manage software projects and personally edited videos while keeping them synchronized in the public Work showcase." })] }), _jsxs("div", { className: "flex items-center gap-2", children: [(activeTab === "all" || activeTab === "projects") && (_jsxs("button", { type: "button", onClick: () => setIsCreatingProject(true), className: "flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#9333ea] hover:from-[#6d28d9] hover:to-[#7e22ce] text-xs font-semibold text-white shadow-lg shadow-[#7c3aed]/25 transition-all cursor-pointer", children: [_jsx(Code, { size: 14 }), _jsx("span", { children: "Add New Project" })] })), (activeTab === "all" || activeTab === "videos") && (_jsxs("button", { type: "button", onClick: () => setIsCreatingVideo(true), className: "flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-xs font-semibold text-white shadow-lg shadow-pink-500/25 transition-all cursor-pointer", children: [_jsx(Film, { size: 14 }), _jsx("span", { children: "Add Edited Video" })] }))] })] }), feedback && (_jsxs("div", { className: `p-3.5 rounded-xl flex items-center gap-2.5 text-xs font-medium transition-all ${feedback.type === "success"
                    ? "bg-emerald-950/70 border border-emerald-500/40 text-emerald-300"
                    : "bg-red-950/70 border border-red-500/40 text-red-300"}`, children: [feedback.type === "success" ? (_jsx(CheckCircle2, { size: 16, className: "text-emerald-400 shrink-0" })) : (_jsx(AlertTriangle, { size: 16, className: "text-red-400 shrink-0" })), _jsx("span", { children: feedback.text })] })), (initialTab !== "projects" && initialTab !== "videos") && _jsxs("div", { className: "flex flex-wrap items-center gap-2 p-1.5 bg-[#0e0919] border border-[#241a38] rounded-2xl", children: [_jsxs("button", { type: "button", onClick: () => setActiveTab("all"), className: `flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${activeTab === "all"
                            ? "bg-[#251b3d] text-white shadow-sm border border-[#3e2c66]"
                            : "text-[#9d8bb8] hover:text-white hover:bg-white/5"}`, children: [_jsx(Layers, { size: 13, className: "text-[#a855f7]" }), _jsx("span", { children: "All Work" }), _jsx("span", { className: "ml-1 px-1.5 py-0.2 text-[10px] rounded-full bg-white/10 text-white font-mono", children: projects.length })] }), _jsxs("button", { type: "button", onClick: () => setActiveTab("projects"), className: `flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${activeTab === "projects"
                            ? "bg-[#7c3aed] text-white shadow-md shadow-[#7c3aed]/20"
                            : "text-[#9d8bb8] hover:text-white hover:bg-white/5"}`, children: [_jsx(Code, { size: 13 }), _jsx("span", { children: "My Projects" }), _jsx("span", { className: "ml-1 px-1.5 py-0.2 text-[10px] rounded-full bg-black/30 text-white font-mono", children: projectCount })] }), _jsxs("button", { type: "button", onClick: () => setActiveTab("videos"), className: `flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${activeTab === "videos"
                            ? "bg-[#ec4899] text-white shadow-md shadow-pink-500/20"
                            : "text-[#9d8bb8] hover:text-white hover:bg-white/5"}`, children: [_jsx(Film, { size: 13 }), _jsx("span", { children: "My Edited Videos" }), _jsx("span", { className: "ml-1 px-1.5 py-0.2 text-[10px] rounded-full bg-black/30 text-white font-mono", children: videoCount })] }), _jsxs("button", { type: "button", onClick: () => setActiveTab("Certificates"), className: `flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${activeTab === "Certificates"
                            ? "bg-[#251b3d] text-white shadow-sm border border-[#3e2c66]"
                            : "text-[#9d8bb8] hover:text-white hover:bg-white/5"}`, children: [_jsx(Award, { size: 13, className: "text-amber-400" }), _jsx("span", { children: "Certificates" }), _jsx("span", { className: "ml-1 px-1.5 py-0.2 text-[10px] rounded-full bg-white/10 text-white font-mono", children: certCount })] }), _jsxs("button", { type: "button", onClick: () => setActiveTab("Experiences"), className: `flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${activeTab === "Experiences"
                            ? "bg-[#251b3d] text-white shadow-sm border border-[#3e2c66]"
                            : "text-[#9d8bb8] hover:text-white hover:bg-white/5"}`, children: [_jsx(Briefcase, { size: 13, className: "text-blue-400" }), _jsx("span", { children: "Experiences" }), _jsx("span", { className: "ml-1 px-1.5 py-0.2 text-[10px] rounded-full bg-white/10 text-white font-mono", children: expCount })] }), _jsxs("button", { type: "button", onClick: () => setActiveTab("Skillsflat"), className: `flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${activeTab === "Skillsflat"
                            ? "bg-[#251b3d] text-white shadow-sm border border-[#3e2c66]"
                            : "text-[#9d8bb8] hover:text-white hover:bg-white/5"}`, children: [_jsx(Wrench, { size: 13, className: "text-emerald-400" }), _jsx("span", { children: "Skills" }), _jsx("span", { className: "ml-1 px-1.5 py-0.2 text-[10px] rounded-full bg-white/10 text-white font-mono", children: skillCount })] })] }), _jsx("div", { className: "space-y-3", children: filteredItems.length === 0 ? (_jsxs("div", { className: "p-12 text-center bg-[#110c20] border border-[#221738] rounded-2xl space-y-3", children: [_jsx(FolderKanban, { size: 32, className: "mx-auto text-[#6a558a]" }), _jsx("h3", { className: "text-sm font-semibold text-white", children: "No items found in this section" }), _jsx("p", { className: "text-xs text-[#9d8bb8] max-w-sm mx-auto", children: activeTab === "videos"
                                ? "You haven't added any edited videos yet. Click 'Add Edited Video' to upload a video cut."
                                : "No items match this category filter. Create a new entry to get started." }), activeTab === "videos" ? (_jsxs("button", { type: "button", onClick: () => setIsCreatingVideo(true), className: "mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-xs font-semibold text-white transition cursor-pointer", children: [_jsx(Plus, { size: 14 }), _jsx("span", { children: "Add Your First Edited Video" })] })) : (_jsxs("button", { type: "button", onClick: () => setIsCreatingProject(true), className: "mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#7c3aed] hover:bg-[#6d28d9] text-xs font-semibold text-white transition cursor-pointer", children: [_jsx(Plus, { size: 14 }), _jsx("span", { children: "Add New Project" })] }))] })) : (filteredItems.map((item, index) => {
                    const isVideo = isEditedVideoWork(item);
                    const meta = getWorkTypeMeta(item);
                    const videoUrl = item.videoUrl || (item.media?.find((m) => m.mediaType === "video")?.url);
                    const displayImage = isVideo
                        ? (item.videoPoster || (item.image && !isVideoMedia(item.image) && true ? item.image : ""))
                        : (item.image || item.coverImage || item.media?.find((m) => m.mediaType === "image")?.url || "");
                    return (_jsxs("div", { className: `p-4 bg-[#120d24] border rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all duration-200 hover:border-[#423166] ${item.published === false
                            ? "opacity-60 border-zinc-800/60"
                            : isVideo
                                ? "border-pink-900/30 shadow-[0_4px_20px_rgba(236,72,153,0.04)]"
                                : "border-[#2b1f48]"}`, children: [_jsxs("div", { className: "flex items-center gap-4 min-w-0 flex-1", children: [_jsxs("div", { className: "w-20 h-14 bg-black rounded-xl overflow-hidden relative shrink-0 border border-[#261d3e] group/thumb flex items-center justify-center", children: [displayImage ? (_jsx("img", { src: displayImage, alt: item.title, onError: (e) => {
                                                    e.currentTarget.style.display = "none";
                                                }, className: "w-full h-full object-cover" })) : isVideo && videoUrl ? (_jsx("video", { src: videoUrl, className: "w-full h-full object-cover opacity-70 pointer-events-none", muted: true, preload: "metadata" })) : (_jsx("div", { className: "w-full h-full flex items-center justify-center bg-[#18112b] text-[#8e7da8]", children: isVideo ? _jsx(Film, { size: 18, className: "text-pink-400" }) : _jsx(FolderKanban, { size: 18, className: "text-[#a855f7]" }) })), isVideo && videoUrl && activeTab === "videos" && (_jsx("button", { type: "button", onClick: () => setPreviewVideo({
                                                    url: videoUrl,
                                                    title: item.title,
                                                    poster: displayImage,
                                                }), className: "absolute inset-0 bg-black/50 hover:bg-black/30 flex items-center justify-center transition cursor-pointer text-pink-400 group-hover/thumb:scale-110", title: "Preview Video Player", children: _jsx(Play, { size: 16, className: "fill-pink-400 ml-0.5" }) })), item.featured && (_jsx("span", { className: "absolute top-1 left-1 p-0.5 rounded-full bg-amber-400 text-black shadow-sm", children: _jsx(Star, { size: 9, className: "fill-black" }) }))] }), _jsxs("div", { className: "min-w-0 space-y-1", children: [_jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [_jsxs("span", { className: `text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md flex items-center gap-1 ${isVideo
                                                            ? "bg-pink-500/15 text-pink-300 border border-pink-500/30"
                                                            : "bg-[#7c3aed]/15 text-[#c49bf7] border border-[#7c3aed]/30"}`, children: [isVideo ? _jsx(Film, { size: 10 }) : _jsx(Code, { size: 10 }), _jsx("span", { children: meta.label })] }), _jsx("h3", { className: "text-sm font-bold text-white truncate max-w-sm", children: item.title }), item.published === false && (_jsx("span", { className: "text-[10px] font-mono text-zinc-400 bg-zinc-800 px-1.5 py-0.5 rounded", children: "Draft" }))] }), _jsx("p", { className: "text-xs text-[#9d8bb8] truncate max-w-md", children: item.description || "No description provided." }), _jsxs("div", { className: "flex flex-wrap items-center gap-2 text-[11px] text-[#7d6b98]", children: [item.tools && (_jsx("span", { className: "font-mono text-[10px] text-[#a491c2] bg-[#1a1330] px-2 py-0.5 rounded", children: item.tools })), item.link && (_jsxs("a", { href: item.link, target: "_blank", rel: "noopener noreferrer", className: "flex items-center gap-0.5 text-xs text-[#a855f7] hover:underline", children: [_jsx("span", { children: "Demo / Link" }), _jsx(ExternalLink, { size: 10 })] }))] })] })] }), _jsxs("div", { className: "flex items-center gap-1.5 shrink-0 self-end md:self-center", children: [_jsx("button", { type: "button", onClick: () => handleTogglePublish(item), className: `p-2 rounded-xl border transition cursor-pointer ${item.published !== false
                                            ? "bg-emerald-950/30 border-emerald-800/40 text-emerald-400 hover:bg-emerald-950/50"
                                            : "bg-zinc-900 border-zinc-700 text-zinc-500 hover:text-zinc-300"}`, title: item.published !== false ? "Visible on site (Click to unpublish)" : "Draft (Click to publish)", children: item.published !== false ? _jsx(Eye, { size: 14 }) : _jsx(EyeOff, { size: 14 }) }), _jsx("button", { type: "button", onClick: () => handleMove(index, "up"), disabled: index === 0, className: "p-2 rounded-xl bg-[#1b1433] hover:bg-[#281e4a] text-[#8e7da8] hover:text-white disabled:opacity-30 cursor-pointer transition border border-[#2b2046]", title: "Move up", children: _jsx(ArrowUp, { size: 14 }) }), _jsx("button", { type: "button", onClick: () => handleMove(index, "down"), disabled: index === filteredItems.length - 1, className: "p-2 rounded-xl bg-[#1b1433] hover:bg-[#281e4a] text-[#8e7da8] hover:text-white disabled:opacity-30 cursor-pointer transition border border-[#2b2046]", title: "Move down", children: _jsx(ArrowDown, { size: 14 }) }), _jsx("button", { type: "button", onClick: () => handleDuplicate(item.id), className: "p-2 rounded-xl bg-[#1b1433] hover:bg-[#281e4a] text-[#8e7da8] hover:text-white cursor-pointer transition border border-[#2b2046]", title: "Duplicate item", children: _jsx(Copy, { size: 14 }) }), _jsxs("button", { type: "button", onClick: () => handleOpenEdit(item), className: "flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#231940] hover:bg-[#342460] text-xs font-semibold text-[#cfb7f5] transition cursor-pointer border border-[#37265a]", children: [_jsx(Edit2, { size: 13 }), _jsx("span", { children: "Edit" })] }), _jsx("button", { type: "button", onClick: () => setDeleteTarget(item), className: "p-2 rounded-xl bg-red-950/30 hover:bg-red-950/60 text-red-400 hover:text-red-200 cursor-pointer transition border border-red-900/40", title: "Delete permanently", children: _jsx(Trash2, { size: 14 }) })] })] }, item.id || index));
                })) }), (isCreatingProject || editingProject) && (_jsx(ProjectFormModal, { initialData: editingProject, onClose: () => {
                    setIsCreatingProject(false);
                    setEditingProject(null);
                }, onSave: handleSaveProject, onOpenMediaPicker: onOpenMediaPicker })), (isCreatingVideo || editingVideo) && (_jsx(VideoFormModal, { initialData: editingVideo, onClose: () => {
                    setIsCreatingVideo(false);
                    setEditingVideo(null);
                }, onSave: handleSaveVideo, onOpenMediaPicker: onOpenMediaPicker })), previewVideo && (_jsx(VideoPreviewModal, { url: previewVideo.url, title: previewVideo.title, poster: previewVideo.poster, onClose: () => setPreviewVideo(null) })), deleteTarget && (_jsx(DeleteWorkItemModal, { title: deleteTarget.title, itemType: isEditedVideoWork(deleteTarget) ? "video" : "project", isDeleting: isDeleting, onConfirm: handleConfirmDelete, onCancel: () => setDeleteTarget(null) }))] }));
};
