// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
/* eslint-disable */
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useState, useEffect } from "react";
import { Inbox, Trash2, Calendar, RefreshCw, Send, AlertCircle, CheckCircle2, Loader2, Mail, User, Search, MailOpen, Check, } from "lucide-react";
import { cmsApi } from "../../../services/cmsApi";
export const MessagesTab = ({ messages, onRefresh }) => {
    const [localMessages, setLocalMessages] = useState(messages);
    const [isDeleting, setIsDeleting] = useState(null);
    const [isBulkDeleting, setIsBulkDeleting] = useState(false);
    const [isTogglingRead, setIsTogglingRead] = useState(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [pendingDelete, setPendingDelete] = useState(null);
    const [pendingBulkDelete, setPendingBulkDelete] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [feedback, setFeedback] = useState(null);
    useEffect(() => {
        setLocalMessages(messages);
    }, [messages]);
    const showNotification = (text, type = "success") => {
        setFeedback({ type, text });
        setTimeout(() => setFeedback(null), 5000);
    };
    const readMessages = localMessages.filter((m) => m.read);
    const readCount = readMessages.length;
    const handleToggleRead = async (msg) => {
        const targetId = msg.id;
        const newStatus = !msg.read;
        setIsTogglingRead(targetId);
        const prevMessages = [...localMessages];
        setLocalMessages((prev) => prev.map((m) => (m.id === targetId ? { ...m, read: newStatus } : m)));
        try {
            const res = await cmsApi.toggleMessageRead(targetId, newStatus);
            if (res.success) {
                showNotification(`Message from "${msg.name}" marked as ${newStatus ? "read" : "unread"}.`, "success");
                await onRefresh();
            }
            else {
                setLocalMessages(prevMessages);
                showNotification(res.error || "Failed to update message status.", "error");
            }
        }
        catch (e) {
            setLocalMessages(prevMessages);
            showNotification(e instanceof Error ? e.message : "Error updating read status.", "error");
        }
        finally {
            setIsTogglingRead(null);
        }
    };
    const handleConfirmDelete = async () => {
        if (!pendingDelete)
            return;
        const targetId = pendingDelete.id;
        const targetName = pendingDelete.name;
        setIsDeleting(targetId);
        const previousMessages = [...localMessages];
        setLocalMessages((prev) => prev.filter((m) => m.id !== targetId));
        try {
            const res = await cmsApi.deleteMessage(targetId);
            if (res.success) {
                showNotification(`Inquiry from "${targetName}" deleted successfully.`, "success");
                setPendingDelete(null);
                await onRefresh();
            }
            else {
                setLocalMessages(previousMessages);
                showNotification(res.error || "Failed to delete message. Please try again.", "error");
            }
        }
        catch (e) {
            setLocalMessages(previousMessages);
            showNotification(e instanceof Error ? e.message : "Network error occurred while deleting message.", "error");
        }
        finally {
            setIsDeleting(null);
        }
    };
    const handleConfirmBulkDelete = async () => {
        if (readCount === 0)
            return;
        setIsBulkDeleting(true);
        const previousMessages = [...localMessages];
        setLocalMessages((prev) => prev.filter((m) => !m.read));
        try {
            const res = await cmsApi.deleteReadMessages();
            if (res.success) {
                showNotification(`${res.count ?? readCount} read message(s) deleted successfully.`, "success");
                setPendingBulkDelete(false);
                await onRefresh();
            }
            else {
                setLocalMessages(previousMessages);
                showNotification(res.error || "Failed to bulk delete read messages.", "error");
            }
        }
        catch (e) {
            setLocalMessages(previousMessages);
            showNotification(e instanceof Error ? e.message : "Network error during bulk deletion.", "error");
        }
        finally {
            setIsBulkDeleting(false);
        }
    };
    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            await onRefresh();
            showNotification("Inbox refreshed.", "success");
        }
        catch {
            showNotification("Failed to refresh inbox.", "error");
        }
        finally {
            setIsRefreshing(false);
        }
    };
    const filteredMessages = localMessages.filter((msg) => {
        if (!searchTerm.trim())
            return true;
        const q = searchTerm.toLowerCase();
        return (msg.name.toLowerCase().includes(q) ||
            msg.email.toLowerCase().includes(q) ||
            msg.message.toLowerCase().includes(q));
    });
    return (_jsxs("div", { className: "space-y-6 max-w-4xl", children: [feedback && (_jsxs("div", { className: `p-4 rounded-xl flex items-center gap-3 text-xs font-medium transition-all ${feedback.type === "success"
                    ? "bg-emerald-950/50 border border-emerald-500/30 text-emerald-300"
                    : "bg-red-950/50 border border-red-500/30 text-red-300"}`, children: [feedback.type === "success" ? (_jsx(CheckCircle2, { size: 16, className: "text-emerald-400 shrink-0" })) : (_jsx(AlertCircle, { size: 16, className: "text-red-400 shrink-0" })), _jsx("span", { children: feedback.text })] })), _jsxs("div", { className: "flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#241c38]", children: [_jsxs("div", { children: [_jsxs("h2", { className: "text-xl font-bold text-white flex items-center gap-2", children: [_jsx(Inbox, { size: 20, className: "text-[#a855f7]" }), _jsx("span", { children: "Visitor Inquiries & Messages" }), _jsx("span", { className: "text-xs px-2 py-0.5 rounded-full bg-[#2a1d4a] text-[#c0a8e8] font-semibold", children: localMessages.length })] }), _jsx("p", { className: "text-xs text-[#9d8bb8] mt-1", children: "Real visitor messages sent through the portfolio contact form are displayed here." })] }), _jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [readCount > 0 && (_jsxs("button", { type: "button", onClick: () => setPendingBulkDelete(true), disabled: isBulkDeleting, className: "flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-300 hover:text-red-100 border border-red-800/40 text-xs font-medium transition-colors cursor-pointer", title: "Delete all read messages", children: [_jsx(Trash2, { size: 13 }), _jsxs("span", { children: ["Delete Read (", readCount, ")"] })] })), _jsxs("button", { type: "button", onClick: handleRefresh, disabled: isRefreshing, className: "flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1f1933] hover:bg-[#2c2349] text-xs font-medium text-[#baa9d2] transition-colors cursor-pointer", children: [_jsx(RefreshCw, { size: 13, className: isRefreshing ? "animate-spin" : "" }), _jsx("span", { children: isRefreshing ? "Refreshing..." : "Refresh Inbox" })] })] })] }), localMessages.length > 0 && (_jsxs("div", { className: "relative", children: [_jsx(Search, { size: 14, className: "absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7f6c9d]" }), _jsx("input", { type: "text", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), placeholder: "Search messages by sender name, email, or keywords...", className: "w-full bg-[#120d22] border border-[#261c40] rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-[#685782] focus:outline-none focus:border-[#7c3aed]" })] })), localMessages.length === 0 ? (_jsxs("div", { className: "text-center py-16 px-4 bg-[#140f24] border border-[#261d3f] rounded-2xl", children: [_jsx(Inbox, { size: 36, className: "mx-auto text-[#62517b] mb-3" }), _jsx("h3", { className: "text-sm font-semibold text-white", children: "Inbox is currently empty" }), _jsx("p", { className: "text-xs text-[#8d7ba3] mt-1 max-w-sm mx-auto", children: "When visitors submit inquiries through the contact form on your portfolio, they will show up here." })] })) : filteredMessages.length === 0 ? (_jsxs("div", { className: "text-center py-12 px-4 bg-[#140f24] border border-[#261d3f] rounded-2xl", children: [_jsx(Search, { size: 28, className: "mx-auto text-[#62517b] mb-2" }), _jsxs("p", { className: "text-xs text-[#8d7ba3]", children: ["No messages matched \u201C", searchTerm, "\u201D"] })] })) : (_jsx("div", { className: "space-y-4", children: filteredMessages.map((msg) => (_jsxs("div", { className: `p-5 bg-[#140f24] border rounded-2xl space-y-3 relative transition-all ${msg.read
                        ? "border-[#271e40] opacity-85 hover:opacity-100 hover:border-[#3d2f5a]"
                        : "border-[#7c3aed]/40 bg-[#160f2a] shadow-lg shadow-[#7c3aed]/5 hover:border-[#9333ea]/60"}`, children: [_jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#201834]", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: `w-9 h-9 rounded-xl border flex items-center justify-center text-xs font-bold ${msg.read
                                                ? "bg-[#1d1633] border-[#312552] text-[#9382b0]"
                                                : "bg-gradient-to-br from-[#7c3aed]/40 to-[#a855f7]/20 border-[#7c3aed]/50 text-[#e9d5ff]"}`, children: msg.name ? msg.name.charAt(0).toUpperCase() : "V" }), _jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [_jsxs("span", { className: "text-sm font-bold text-white flex items-center gap-1.5", children: [_jsx(User, { size: 12, className: "text-[#a855f7]" }), msg.name] }), msg.read ? (_jsx("span", { className: "px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] font-medium text-[#8d7ba3]", children: "READ" })) : (_jsx("span", { className: "px-2 py-0.5 rounded-md bg-[#7c3aed]/25 border border-[#7c3aed]/40 text-[10px] font-bold text-[#c2a4ff] tracking-wider", children: "NEW" })), _jsxs("span", { className: "text-xs text-[#a290bc] flex items-center gap-1", children: [_jsx(Mail, { size: 11, className: "text-[#7f6c9d]" }), msg.email] })] }), _jsxs("div", { className: "flex items-center gap-1.5 text-[11px] text-[#716089] mt-0.5", children: [_jsx(Calendar, { size: 11 }), _jsx("span", { children: msg.date || "Recent" })] })] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("button", { type: "button", onClick: () => handleToggleRead(msg), disabled: isTogglingRead === msg.id, className: "flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#201838] hover:bg-[#2e234e] text-xs font-medium text-[#baa9d2] transition-colors cursor-pointer", title: msg.read ? "Mark as Unread" : "Mark as Read", children: isTogglingRead === msg.id ? (_jsx(Loader2, { size: 12, className: "animate-spin" })) : msg.read ? (_jsxs(_Fragment, { children: [_jsx(MailOpen, { size: 12, className: "text-[#a855f7]" }), _jsx("span", { children: "Unread" })] })) : (_jsxs(_Fragment, { children: [_jsx(Check, { size: 12, className: "text-emerald-400" }), _jsx("span", { children: "Read" })] })) }), _jsxs("a", { href: `mailto:${msg.email}?subject=Re: Inquiry from Portfolio`, className: "flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#271d44] hover:bg-[#392960] text-xs font-medium text-[#d3c4ed] transition-colors", children: [_jsx(Send, { size: 12 }), _jsx("span", { children: "Reply" })] }), _jsxs("button", { type: "button", onClick: () => setPendingDelete(msg), disabled: isDeleting === msg.id, className: "flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 hover:text-red-200 border border-red-800/30 text-xs font-medium transition-colors cursor-pointer", title: "Delete this message", children: [_jsx(Trash2, { size: 13 }), _jsx("span", { children: "Delete" })] })] })] }), _jsx("div", { className: "p-3 rounded-xl bg-[#0e0a1b] border border-[#201736] text-xs text-[#ddd3ee] whitespace-pre-wrap leading-relaxed", children: msg.message })] }, msg.id))) })), pendingDelete && (_jsx("div", { className: "fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4", children: _jsxs("div", { className: "bg-[#140f25] border border-[#392b5b] rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 rounded-xl bg-red-950/60 border border-red-700/40 flex items-center justify-center text-red-400 shrink-0", children: _jsx(Trash2, { size: 20 }) }), _jsxs("div", { children: [_jsx("h3", { className: "text-base font-bold text-white", children: "Delete Message?" }), _jsx("p", { className: "text-xs text-[#9c8bb5]", children: "This action cannot be undone." })] })] }), _jsxs("div", { className: "p-3.5 bg-[#0f0b1c] rounded-xl border border-[#281e42] text-xs space-y-1.5", children: [_jsxs("div", { className: "text-white font-semibold flex items-center justify-between", children: [_jsx("span", { children: pendingDelete.name }), _jsx("span", { className: "text-[11px] text-[#80709d] font-normal", children: pendingDelete.date })] }), _jsx("div", { className: "text-[#a594c3]", children: pendingDelete.email }), _jsxs("p", { className: "text-[#8878a2] line-clamp-2 pt-1 border-t border-[#201738] italic", children: ["\u201C", pendingDelete.message, "\u201D"] })] }), _jsxs("div", { className: "flex items-center justify-end gap-3 pt-2", children: [_jsx("button", { type: "button", onClick: () => setPendingDelete(null), disabled: isDeleting !== null, className: "px-4 py-2 rounded-xl bg-[#231b39] hover:bg-[#31264e] text-xs font-medium text-[#c0b1d8] transition-colors cursor-pointer", children: "Cancel" }), _jsx("button", { type: "button", onClick: handleConfirmDelete, disabled: isDeleting !== null, className: "flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow-lg shadow-red-900/40 transition-colors cursor-pointer", children: isDeleting === pendingDelete.id ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { size: 13, className: "animate-spin" }), _jsx("span", { children: "Deleting..." })] })) : (_jsxs(_Fragment, { children: [_jsx(Trash2, { size: 13 }), _jsx("span", { children: "Permanently Delete" })] })) })] })] }) })), pendingBulkDelete && (_jsx("div", { className: "fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4", children: _jsxs("div", { className: "bg-[#140f25] border border-[#392b5b] rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 rounded-xl bg-red-950/60 border border-red-700/40 flex items-center justify-center text-red-400 shrink-0", children: _jsx(Trash2, { size: 20 }) }), _jsxs("div", { children: [_jsx("h3", { className: "text-base font-bold text-white", children: "Delete All Read Messages?" }), _jsxs("p", { className: "text-xs text-[#9c8bb5]", children: ["This will permanently delete ", readCount, " read message", readCount === 1 ? "" : "s", "."] })] })] }), _jsxs("div", { className: "p-3.5 bg-[#0f0b1c] rounded-xl border border-[#281e42] text-xs space-y-2", children: [_jsxs("p", { className: "text-[#c0b1d8]", children: ["You are about to remove ", _jsx("strong", { children: readCount }), " read visitor inquiry", readCount === 1 ? "" : "ies", ". All unread messages will be safely kept."] }), _jsx("div", { className: "max-h-28 overflow-y-auto space-y-1 pt-1 border-t border-[#201738]", children: readMessages.map((m) => (_jsxs("div", { className: "text-[11px] text-[#8e7da8] flex justify-between", children: [_jsx("span", { className: "truncate max-w-[200px]", children: m.name }), _jsx("span", { className: "text-[#685782]", children: m.date })] }, m.id))) })] }), _jsxs("div", { className: "flex items-center justify-end gap-3 pt-2", children: [_jsx("button", { type: "button", onClick: () => setPendingBulkDelete(false), disabled: isBulkDeleting, className: "px-4 py-2 rounded-xl bg-[#231b39] hover:bg-[#31264e] text-xs font-medium text-[#c0b1d8] transition-colors cursor-pointer", children: "Cancel" }), _jsx("button", { type: "button", onClick: handleConfirmBulkDelete, disabled: isBulkDeleting, className: "flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow-lg shadow-red-900/40 transition-colors cursor-pointer", children: isBulkDeleting ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { size: 13, className: "animate-spin" }), _jsxs("span", { children: ["Deleting ", readCount, " Messages..."] })] })) : (_jsxs(_Fragment, { children: [_jsx(Trash2, { size: 13 }), _jsxs("span", { children: ["Delete ", readCount, " Read Message", readCount === 1 ? "" : "s"] })] })) })] })] }) }))] }));
};
