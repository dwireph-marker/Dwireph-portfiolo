// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
/* eslint-disable */
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState } from "react";
import { Briefcase, Save, RotateCcw, Plus, Trash2, ArrowUp, ArrowDown, CheckCircle2, AlertTriangle, MapPin, Clock, Wrench, Award, ListOrdered, Eye, EyeOff, Sparkles, } from "lucide-react";
export const CareerEditorTab = ({ content, onSave }) => {
    const [career, setCareer] = useState(content.career);
    const [isSaving, setIsSaving] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [pendingDelete, setPendingDelete] = useState(null);
    const showNotification = (text, type = "success") => {
        setFeedback({ type, text });
        setTimeout(() => setFeedback(null), 4500);
    };
    const handleAddEntry = () => {
        const newEntry = {
            id: `exp-${Date.now()}`,
            role: "Senior Creative Developer & UI Specialist",
            company: "Digital Innovations Studio",
            period: "2025 - Present",
            location: "Remote",
            employmentType: "Full-time",
            description: "Directing interactive frontend architecture, immersive 3D web experiences, and scalable design systems.",
            responsibilities: [
                "Architected scalable React & TypeScript component libraries with GSAP animations.",
                "Built dynamic media showcases and real-time CMS admin dashboards.",
            ],
            technologies: ["React", "TypeScript", "Three.js", "GSAP", "Tailwind CSS"],
            tools: ["VS Code", "Blender", "Figma", "Git"],
            achievements: "Recognized for delivering 40% faster render performance and fluid 60fps animations.",
            published: true,
            current: true,
        };
        setCareer((prev) => ({
            ...prev,
            entries: [newEntry, ...prev.entries],
        }));
        showNotification("New experience entry created. Remember to click 'Save Career Changes'.");
    };
    const requestDelete = (entry) => {
        if (career.entries.length <= 1) {
            showNotification("At least one career experience entry must remain in your timeline.", "warning");
            return;
        }
        setPendingDelete(entry);
    };
    const confirmDelete = () => {
        if (!pendingDelete)
            return;
        const deletedRole = pendingDelete.role;
        setCareer((prev) => ({
            ...prev,
            entries: prev.entries.filter((e) => e.id !== pendingDelete.id),
        }));
        setPendingDelete(null);
        showNotification(`Experience entry "${deletedRole}" removed. Click 'Save Career Changes' to persist.`);
    };
    const handleMove = (index, direction) => {
        const list = [...career.entries];
        const target = direction === "up" ? index - 1 : index + 1;
        if (target < 0 || target >= list.length)
            return;
        const temp = list[index];
        list[index] = list[target];
        list[target] = temp;
        setCareer({ ...career, entries: list });
    };
    const handleUpdate = (id, field, value) => {
        setCareer((prev) => ({
            ...prev,
            entries: prev.entries.map((e) => (e.id === id ? { ...e, [field]: value } : e)),
        }));
    };
    const handleArrayFieldChange = (id, field, rawText) => {
        const items = rawText
            .split(field === "responsibilities" ? "\n" : ",")
            .map((s) => s.trim())
            .filter(Boolean);
        handleUpdate(id, field, items);
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await onSave({
                ...content,
                career,
            });
            showNotification("Career timeline changes saved and updated successfully.");
        }
        catch {
            showNotification("Failed to save career timeline changes.", "warning");
        }
        finally {
            setIsSaving(false);
        }
    };
    const handleReset = () => {
        setCareer(content.career);
        showNotification("Reverted unsaved changes to last saved state.");
    };
    return (_jsxs("form", { onSubmit: handleSubmit, className: "space-y-6 max-w-4xl", children: [feedback && (_jsxs("div", { className: `p-3.5 rounded-xl flex items-center gap-2.5 text-xs font-medium transition-all ${feedback.type === "success"
                    ? "bg-emerald-950/70 border border-emerald-500/40 text-emerald-300"
                    : "bg-amber-950/70 border border-amber-500/40 text-amber-300"}`, children: [feedback.type === "success" ? (_jsx(CheckCircle2, { size: 16, className: "text-emerald-400 shrink-0" })) : (_jsx(AlertTriangle, { size: 16, className: "text-amber-400 shrink-0" })), _jsx("span", { children: feedback.text })] })), _jsxs("div", { className: "flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#241c38]", children: [_jsxs("div", { children: [_jsxs("h2", { className: "text-xl font-bold text-white flex items-center gap-2", children: [_jsx(Briefcase, { size: 20, className: "text-[#a855f7]" }), _jsx("span", { children: "Career & Experience Timeline" })] }), _jsx("p", { className: "text-xs text-[#9d8bb8] mt-1", children: "Manage your professional journey, roles, companies, dates, technologies, and achievements displayed in the timeline." })] }), _jsxs("div", { className: "flex items-center gap-2.5", children: [_jsxs("button", { type: "button", onClick: handleReset, disabled: isSaving, className: "flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1f1933] hover:bg-[#2c2349] text-xs font-medium text-[#baa9d2] transition-colors cursor-pointer", children: [_jsx(RotateCcw, { size: 13 }), _jsx("span", { children: "Reset" })] }), _jsxs("button", { type: "submit", disabled: isSaving, className: "flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#9333ea] hover:from-[#6d28d9] hover:to-[#7e22ce] text-xs font-semibold text-white shadow-lg shadow-[#7c3aed]/25 transition-all cursor-pointer disabled:opacity-50", children: [_jsx(Save, { size: 14 }), _jsx("span", { children: isSaving ? "Saving..." : "Save Career Changes" })] })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium text-[#c2a4ff] mb-1.5 uppercase tracking-wider", children: "Section Title" }), _jsx("input", { type: "text", value: career.title, onChange: (e) => setCareer({ ...career, title: e.target.value }), className: "w-full bg-[#110d1f] border border-[#2e254a] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#a855f7] transition-all" })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("span", { className: "text-xs font-semibold text-[#c2a4ff] uppercase tracking-wider", children: ["Timeline Milestones (", career.entries.length, ")"] }), _jsxs("button", { type: "button", onClick: handleAddEntry, className: "flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#271d42] hover:bg-[#352759] text-xs text-[#d5c7ee] transition-colors cursor-pointer", children: [_jsx(Plus, { size: 13 }), _jsx("span", { children: "Add Experience Entry" })] })] }), career.entries.map((entry, index) => {
                        const responsibilitiesText = Array.isArray(entry.responsibilities)
                            ? entry.responsibilities.join("\n")
                            : (entry.responsibilities || "");
                        const technologiesText = Array.isArray(entry.technologies)
                            ? entry.technologies.join(", ")
                            : (entry.technologies || "");
                        const toolsText = Array.isArray(entry.tools)
                            ? entry.tools.join(", ")
                            : (entry.tools || "");
                        const isPublished = entry.published !== false;
                        return (_jsxs("div", { className: `p-5 bg-[#140f24] border rounded-2xl space-y-4 transition-all ${isPublished ? "border-[#281f42]" : "border-[#382626] opacity-75"}`, children: [_jsxs("div", { className: "flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#211838]", children: [_jsxs("div", { className: "flex items-center gap-2.5", children: [_jsxs("span", { className: "text-xs font-bold text-[#8d79ad]", children: ["Entry #", index + 1] }), _jsx("span", { className: `px-2 py-0.5 rounded text-[10px] font-semibold ${isPublished
                                                        ? "bg-emerald-950/60 text-emerald-300 border border-emerald-800/40"
                                                        : "bg-amber-950/60 text-amber-300 border border-amber-800/40"}`, children: isPublished ? "Visible in Timeline" : "Hidden" }), entry.current && (_jsx("span", { className: "px-2 py-0.5 rounded text-[10px] font-semibold bg-[#7c3aed]/30 text-[#d8b4fe] border border-[#7c3aed]/40", children: "Current Role" }))] }), _jsxs("div", { className: "flex items-center gap-1.5", children: [_jsx("button", { type: "button", onClick: () => handleUpdate(entry.id, "published", !isPublished), className: "p-1.5 rounded-lg bg-[#1e1733] text-[#9b89b4] hover:text-white cursor-pointer", title: isPublished ? "Hide from public timeline" : "Show on public timeline", children: isPublished ? _jsx(Eye, { size: 13 }) : _jsx(EyeOff, { size: 13 }) }), _jsx("button", { type: "button", onClick: () => handleMove(index, "up"), disabled: index === 0, className: "p-1.5 rounded-lg bg-[#1e1733] text-[#9b89b4] hover:text-white disabled:opacity-30 cursor-pointer", title: "Move Up", children: _jsx(ArrowUp, { size: 13 }) }), _jsx("button", { type: "button", onClick: () => handleMove(index, "down"), disabled: index === career.entries.length - 1, className: "p-1.5 rounded-lg bg-[#1e1733] text-[#9b89b4] hover:text-white disabled:opacity-30 cursor-pointer", title: "Move Down", children: _jsx(ArrowDown, { size: 13 }) }), _jsx("button", { type: "button", onClick: () => requestDelete(entry), className: "p-1.5 rounded-lg bg-red-950/40 text-red-400 hover:text-red-300 border border-red-900/40 ml-1 cursor-pointer", title: "Delete this experience entry", children: _jsx(Trash2, { size: 13 }) })] })] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-3", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-[11px] text-[#9d8bb8] mb-1", children: "Role / Job Title *" }), _jsx("input", { type: "text", value: entry.role, onChange: (e) => handleUpdate(entry.id, "role", e.target.value), placeholder: "e.g. Lead Frontend Developer", className: "w-full bg-[#0e0a19] border border-[#2b2148] rounded-lg px-2.5 py-1.5 text-xs text-white font-semibold focus:border-[#a855f7]" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-[11px] text-[#9d8bb8] mb-1", children: "Company / Organization *" }), _jsx("input", { type: "text", value: entry.company, onChange: (e) => handleUpdate(entry.id, "company", e.target.value), placeholder: "e.g. Acme Studio", className: "w-full bg-[#0e0a19] border border-[#2b2148] rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-[#a855f7]" })] }), _jsxs("div", { children: [_jsxs("label", { className: "block text-[11px] text-[#9d8bb8] mb-1 flex items-center gap-1", children: [_jsx(Clock, { size: 11, className: "text-[#a855f7]" }), _jsx("span", { children: "Period / Timeline Tag *" })] }), _jsx("input", { type: "text", value: entry.period, onChange: (e) => handleUpdate(entry.id, "period", e.target.value), placeholder: "e.g. 2025 - Present or NOW", className: "w-full bg-[#0e0a19] border border-[#2b2148] rounded-lg px-2.5 py-1.5 text-xs text-white font-medium focus:border-[#a855f7]" })] })] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-3", children: [_jsxs("div", { children: [_jsxs("label", { className: "block text-[11px] text-[#9d8bb8] mb-1 flex items-center gap-1", children: [_jsx(MapPin, { size: 11, className: "text-[#a855f7]" }), _jsx("span", { children: "Location (Optional)" })] }), _jsx("input", { type: "text", value: entry.location || "", onChange: (e) => handleUpdate(entry.id, "location", e.target.value), placeholder: "e.g. Remote or Bengaluru, India", className: "w-full bg-[#0e0a19] border border-[#2b2148] rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-[#a855f7]" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-[11px] text-[#9d8bb8] mb-1", children: "Employment Type (Optional)" }), _jsx("input", { type: "text", value: entry.employmentType || "", onChange: (e) => handleUpdate(entry.id, "employmentType", e.target.value), placeholder: "e.g. Full-time, Freelance, Contract", className: "w-full bg-[#0e0a19] border border-[#2b2148] rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-[#a855f7]" })] }), _jsx("div", { className: "flex items-center gap-2 pt-5", children: _jsxs("label", { className: "inline-flex items-center gap-2 cursor-pointer text-xs text-[#c2a4ff]", children: [_jsx("input", { type: "checkbox", checked: entry.current || false, onChange: (e) => handleUpdate(entry.id, "current", e.target.checked), className: "w-4 h-4 rounded bg-[#0e0a19] border-[#2b2148] text-[#7c3aed] focus:ring-0 cursor-pointer" }), _jsx("span", { children: "Mark as Currently Active" })] }) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-[11px] text-[#9d8bb8] mb-1", children: "Description / High-Level Overview" }), _jsx("textarea", { value: entry.description, onChange: (e) => handleUpdate(entry.id, "description", e.target.value), rows: 2, placeholder: "Summarize your key focus and scope in this role...", className: "w-full bg-[#0e0a19] border border-[#2b2148] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#a855f7]" })] }), _jsxs("div", { children: [_jsxs("label", { className: "block text-[11px] text-[#9d8bb8] mb-1 flex items-center gap-1", children: [_jsx(ListOrdered, { size: 11, className: "text-[#a855f7]" }), _jsx("span", { children: "Key Responsibilities (One per line)" })] }), _jsx("textarea", { value: responsibilitiesText, onChange: (e) => handleArrayFieldChange(entry.id, "responsibilities", e.target.value), rows: 2, placeholder: "Led frontend architecture...\nMentored team of 4 engineers...\nIntegrated GSAP & 3D Three.js components...", className: "w-full bg-[#0e0a19] border border-[#2b2148] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#a855f7]" })] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [_jsxs("div", { children: [_jsxs("label", { className: "block text-[11px] text-[#9d8bb8] mb-1 flex items-center gap-1", children: [_jsx(Sparkles, { size: 11, className: "text-[#a855f7]" }), _jsx("span", { children: "Technologies (Comma-separated)" })] }), _jsx("input", { type: "text", value: technologiesText, onChange: (e) => handleArrayFieldChange(entry.id, "technologies", e.target.value), placeholder: "React, TypeScript, Three.js, GSAP, Tailwind", className: "w-full bg-[#0e0a19] border border-[#2b2148] rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-[#a855f7]" })] }), _jsxs("div", { children: [_jsxs("label", { className: "block text-[11px] text-[#9d8bb8] mb-1 flex items-center gap-1", children: [_jsx(Wrench, { size: 11, className: "text-[#a855f7]" }), _jsx("span", { children: "Tools & Platforms (Comma-separated)" })] }), _jsx("input", { type: "text", value: toolsText, onChange: (e) => handleArrayFieldChange(entry.id, "tools", e.target.value), placeholder: "Figma, Blender, Git, Vite, Postman", className: "w-full bg-[#0e0a19] border border-[#2b2148] rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-[#a855f7]" })] })] }), _jsxs("div", { children: [_jsxs("label", { className: "block text-[11px] text-[#9d8bb8] mb-1 flex items-center gap-1", children: [_jsx(Award, { size: 11, className: "text-[#a855f7]" }), _jsx("span", { children: "Key Achievements / Highlights (Optional)" })] }), _jsx("input", { type: "text", value: entry.achievements ? (Array.isArray(entry.achievements) ? entry.achievements.join("; ") : entry.achievements) : "", onChange: (e) => handleUpdate(entry.id, "achievements", e.target.value), placeholder: "e.g. Increased page load efficiency by 45% and scaled user engagement.", className: "w-full bg-[#0e0a19] border border-[#2b2148] rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-[#a855f7]" })] })] }, entry.id || index));
                    })] }), pendingDelete && (_jsx("div", { className: "fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4", children: _jsxs("div", { className: "bg-[#140f25] border border-[#392b5b] rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4 animate-fade-in", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 rounded-xl bg-red-950/60 border border-red-700/40 flex items-center justify-center text-red-400 shrink-0", children: _jsx(Trash2, { size: 20 }) }), _jsxs("div", { children: [_jsx("h3", { className: "text-base font-bold text-white", children: "Delete Experience Milestone?" }), _jsx("p", { className: "text-xs text-[#9c8bb5]", children: "This will remove the milestone from your portfolio timeline." })] })] }), _jsxs("div", { className: "p-3.5 bg-[#0f0b1c] rounded-xl border border-[#281e42] text-xs space-y-1.5", children: [_jsxs("div", { className: "text-white font-semibold flex items-center justify-between", children: [_jsx("span", { children: pendingDelete.role }), _jsx("span", { className: "text-[11px] text-[#80709d] font-normal", children: pendingDelete.period })] }), _jsx("div", { className: "text-[#a594c3]", children: pendingDelete.company }), pendingDelete.description && (_jsxs("p", { className: "text-[#8878a2] line-clamp-2 pt-1 border-t border-[#201738] italic", children: ["\u201C", pendingDelete.description, "\u201D"] }))] }), _jsxs("div", { className: "flex items-center justify-end gap-3 pt-2", children: [_jsx("button", { type: "button", onClick: () => setPendingDelete(null), className: "px-4 py-2 rounded-xl bg-[#231b39] hover:bg-[#31264e] text-xs font-medium text-[#c0b1d8] transition-colors cursor-pointer", children: "Cancel" }), _jsxs("button", { type: "button", onClick: confirmDelete, className: "flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow-lg shadow-red-900/40 transition-colors cursor-pointer", children: [_jsx(Trash2, { size: 13 }), _jsx("span", { children: "Delete Milestone" })] })] })] }) }))] }));
};
