import React, { useState } from "react";
import { KeyRound, Lock, CheckCircle2, AlertCircle, ShieldCheck } from "lucide-react";
import { cmsApi } from "../../../services/cmsApi";

interface AccountTabProps {
  adminEmail: string;
}

export const AccountTab: React.FC<AccountTabProps> = ({ adminEmail }) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);

    if (newPassword.length < 12) {
      setStatus({ type: "error", message: "New password must be at least 12 characters long." });
      return;
    }

    if (newPassword !== confirmPassword) {
      setStatus({ type: "error", message: "New passwords do not match. Please verify." });
      return;
    }

    setIsUpdating(true);
    try {
      const res = await cmsApi.changePassword(currentPassword, newPassword);
      if (res.success) {
        setStatus({ type: "success", message: "Password successfully updated! Your new session is active." });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setStatus({ type: "error", message: res.error || "Failed to update password." });
      }
    } catch {
      setStatus({ type: "error", message: "Network error updating password." });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="pb-4 border-b border-[#241c38]">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <KeyRound size={20} className="text-[#a855f7]" />
          <span>Admin Account & Security</span>
        </h2>
        <p className="text-xs text-[#9d8bb8] mt-1">
          Manage your master administrator password and review active account details.
        </p>
      </div>

      {/* Account Info Card */}
      <div className="p-4 bg-[#140f24] border border-[#271e40] rounded-2xl flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#261c44] flex items-center justify-center text-[#c2a4ff]">
            <ShieldCheck size={20} />
          </div>
          <div>
            <span className="text-xs text-[#8f7ca8] block">Administrator Identity</span>
            <span className="text-sm font-semibold text-white">{adminEmail}</span>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#271c46] text-[#c2a4ff]">
          Primary Root Admin
        </span>
      </div>

      {/* Status banner */}
      {status && (
        <div
          className={`p-3.5 rounded-xl text-xs flex items-center gap-2.5 ${
            status.type === "success"
              ? "bg-emerald-950/70 border border-emerald-800 text-emerald-300"
              : "bg-red-950/70 border border-red-800 text-red-300"
          }`}
        >
          {status.type === "success" ? (
            <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle size={16} className="text-red-400 shrink-0" />
          )}
          <span>{status.message}</span>
        </div>
      )}

      {/* Change Password Form */}
      <form onSubmit={handleSubmit} className="p-6 bg-[#140f24] border border-[#271e40] rounded-2xl space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">
          Change Administrator Password
        </h3>

        <div>
          <label className="block text-xs font-medium text-[#c2a4ff] mb-1.5 uppercase tracking-wider">
            Current Password
          </label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            className="w-full bg-[#0e0a19] border border-[#2b2148] rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-[#a855f7]"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-[#c2a4ff] mb-1.5 uppercase tracking-wider">
            New Password (Min. 12 characters)
          </label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={12}
            className="w-full bg-[#0e0a19] border border-[#2b2148] rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-[#a855f7]"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-[#c2a4ff] mb-1.5 uppercase tracking-wider">
            Confirm New Password
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={12}
            className="w-full bg-[#0e0a19] border border-[#2b2148] rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-[#a855f7]"
          />
        </div>

        <button
          type="submit"
          disabled={isUpdating}
          className="w-full mt-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#9333ea] hover:from-[#6d28d9] hover:to-[#7e22ce] text-xs font-semibold text-white transition-all shadow-lg shadow-[#7c3aed]/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <Lock size={14} />
          <span>{isUpdating ? "Updating Password..." : "Update Master Password"}</span>
        </button>
      </form>
    </div>
  );
};
