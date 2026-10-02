import React, { useState } from "react";
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowLeft,
  Loader2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { cmsApi } from "../../services/cmsApi";

interface AdminLoginProps {
  onLoginSuccess: () => void;
  onBackToSite: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({
  onLoginSuccess,
  onBackToSite,
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!email.trim()) {
      setErrorMessage("Please enter your administrator email.");
      return;
    }
    if (password.length < 12) {
      setErrorMessage("Administrator passwords must be at least 12 characters long.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await cmsApi.login(password, email.trim());
      if (res.success) {
        onLoginSuccess();
      } else {
        setErrorMessage(
          res.error || "Invalid credentials. Please verify your password.",
        );
      }
    } catch {
      setErrorMessage(
        "Unable to connect to authentication server. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0d0a14] text-[#ece8f5] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background Ambience Glow */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#7c3aed]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#06b6d4]/15 rounded-full blur-3xl pointer-events-none" />

      {/* Main Login Card */}
      <div className="w-full max-w-md bg-[#161224]/90 border border-[#2a2244] rounded-2xl p-8 backdrop-blur-xl shadow-2xl relative z-10">
        {/* Back to site button */}
        <button
          onClick={onBackToSite}
          type="button"
          className="flex items-center gap-2 text-xs text-[#9d8bb8] hover:text-[#c2a4ff] transition-colors mb-6 cursor-pointer"
        >
          <ArrowLeft size={14} />
          <span>Back to Live Portfolio</span>
        </button>

        {/* Branding header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-tr from-[#7c3aed] to-[#a855f7] flex items-center justify-center shadow-lg shadow-[#7c3aed]/30 border border-[#c2a4ff]/30">
            <ShieldCheck size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center justify-center gap-2">
            <span>Admin Console</span>
            <Sparkles size={16} className="text-[#a855f7]" />
          </h1>
          <p className="text-xs text-[#9d8bb8] mt-1.5">
            Authenticate with your secure administrator credentials to manage
            website content and media.
          </p>
        </div>

        {/* Error Banner */}
        {errorMessage && (
          <div className="mb-6 p-3.5 bg-red-950/50 border border-red-800/60 rounded-xl flex items-start gap-3 text-red-200 text-xs animate-shake">
            <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#c2a4ff] mb-1.5 uppercase tracking-wider">
              Admin Email
            </label>
            <div className="relative">
              <Mail
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#71618a]"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                required
                disabled={isLoading}
                className="w-full bg-[#0f0b1a] border border-[#2e264b] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-[#5a4e72] focus:outline-none focus:border-[#a855f7] focus:ring-1 focus:ring-[#a855f7] transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#c2a4ff] mb-1.5 uppercase tracking-wider">
              Password <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <Lock
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#71618a]"
              />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                disabled={isLoading}
                className="w-full bg-[#0f0b1a] border border-[#2e264b] rounded-xl pl-10 pr-11 py-2.5 text-sm text-white placeholder-[#5a4e72] focus:outline-none focus:border-[#a855f7] focus:ring-1 focus:ring-[#a855f7] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#71618a] hover:text-[#c2a4ff] transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 bg-gradient-to-r from-[#7c3aed] to-[#9333ea] hover:from-[#6d28d9] hover:to-[#7e22ce] text-white font-medium py-2.5 px-4 rounded-xl text-sm transition-all shadow-lg shadow-[#7c3aed]/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Verifying Credentials...</span>
              </>
            ) : (
              <>
                <Lock size={15} />
                <span>Sign In to Admin Panel</span>
              </>
            )}
          </button>
        </form>

        {/* Security notice footer */}
        <div className="mt-8 pt-6 border-t border-[#231b3b] text-center">
          <p className="text-[11px] text-[#6e5f88] leading-relaxed">
            Protected with salted cryptographic scrypt hashing, rate-limiting
            brute force protection, and persistent sessions.
          </p>
        </div>
      </div>
    </div>
  );
};
