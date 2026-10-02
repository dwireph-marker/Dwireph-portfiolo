import React from "react";
import { Globe, LogOut, ShieldCheck, CheckCircle2, AlertTriangle, ExternalLink } from "lucide-react";

interface AdminHeaderProps {
  adminEmail: string;
  hasUnsavedChanges: boolean;
  onSaveAll?: () => void;
  onViewWebsite: () => void;
  onLogout: () => void;
  statusMessage?: { type: "success" | "error" | "info"; text: string } | null;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  adminEmail,
  hasUnsavedChanges,
  onViewWebsite,
  onLogout,
  statusMessage,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-[#110d1e]/95 backdrop-blur-md border-b border-[#241c38] px-4 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
      {/* Brand & Connection Status */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#7c3aed] to-[#a855f7] flex items-center justify-center text-white font-bold text-sm shadow-md shadow-[#7c3aed]/20">
          DK
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm tracking-wide text-white">Portfolio Admin Console</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse mr-1.5" />
              Live Server Online
            </span>
          </div>
          <span className="text-[11px] text-[#8675a1] block">Full Website Management Engine</span>
        </div>
      </div>

      {/* Global Status Message Toast Banner */}
      {statusMessage && (
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border animate-fade-in ${
            statusMessage.type === "success"
              ? "bg-emerald-950/70 border-emerald-800 text-emerald-300"
              : statusMessage.type === "error"
              ? "bg-red-950/70 border-red-800 text-red-300"
              : "bg-blue-950/70 border-blue-800 text-blue-300"
          }`}
        >
          {statusMessage.type === "success" ? (
            <CheckCircle2 size={14} className="text-emerald-400" />
          ) : (
            <AlertTriangle size={14} className="text-red-400" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Right Controls: Unsaved Badge, View Site, Admin Info, Logout */}
      <div className="flex items-center gap-2.5 sm:gap-4">
        {hasUnsavedChanges && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-950/70 border border-amber-800/80 text-amber-300 text-xs font-medium animate-pulse">
            <AlertTriangle size={13} />
            <span>Unsaved Edits</span>
          </div>
        )}

        <button
          onClick={onViewWebsite}
          type="button"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1e1733] hover:bg-[#2a2046] border border-[#342754] text-xs font-medium text-[#d3c7ea] hover:text-white transition-all cursor-pointer shadow-sm"
          title="Return to the live public portfolio"
        >
          <Globe size={14} className="text-[#a855f7]" />
          <span>View Live Website</span>
          <ExternalLink size={12} className="opacity-60" />
        </button>

        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-lg bg-[#161126] border border-[#271f3d] text-xs text-[#a99abb]">
          <ShieldCheck size={14} className="text-[#a855f7]" />
          <span className="max-w-[160px] truncate">{adminEmail}</span>
        </div>

        <button
          onClick={onLogout}
          type="button"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/50 border border-red-800/50 text-xs font-medium text-red-300 hover:text-red-200 transition-all cursor-pointer"
          title="Log out and clear session"
        >
          <LogOut size={13} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};
