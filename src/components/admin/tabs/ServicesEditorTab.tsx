// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
/* eslint-disable */
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState } from "react";
import { Layers, Save, RotateCcw, Plus, Trash2, Tag, ArrowUp, ArrowDown, CheckCircle2, AlertTriangle, } from "lucide-react";
export const ServicesEditorTab = ({ content, onSave }) => {
    const [whatIDo, setWhatIDo] = useState(content.whatIDo);
    const [isSaving, setIsSaving] = useState(false);
    const [newTagInputs, setNewTagInputs] = useState({});
    const [pendingDelete, setPendingDelete] = useState(null);
    const [feedback, setFeedback] = useState(null);
    const showNotification = (text, type = "success") => {
        setFeedback({ type, text });
        setTimeout(() => setFeedback(null), 4500);
    };
    const handleAddService = () => {
        const newService = {
            id: `service-${Date.now()}`,
            title: "NEW SERVICE OFFERING",
            description: "Comprehensive description of skills, domain expertise, and technical delivery.",
            tags: ["New Tool", "Framework"],
        };
        setWhatIDo((prev) => ({
            ...prev,
            services: [...prev.services, newService],
        }));
        showNotification("New service pillar added. Remember to click 'Save Services Changes'.");
    };
    const requestDelete = (service) => {
        if (whatIDo.services.length <= 1) {
            showNotification("At least one service offering must remain in your portfolio.", "warning");
            return;
        }
        setPendingDelete(service);
    };
    const confirmDelete = () => {
        if (!pendingDelete)
            return;
        const deletedTitle = pendingDelete.title;
        setWhatIDo((prev) => ({
            ...prev,
            services: prev.services.filter((s) => s.id !== pendingDelete.id),
        }));
        setPendingDelete(null);
        showNotification(`Service pillar "${deletedTitle}" removed. Click 'Save Services Changes' to persist.`);
    };
    const handleMove = (index, direction) => {
        const list = [...whatIDo.services];
        const targetIndex = direction === "up" ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= list.length)
            return;
        const temp = list[index];
        list[index] = list[targetIndex];
        list[targetIndex] = temp;
        setWhatIDo({ ...whatIDo, services: list });
    };
    const handleUpdateService = (id, field, value) => {
        setWhatIDo((prev) => ({
            ...prev,
            services: prev.services.map((s) => (s.id === id ? { ...s, [field]: value } : s)),
        }));
    };
    const handleAddTag = (serviceId) => {
        const tag = (newTagInputs[serviceId] || "").trim();
        if (!tag)
            return;
        setWhatIDo((prev) => ({
            ...prev,
            services: prev.services.map((s) => s.id === serviceId ? { ...s, tags: [...s.tags, tag] } : s),
        }));
        setNewTagInputs((prev) => ({ ...prev, [serviceId]: "" }));
    };
    const handleRemoveTag = (serviceId, tagIndex) => {
        setWhatIDo((prev) => ({
            ...prev,
            services: prev.services.map((s) => s.id === serviceId
                ? { ...s, tags: s.tags.filter((_, idx) => idx !== tagIndex) }
                : s),
        }));
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await onSave({
                ...content,
                whatIDo,
            });
            showNotification("Services & Skills changes saved successfully.");
        }
        catch {
            showNotification("Failed to save changes. Please try again.", "warning");
        }
        finally {
            setIsSaving(false);
        }
    };
    const handleReset = () => {
        setWhatIDo(content.whatIDo);
        showNotification("Reverted unsaved changes to last saved state.");
    };
    return (_jsxs("form", { onSubmit: handleSubmit, className: "space-y-6 max-w-4xl", children: [feedback && (_jsxs("div", { className: `p-3.5 rounded-xl flex items-center gap-2.5 text-xs font-medium transition-all ${feedback.type === "success"
                    ? "bg-emerald-950/70 border border-emerald-500/40 text-emerald-300"
                    : "bg-amber-950/70 border border-amber-500/40 text-amber-300"}`, children: [feedback.type === "success" ? (_jsx(CheckCircle2, { size: 16, className: "text-emerald-400 shrink-0" })) : (_jsx(AlertTriangle, { size: 16, className: "text-amber-400 shrink-0" })), _jsx("span", { children: feedback.text })] })), _jsxs("div", { className: "flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#241c38]", children: [_jsxs("div", { children: [_jsxs("h2", { className: "text-xl font-bold text-white flex items-center gap-2", children: [_jsx(Layers, { size: 20, className: "text-[#a855f7]" }), _jsx("span", { children: "Skills & What I Do" })] }), _jsx("p", { className: "text-xs text-[#9d8bb8] mt-1", children: "Manage your service pillars, development offerings, creative tools, and technical skill tags." })] }), _jsxs("div", { className: "flex items-center gap-2.5", children: [_jsxs("button", { type: "button", onClick: handleReset, disabled: isSaving, className: "flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1f1933] hover:bg-[#2c2349] text-xs font-medium text-[#baa9d2] transition-colors cursor-pointer", children: [_jsx(RotateCcw, { size: 13 }), _jsx("span", { children: "Reset" })] }), _jsxs("button", { type: "submit", disabled: isSaving, className: "flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#9333ea] hover:from-[#6d28d9] hover:to-[#7e22ce] text-xs font-semibold text-white shadow-lg shadow-[#7c3aed]/25 transition-all cursor-pointer disabled:opacity-50", children: [_jsx(Save, { size: 14 }), _jsx("span", { children: isSaving ? "Saving..." : "Save Services Changes" })] })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium text-[#c2a4ff] mb-1.5 uppercase tracking-wider", children: "Section Title" }), _jsx("input", { type: "text", value: whatIDo.title, onChange: (e) => setWhatIDo({ ...whatIDo, title: e.target.value }), className: "w-full bg-[#110d1f] border border-[#2e254a] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#a855f7] transition-all" })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("span", { className: "text-xs font-semibold text-[#c2a4ff] uppercase tracking-wider", children: ["Service Pillars (", whatIDo.services.length, ")"] }), _jsxs("button", { type: "button", onClick: handleAddService, className: "flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#271d42] hover:bg-[#352759] text-xs text-[#d5c7ee] transition-colors cursor-pointer", children: [_jsx(Plus, { size: 13 }), _jsx("span", { children: "Add Service Pillar" })] })] }), whatIDo.services.map((service, index) => (_jsxs("div", { className: "p-4 bg-[#140f24] border border-[#281f42] rounded-2xl space-y-3 relative group", children: [_jsxs("div", { className: "flex items-center justify-between pb-2 border-b border-[#211838]", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("span", { className: "text-xs font-bold text-[#8d79ad]", children: ["#", index + 1] }), _jsx("input", { type: "text", value: service.title, onChange: (e) => handleUpdateService(service.id, "title", e.target.value), placeholder: "SERVICE TITLE", className: "bg-transparent text-sm font-bold text-white tracking-wide focus:outline-none focus:border-b border-[#a855f7]" })] }), _jsxs("div", { className: "flex items-center gap-1.5", children: [_jsx("button", { type: "button", onClick: () => handleMove(index, "up"), disabled: index === 0, className: "p-1 rounded bg-[#1e1733] text-[#9b89b4] hover:text-white disabled:opacity-30 cursor-pointer", title: "Move Up", children: _jsx(ArrowUp, { size: 13 }) }), _jsx("button", { type: "button", onClick: () => handleMove(index, "down"), disabled: index === whatIDo.services.length - 1, className: "p-1 rounded bg-[#1e1733] text-[#9b89b4] hover:text-white disabled:opacity-30 cursor-pointer", title: "Move Down", children: _jsx(ArrowDown, { size: 13 }) }), _jsx("button", { type: "button", onClick: () => requestDelete(service), className: "p-1 rounded bg-red-950/40 text-red-400 hover:text-red-300 ml-1 cursor-pointer", title: "Delete Service Pillar", children: _jsx(Trash2, { size: 13 }) })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-[11px] text-[#9d8bb8] mb-1", children: "Description" }), _jsx("textarea", { value: service.description, onChange: (e) => handleUpdateService(service.id, "description", e.target.value), rows: 2, className: "w-full bg-[#0e0a19] border border-[#2b2148] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#a855f7]" })] }), _jsxs("div", { children: [_jsxs("label", { className: "block text-[11px] text-[#9d8bb8] mb-1.5 flex items-center gap-1", children: [_jsx(Tag, { size: 12, className: "text-[#a855f7]" }), _jsx("span", { children: "Technologies & Skillset Tags" })] }), _jsx("div", { className: "flex flex-wrap gap-1.5 mb-2", children: service.tags.map((tag, tagIdx) => (_jsxs("span", { className: "inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#21183a] border border-[#352857] text-[11px] text-[#dcd1f3]", children: [_jsx("span", { children: tag }), _jsx("button", { type: "button", onClick: () => handleRemoveTag(service.id, tagIdx), className: "text-red-400 hover:text-red-300 transition-colors cursor-pointer", children: _jsx(Trash2, { size: 11 }) })] }, tagIdx))) }), _jsxs("div", { className: "flex gap-2", children: [_jsx("input", { type: "text", value: newTagInputs[service.id] || "", onChange: (e) => setNewTagInputs({ ...newTagInputs, [service.id]: e.target.value }), placeholder: "Add technology (e.g. Three.js)", className: "flex-1 bg-[#0e0a19] border border-[#2b2148] rounded-lg px-2.5 py-1 text-xs text-white", onKeyDown: (e) => {
                                                    if (e.key === "Enter") {
                                                        e.preventDefault();
                                                        handleAddTag(service.id);
                                                    }
                                                } }), _jsx("button", { type: "button", onClick: () => handleAddTag(service.id), className: "px-2.5 py-1 rounded-lg bg-[#271c42] hover:bg-[#38285e] text-xs text-white cursor-pointer", children: "Add Tag" })] })] })] }, service.id)))] }), pendingDelete && (_jsx("div", { className: "fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4", children: _jsxs("div", { className: "bg-[#140f25] border border-[#392b5b] rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4 animate-fade-in", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 rounded-xl bg-red-950/60 border border-red-700/40 flex items-center justify-center text-red-400 shrink-0", children: _jsx(Trash2, { size: 20 }) }), _jsxs("div", { children: [_jsx("h3", { className: "text-base font-bold text-white", children: "Delete Service Pillar?" }), _jsx("p", { className: "text-xs text-[#9c8bb5]", children: "This will remove the service pillar and all its associated skill tags." })] })] }), _jsxs("div", { className: "p-3.5 bg-[#0f0b1c] rounded-xl border border-[#281e42] text-xs space-y-1.5", children: [_jsx("div", { className: "text-white font-semibold", children: pendingDelete.title }), _jsxs("p", { className: "text-[#8878a2] line-clamp-2 italic", children: ["\u201C", pendingDelete.description, "\u201D"] }), _jsxs("div", { className: "text-[11px] text-[#baa9d2]", children: ["Tags: ", pendingDelete.tags.join(", ") || "None"] })] }), _jsxs("div", { className: "flex items-center justify-end gap-3 pt-2", children: [_jsx("button", { type: "button", onClick: () => setPendingDelete(null), className: "px-4 py-2 rounded-xl bg-[#231b39] hover:bg-[#31264e] text-xs font-medium text-[#c0b1d8] transition-colors cursor-pointer", children: "Cancel" }), _jsxs("button", { type: "button", onClick: confirmDelete, className: "flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow-lg shadow-red-900/40 transition-colors cursor-pointer", children: [_jsx(Trash2, { size: 13 }), _jsx("span", { children: "Delete Pillar" })] })] })] }) }))] }));
};
