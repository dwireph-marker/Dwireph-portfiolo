import React, { useState } from "react";
import { Settings, Save, RotateCcw, Image as ImageIcon, Search, Globe } from "lucide-react";
import { WebsiteSettings } from "../../../types/cms";

interface SettingsTabProps {
  settings: WebsiteSettings;
  onSave: (updated: WebsiteSettings) => Promise<void>;
  onOpenMediaPicker?: (onSelect: (url: string) => void) => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  settings,
  onSave,
  onOpenMediaPicker,
}) => {
  const [formData, setFormData] = useState(settings);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await onSave(formData);
    setIsSaving(false);
  };

  const handleReset = () => {
    setFormData(settings);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#241c38]">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Settings size={20} className="text-[#a855f7]" />
            <span>SEO & Website Settings</span>
          </h2>
          <p className="text-xs text-[#9d8bb8] mt-1">
            Configure page metadata, social sharing cards (OpenGraph), search engine indexing, and brand keywords.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleReset}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1f1933] hover:bg-[#2c2349] text-xs font-medium text-[#baa9d2] transition-colors cursor-pointer"
          >
            <RotateCcw size={13} />
            <span>Reset</span>
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#9333ea] hover:from-[#6d28d9] hover:to-[#7e22ce] text-xs font-semibold text-white shadow-lg shadow-[#7c3aed]/25 transition-all cursor-pointer disabled:opacity-50"
          >
            <Save size={14} />
            <span>{isSaving ? "Saving..." : "Save Settings"}</span>
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-[#c2a4ff] mb-1.5 uppercase tracking-wider">
            Browser Window & Tab Title (SEO &lt;title&gt;)
          </label>
          <input
            type="text"
            value={formData.siteTitle}
            onChange={(e) => setFormData({ ...formData, siteTitle: e.target.value })}
            className="w-full bg-[#110d1f] border border-[#2e254a] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#a855f7] transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-[#c2a4ff] mb-1.5 uppercase tracking-wider">
            Meta Search Description (&lt;meta name=&quot;description&quot;&gt;)
          </label>
          <textarea
            value={formData.siteDescription}
            onChange={(e) => setFormData({ ...formData, siteDescription: e.target.value })}
            rows={2}
            className="w-full bg-[#110d1f] border border-[#2e254a] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#a855f7] transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-[#c2a4ff] mb-1.5 uppercase tracking-wider">
            Meta Keywords
          </label>
          <input
            type="text"
            value={formData.keywords}
            onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
            placeholder="React, Three.js, GSAP, Video Editing, Portfolio"
            className="w-full bg-[#110d1f] border border-[#2e254a] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#a855f7] transition-all"
          />
        </div>

        <div className="pt-2">
          <label className="block text-xs font-medium text-[#c2a4ff] mb-1.5 uppercase tracking-wider">
            Social Share Image URL (og:image)
          </label>
          <div className="flex gap-2.5">
            <input
              type="text"
              value={formData.ogImage}
              onChange={(e) => setFormData({ ...formData, ogImage: e.target.value })}
              className="flex-1 bg-[#110d1f] border border-[#2e254a] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#a855f7] transition-all"
            />
            {onOpenMediaPicker && (
              <button
                type="button"
                onClick={() =>
                  onOpenMediaPicker((url) => setFormData((prev) => ({ ...prev, ogImage: url })))
                }
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#231b3b] hover:bg-[#322654] border border-[#3e3067] text-xs text-[#c2a4ff] cursor-pointer"
              >
                <ImageIcon size={14} />
                <span>Select Media</span>
              </button>
            )}
          </div>
        </div>

        {/* Live Search Snippet Preview */}
        <div className="pt-4">
          <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-[#8f7ca8] uppercase tracking-wider">
            <Search size={13} className="text-[#a855f7]" />
            <span>Search Result & Link Preview</span>
          </div>
          <div className="p-4 bg-[#0a0712] border border-[#261e38] rounded-xl space-y-1">
            <div className="flex items-center gap-2 text-[11px] text-[#6bbcfc]">
              <Globe size={12} />
              <span>https://yourportfolio.domain</span>
            </div>
            <div className="text-sm font-medium text-[#8ab4f8] hover:underline cursor-pointer">
              {formData.siteTitle || "Portfolio Title"}
            </div>
            <div className="text-xs text-[#9aa0a6] line-clamp-2">
              {formData.siteDescription || "Website description snippet displayed in search engines."}
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};
