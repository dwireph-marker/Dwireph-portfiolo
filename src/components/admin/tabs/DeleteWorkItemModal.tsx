import React from "react";
import { Trash2, X, AlertTriangle, Loader2 } from "lucide-react";

interface DeleteWorkItemModalProps {
  title: string;
  itemType: "project" | "video" | "item";
  isDeleting: boolean;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

export const DeleteWorkItemModal: React.FC<DeleteWorkItemModalProps> = ({
  title,
  itemType,
  isDeleting,
  onConfirm,
  onCancel,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#140f25] border border-red-900/50 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between text-red-400">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                Delete {itemType === "video" ? "Edited Video" : "Project"}
              </h3>
              <p className="text-xs text-[#9d8bb8]">This action cannot be undone.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="p-1.5 rounded-lg bg-[#201838] text-[#9d8ab8] hover:text-white cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>

        <p className="text-xs text-white/80 leading-relaxed bg-[#0e0a1a] p-3 rounded-xl border border-[#2b2148]">
          Are you sure you want to permanently delete{" "}
          <span className="font-semibold text-white">"{title}"</span>?
        </p>

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="px-3.5 py-2 rounded-xl bg-[#201838] hover:bg-[#2e2250] text-xs font-medium text-[#baa9d2] transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-semibold text-white transition cursor-pointer disabled:opacity-50 shadow-lg shadow-red-600/25"
          >
            {isDeleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
            <span>{isDeleting ? "Deleting..." : "Delete Permanently"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
