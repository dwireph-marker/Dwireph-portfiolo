import React, { useState } from "react";
import { Share2, Save, RotateCcw, Plus, Trash2, ArrowUp, ArrowDown, ExternalLink } from "lucide-react";
import { WebsiteContent, SocialLinkItem } from "../../../types/cms";

interface SocialLinksTabProps {
  content: WebsiteContent;
  onSave: (updated: WebsiteContent) => Promise<void>;
}

export const SocialLinksTab: React.FC<SocialLinksTabProps> = ({ content, onSave }) => {
  const [socialLinks, setSocialLinks] = useState<SocialLinkItem[]>(content.socialLinks);
  const [isSaving, setIsSaving] = useState(false);

  const handleAddSocial = () => {
    const newSocial: SocialLinkItem = {
      id: `soc-${Date.now()}`,
      platform: "YouTube",
      url: "https://youtube.com",
      label: "YouTube",
      icon: "other",
      enabled: true,
      order: socialLinks.length + 1,
    };
    setSocialLinks([...socialLinks, newSocial]);
  };

  const handleDelete = (id: string) => {
    setSocialLinks(socialLinks.filter((s) => s.id !== id));
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    const list = [...socialLinks];
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= list.length) return;
    const temp = list[index];
    list[index] = list[target];
    list[target] = temp;
    list.forEach((item, idx) => (item.order = idx + 1));
    setSocialLinks(list);
  };

  const handleUpdate = (
    id: string,
    field: keyof SocialLinkItem,
    value: string | boolean | number
  ) => {
    setSocialLinks(socialLinks.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await onSave({
      ...content,
      socialLinks,
    });
    setIsSaving(false);
  };

  const handleReset = () => {
    setSocialLinks(content.socialLinks);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#241c38]">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Share2 size={20} className="text-[#a855f7]" />
            <span>Social Links & Digital Footprint</span>
          </h2>
          <p className="text-xs text-[#9d8bb8] mt-1">
            Manage your external profile URLs displayed in the floating social bar and contact section.
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
            <span>{isSaving ? "Saving..." : "Save Social Links"}</span>
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[#c2a4ff] uppercase tracking-wider">
            Connected Profiles ({socialLinks.length})
          </span>
          <button
            type="button"
            onClick={handleAddSocial}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#271d42] hover:bg-[#352759] text-xs text-[#d5c7ee] transition-colors cursor-pointer"
          >
            <Plus size={13} />
            <span>Add Social Profile</span>
          </button>
        </div>

        {socialLinks.map((item, index) => (
          <div
            key={item.id}
            className="p-4 bg-[#140f24] border border-[#281f42] rounded-2xl space-y-3"
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#211838]">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-[#8d79ad]">#{index + 1}</span>
                <span className="text-sm font-semibold text-white">{item.platform}</span>
                <label className="flex items-center gap-1.5 text-xs text-[#a99bbd] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={item.enabled}
                    onChange={(e) => handleUpdate(item.id, "enabled", e.target.checked)}
                    className="rounded accent-[#a855f7]"
                  />
                  <span>Active on site</span>
                </label>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleMove(index, "up")}
                  disabled={index === 0}
                  className="p-1 rounded bg-[#1e1733] text-[#9b89b4] hover:text-white disabled:opacity-30 cursor-pointer"
                >
                  <ArrowUp size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => handleMove(index, "down")}
                  disabled={index === socialLinks.length - 1}
                  className="p-1 rounded bg-[#1e1733] text-[#9b89b4] hover:text-white disabled:opacity-30 cursor-pointer"
                >
                  <ArrowDown size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  className="p-1 rounded bg-red-950/40 text-red-400 hover:text-red-300 ml-1 cursor-pointer"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-[#9d8bb8] mb-1">Platform Name</label>
                <input
                  type="text"
                  value={item.platform}
                  onChange={(e) => handleUpdate(item.id, "platform", e.target.value)}
                  className="w-full bg-[#0e0a19] border border-[#2b2148] rounded-lg px-2.5 py-1.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] text-[#9d8bb8] mb-1">Icon Style</label>
                <select
                  value={item.icon}
                  onChange={(e) => handleUpdate(item.id, "icon", e.target.value)}
                  className="w-full bg-[#0e0a19] border border-[#2b2148] rounded-lg px-2.5 py-1.5 text-xs text-white"
                >
                  <option value="github">GitHub</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="twitter">Twitter / X</option>
                  <option value="instagram">Instagram</option>
                  <option value="other">External Link / Globe</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-[#9d8bb8] mb-1 flex items-center justify-between">
                  <span>Profile URL</span>
                  {item.url && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#a855f7] hover:underline flex items-center gap-0.5 text-[10px]"
                    >
                      <span>Open</span>
                      <ExternalLink size={10} />
                    </a>
                  )}
                </label>
                <input
                  type="url"
                  value={item.url}
                  onChange={(e) => handleUpdate(item.id, "url", e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-[#0e0a19] border border-[#2b2148] rounded-lg px-2.5 py-1.5 text-xs text-white"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </form>
  );
};
