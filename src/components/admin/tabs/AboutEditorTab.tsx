import React, { useState } from "react";
import { User, Save, RotateCcw, Plus, Trash2 } from "lucide-react";
import { WebsiteContent, AboutStatItem } from "../../../types/cms";

interface AboutEditorTabProps {
  content: WebsiteContent;
  onSave: (updated: WebsiteContent) => Promise<void>;
}

export const AboutEditorTab: React.FC<AboutEditorTabProps> = ({ content, onSave }) => {
  const [about, setAbout] = useState(content.about);
  const [newBadge, setNewBadge] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleAddBadge = () => {
    if (!newBadge.trim()) return;
    setAbout((prev) => ({
      ...prev,
      badges: [...prev.badges, newBadge.trim()],
    }));
    setNewBadge("");
  };

  const handleRemoveBadge = (index: number) => {
    setAbout((prev) => ({
      ...prev,
      badges: prev.badges.filter((_, i) => i !== index),
    }));
  };

  const handleStatChange = (index: number, field: keyof AboutStatItem, value: string) => {
    const updatedStats = [...about.stats];
    updatedStats[index] = { ...updatedStats[index], [field]: value };
    setAbout({ ...about, stats: updatedStats });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await onSave({
      ...content,
      about,
    });
    setIsSaving(false);
  };

  const handleReset = () => {
    setAbout(content.about);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#241c38]">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <User size={20} className="text-[#a855f7]" />
            <span>About Me Section</span>
          </h2>
          <p className="text-xs text-[#9d8bb8] mt-1">
            Update your biography, personal pitch, expertise badges, and metric highlights.
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
            <span>{isSaving ? "Saving..." : "Save About Changes"}</span>
          </button>
        </div>
      </div>

      {/* Section Title & Lead */}
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-[#c2a4ff] mb-1.5 uppercase tracking-wider">
            Section Heading
          </label>
          <input
            type="text"
            value={about.title}
            onChange={(e) => setAbout({ ...about, title: e.target.value })}
            placeholder="About Me"
            className="w-full bg-[#110d1f] border border-[#2e254a] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#a855f7] transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-[#c2a4ff] mb-1.5 uppercase tracking-wider">
            Lead Headline Statement
          </label>
          <textarea
            value={about.leadParagraph}
            onChange={(e) => setAbout({ ...about, leadParagraph: e.target.value })}
            rows={2}
            placeholder="I design, develop, and edit experiences that people remember."
            className="w-full bg-[#110d1f] border border-[#2e254a] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#a855f7] transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-[#c2a4ff] mb-1.5 uppercase tracking-wider">
            Body Narrative (Paragraph 1)
          </label>
          <textarea
            value={about.subParagraph1}
            onChange={(e) => setAbout({ ...about, subParagraph1: e.target.value })}
            rows={3}
            className="w-full bg-[#110d1f] border border-[#2e254a] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#a855f7] transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-[#c2a4ff] mb-1.5 uppercase tracking-wider">
            Body Narrative (Paragraph 2)
          </label>
          <textarea
            value={about.subParagraph2}
            onChange={(e) => setAbout({ ...about, subParagraph2: e.target.value })}
            rows={3}
            className="w-full bg-[#110d1f] border border-[#2e254a] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#a855f7] transition-all"
          />
        </div>

        {/* Badges */}
        <div>
          <label className="block text-xs font-medium text-[#c2a4ff] mb-1.5 uppercase tracking-wider">
            Expertise Badges
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            {about.badges.map((badge, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#221a3a] border border-[#392b5e] text-xs font-medium text-[#e1d7f5]"
              >
                <span>{badge}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveBadge(idx)}
                  className="text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                >
                  <Trash2 size={12} />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newBadge}
              onChange={(e) => setNewBadge(e.target.value)}
              placeholder="e.g. Next.js Architecture"
              className="flex-1 bg-[#110d1f] border border-[#2e254a] rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-[#a855f7] transition-all"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddBadge();
                }
              }}
            />
            <button
              type="button"
              onClick={handleAddBadge}
              className="flex items-center gap-1 px-3 py-2 rounded-xl bg-[#2b2149] hover:bg-[#3a2d61] text-xs font-medium text-white cursor-pointer"
            >
              <Plus size={14} />
              <span>Add Badge</span>
            </button>
          </div>
        </div>

        {/* Stat Metric Cards */}
        <div className="pt-2">
          <label className="block text-xs font-medium text-[#c2a4ff] mb-3 uppercase tracking-wider">
            Highlights & Key Metrics (4 Display Cards)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {about.stats.map((stat, idx) => (
              <div
                key={stat.id || idx}
                className="p-3.5 bg-[#140f24] border border-[#271e3f] rounded-xl space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-[#8f7ca8]">Card #{idx + 1}</span>
                  <select
                    value={stat.glow}
                    onChange={(e) => handleStatChange(idx, "glow", e.target.value)}
                    className="bg-[#0e0a17] border border-[#2a2143] rounded-md px-2 py-0.5 text-[11px] text-[#baa9d2]"
                  >
                    <option value="amber">Amber Glow</option>
                    <option value="cyan">Cyan Glow</option>
                    <option value="purple">Purple Glow</option>
                    <option value="green">Green Glow</option>
                  </select>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-1">
                    <label className="block text-[10px] text-[#75648d] mb-1">Value</label>
                    <input
                      type="text"
                      value={stat.number}
                      onChange={(e) => handleStatChange(idx, "number", e.target.value)}
                      placeholder="2+"
                      className="w-full bg-[#0d0a17] border border-[#2b2245] rounded-lg px-2.5 py-1.5 text-xs text-white font-bold"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] text-[#75648d] mb-1">Label</label>
                    <input
                      type="text"
                      value={stat.label}
                      onChange={(e) => handleStatChange(idx, "label", e.target.value)}
                      placeholder="Years of Experience"
                      className="w-full bg-[#0d0a17] border border-[#2b2245] rounded-lg px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </form>
  );
};
