import { ShieldCheck } from "lucide-react";
import { useLoading } from "../context/LoadingContext";

const FloatingAdminTrigger = () => {
  const { setView } = useLoading();

  return (
    <div
      className="fixed bottom-6 right-6 z-[999999] select-none pointer-events-auto"
      id="floating-admin-trigger-container"
    >
      <button
        onClick={() => setView("admin")}
        data-cursor="disable"
        className="group relative flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-[#1b0d36]/95 via-[#291350]/95 to-[#1b0d36]/95 hover:from-[#2e155c] hover:to-[#3b1b75] border border-[#a855f7]/70 hover:border-[#c084fc] text-white shadow-[0_4px_25px_rgba(168,85,247,0.45)] backdrop-blur-md transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
        id="floating-admin-btn"
        title="Open Admin Panel (Ctrl+Shift+A)"
        aria-label="Open Admin Panel"
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 shadow-[0_0_8px_#10b981]"></span>
        </span>
        <ShieldCheck size={16} className="text-[#d8b4fe] group-hover:text-white transition-colors" />
        <span className="text-xs font-bold tracking-wide text-white group-hover:text-[#f3e8ff] transition-colors">
          Admin Panel
        </span>
        <span className="hidden sm:inline-block text-[9px] font-mono font-medium px-1.5 py-0.5 rounded-md bg-[#3b1b75]/80 text-[#d8b4fe] border border-[#a855f7]/30 ml-0.5">
          Ctrl+Shift+A
        </span>
      </button>
    </div>
  );
};

export default FloatingAdminTrigger;
