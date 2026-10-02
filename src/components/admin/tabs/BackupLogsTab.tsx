// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
/* eslint-disable */
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useState } from "react";
import { Database, Download, Upload, RotateCcw, AlertTriangle, History, CheckCircle2, Loader2, } from "lucide-react";
import { cmsApi } from "../../../services/cmsApi";
export const BackupLogsTab = ({ logs, onRefreshAll }) => {
    const [isImporting, setIsImporting] = useState(false);
    const [isResetting, setIsResetting] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [pendingRestoreFile, setPendingRestoreFile] = useState(null);
    const [showResetModal, setShowResetModal] = useState(false);
    const showNotification = (text, type = "success") => {
        setFeedback({ type, text });
        setTimeout(() => setFeedback(null), 5000);
    };
    const handleExport = async () => {
        try {
            await cmsApi.exportBackup();
            showNotification("Site database snapshot exported successfully.", "success");
        }
        catch (e) {
            showNotification(e instanceof Error ? e.message : "Failed to export backup.", "error");
        }
    };
    const handleSelectImportFile = (e) => {
        const file = e.target.files?.[0];
        if (!file)
            return;
        setPendingRestoreFile(file);
        e.target.value = "";
    };
    const handleConfirmRestore = async () => {
        if (!pendingRestoreFile)
            return;
        setIsImporting(true);
        try {
            const text = await pendingRestoreFile.text();
            const parsed = JSON.parse(text);
            const res = await cmsApi.importBackup(parsed);
            if (res.success) {
                showNotification("Backup snapshot restored successfully! All content updated.", "success");
                setPendingRestoreFile(null);
                await onRefreshAll();
            }
            else {
                showNotification("Import failed: " + (res.error || "Unknown error"), "error");
            }
        }
        catch {
            showNotification("Invalid JSON file. Please check the backup file format.", "error");
        }
        finally {
            setIsImporting(false);
        }
    };
    const handleConfirmReset = async () => {
        setIsResetting(true);
        try {
            const res = await cmsApi.resetToDefaults();
            if (res.success) {
                showNotification("Website successfully restored to verified default portfolio state.", "success");
                setShowResetModal(false);
                await onRefreshAll();
            }
            else {
                showNotification("Failed to reset: " + (res.error || "Unknown error"), "error");
            }
        }
        catch {
            showNotification("Network error occurred while resetting defaults.", "error");
        }
        finally {
            setIsResetting(false);
        }
    };
    return (_jsxs("div", { className: "space-y-8 max-w-4xl", children: [_jsxs("div", { className: "pb-4 border-b border-[#241c38]", children: [_jsxs("h2", { className: "text-xl font-bold text-white flex items-center gap-2", children: [_jsx(Database, { size: 20, className: "text-[#a855f7]" }), _jsx("span", { children: "Backup, Restore & Audit History" })] }), _jsx("p", { className: "text-xs text-[#9d8bb8] mt-1", children: "Export full site database snapshots, import previous backups, and review administrative audit logs." })] }), feedback && (_jsxs("div", { className: `p-3.5 rounded-xl flex items-center gap-2.5 text-xs font-medium transition-all ${feedback.type === "success"
                    ? "bg-emerald-950/70 border border-emerald-500/40 text-emerald-300"
                    : "bg-red-950/70 border border-red-500/40 text-red-300"}`, children: [feedback.type === "success" ? (_jsx(CheckCircle2, { size: 16, className: "text-emerald-400 shrink-0" })) : (_jsx(AlertTriangle, { size: 16, className: "text-red-400 shrink-0" })), _jsx("span", { children: feedback.text })] })), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs("div", { className: "p-5 bg-[#140f24] border border-[#271e40] rounded-2xl flex flex-col justify-between space-y-4", children: [_jsxs("div", { children: [_jsx("div", { className: "w-9 h-9 rounded-xl bg-[#201838] flex items-center justify-center text-[#c2a4ff] mb-3", children: _jsx(Download, { size: 18 }) }), _jsx("h3", { className: "text-sm font-bold text-white", children: "Export Site Snapshot" }), _jsx("p", { className: "text-xs text-[#8f7ca8] mt-1 leading-relaxed", children: "Download complete JSON backup containing all projects, text, settings, and media records." })] }), _jsxs("button", { type: "button", onClick: handleExport, className: "w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-[#241b3e] hover:bg-[#342759] text-xs font-semibold text-white transition-colors cursor-pointer", children: [_jsx(Download, { size: 14 }), _jsx("span", { children: "Download Backup (.json)" })] })] }), _jsxs("div", { className: "p-5 bg-[#140f24] border border-[#271e40] rounded-2xl flex flex-col justify-between space-y-4", children: [_jsxs("div", { children: [_jsx("div", { className: "w-9 h-9 rounded-xl bg-[#201838] flex items-center justify-center text-[#c2a4ff] mb-3", children: _jsx(Upload, { size: 18 }) }), _jsx("h3", { className: "text-sm font-bold text-white", children: "Restore from Backup" }), _jsx("p", { className: "text-xs text-[#8f7ca8] mt-1 leading-relaxed", children: "Upload a previously exported JSON backup file to restore full site contents." })] }), _jsxs("label", { className: "w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-[#241b3e] hover:bg-[#342759] text-xs font-semibold text-white transition-colors cursor-pointer", children: [_jsx(Upload, { size: 14 }), _jsx("span", { children: "Choose Backup File" }), _jsx("input", { type: "file", accept: ".json", onChange: handleSelectImportFile, className: "hidden" })] })] }), _jsxs("div", { className: "p-5 bg-[#170e1a] border border-red-900/40 rounded-2xl flex flex-col justify-between space-y-4", children: [_jsxs("div", { children: [_jsx("div", { className: "w-9 h-9 rounded-xl bg-red-950/60 flex items-center justify-center text-red-400 mb-3", children: _jsx(RotateCcw, { size: 18 }) }), _jsx("h3", { className: "text-sm font-bold text-red-200", children: "Reset to Defaults" }), _jsx("p", { className: "text-xs text-[#a07474] mt-1 leading-relaxed", children: "Rollback all content and projects to initial verified portfolio data." })] }), _jsxs("button", { type: "button", onClick: () => setShowResetModal(true), className: "w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-red-950/60 hover:bg-red-900/70 border border-red-800/60 text-xs font-semibold text-red-200 transition-colors cursor-pointer", children: [_jsx(AlertTriangle, { size: 14 }), _jsx("span", { children: "Reset to Defaults" })] })] })] }), _jsxs("div", { className: "space-y-3 pt-4", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(History, { size: 16, className: "text-[#a855f7]" }), _jsxs("h3", { className: "text-sm font-bold text-white uppercase tracking-wider", children: ["Administrative Audit Log (", logs.length, ")"] })] }), _jsx("div", { className: "bg-[#120e21] border border-[#231b3b] rounded-2xl overflow-hidden", children: _jsx("div", { className: "max-h-96 overflow-y-auto divide-y divide-[#1e1732]", children: logs.length === 0 ? (_jsx("div", { className: "py-8 text-center text-xs text-[#7c6c94]", children: "No audit entries recorded yet." })) : (logs.map((log) => (_jsxs("div", { className: "p-3 text-xs flex flex-wrap items-center justify-between gap-2", children: [_jsxs("div", { className: "flex items-center gap-2.5", children: [_jsx("span", { className: "px-2 py-0.5 rounded text-[10px] font-bold bg-[#261c42] text-[#c2a4ff]", children: log.action }), _jsx("span", { className: "text-[#ddd3ee]", children: log.details })] }), _jsxs("div", { className: "flex items-center gap-3 text-[11px] text-[#716188]", children: [_jsxs("span", { children: ["By: ", log.user || "Admin"] }), _jsx("span", { children: new Date(log.timestamp).toLocaleString() })] })] }, log.id)))) }) })] }), pendingRestoreFile && (_jsx("div", { className: "fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4", children: _jsxs("div", { className: "bg-[#140f25] border border-[#392b5b] rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4 animate-fade-in", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 rounded-xl bg-[#7c3aed]/20 border border-[#7c3aed]/40 flex items-center justify-center text-[#c2a4ff] shrink-0", children: _jsx(Upload, { size: 20 }) }), _jsxs("div", { children: [_jsx("h3", { className: "text-base font-bold text-white", children: "Restore Backup Snapshot?" }), _jsx("p", { className: "text-xs text-[#9c8bb5]", children: "This will replace current website text and projects with this snapshot." })] })] }), _jsxs("div", { className: "p-3.5 bg-[#0f0b1c] rounded-xl border border-[#281e42] text-xs space-y-1", children: [_jsxs("div", { className: "text-white font-semibold flex items-center justify-between", children: [_jsxs("span", { children: ["File: ", pendingRestoreFile.name] }), _jsxs("span", { className: "text-[#8e7da7]", children: [(pendingRestoreFile.size / 1024).toFixed(1), " KB"] })] }), _jsx("p", { className: "text-[#8878a2] text-[11px] pt-1 border-t border-[#201738]", children: "A pre-restore snapshot will be automatically logged to audit records on the server." })] }), _jsxs("div", { className: "flex items-center justify-end gap-3 pt-2", children: [_jsx("button", { type: "button", onClick: () => setPendingRestoreFile(null), disabled: isImporting, className: "px-4 py-2 rounded-xl bg-[#231b39] hover:bg-[#31264e] text-xs font-medium text-[#c0b1d8] transition-colors cursor-pointer", children: "Cancel" }), _jsx("button", { type: "button", onClick: handleConfirmRestore, disabled: isImporting, className: "flex items-center gap-2 px-4 py-2 rounded-xl bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-xs font-semibold shadow-lg shadow-[#7c3aed]/40 transition-colors cursor-pointer", children: isImporting ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { size: 13, className: "animate-spin" }), _jsx("span", { children: "Restoring..." })] })) : (_jsxs(_Fragment, { children: [_jsx(Upload, { size: 13 }), _jsx("span", { children: "Proceed & Restore" })] })) })] })] }) })), showResetModal && (_jsx("div", { className: "fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4", children: _jsxs("div", { className: "bg-[#140f25] border border-red-900/60 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4 animate-fade-in", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 rounded-xl bg-red-950/70 border border-red-700/50 flex items-center justify-center text-red-400 shrink-0", children: _jsx(AlertTriangle, { size: 20 }) }), _jsxs("div", { children: [_jsx("h3", { className: "text-base font-bold text-white", children: "Reset to Defaults?" }), _jsx("p", { className: "text-xs text-[#9c8bb5]", children: "This will rollback all website text, settings, projects, and career milestones to default data." })] })] }), _jsx("div", { className: "p-3.5 bg-red-950/30 rounded-xl border border-red-900/40 text-xs text-red-200 leading-relaxed", children: "WARNING: Custom text modifications and unexported project entries will be restored to the verified portfolio default baseline." }), _jsxs("div", { className: "flex items-center justify-end gap-3 pt-2", children: [_jsx("button", { type: "button", onClick: () => setShowResetModal(false), disabled: isResetting, className: "px-4 py-2 rounded-xl bg-[#231b39] hover:bg-[#31264e] text-xs font-medium text-[#c0b1d8] transition-colors cursor-pointer", children: "Cancel" }), _jsx("button", { type: "button", onClick: handleConfirmReset, disabled: isResetting, className: "flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow-lg shadow-red-900/40 transition-colors cursor-pointer", children: isResetting ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { size: 13, className: "animate-spin" }), _jsx("span", { children: "Resetting..." })] })) : (_jsxs(_Fragment, { children: [_jsx(RotateCcw, { size: 13 }), _jsx("span", { children: "Confirm Reset" })] })) })] })] }) }))] }));
};
