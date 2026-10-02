import React, { useState } from "react";
import { Compass, Save, RotateCcw, Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { WebsiteSettings, NavLinkItem } from "../../../types/cms";

interface NavigationEditorTabProps {
  settings: WebsiteSettings;
  onSave: (updated: WebsiteSettings) => Promise<void>;
}

export const NavigationEditorTab: React.FC<NavigationEditorTabProps> = ({ settings, onSave }) => {
  const [navbar, setNavbar] = useState(settings.navbar);
  const [isSaving, setIsSaving] = useState(false);

  const handleAddLink = () => {
    const newLink: NavLinkItem = {
      id: `nav-${Date.now()}`,
      label: "New Page",
      href: "#new",
      visible: true,
      order: navbar.navLinks.length + 1,
    };
    setNavbar({ ...navbar, navLinks: [...navbar.navLinks, newLink] });
  };

  const handleDeleteLink = (id: string) => {
    setNavbar({ ...navbar, navLinks: navbar.navLinks.filter((l) => l.id !== id) });
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    const list = [...navbar.navLinks];
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= list.length) return;
    const temp = list[index];
    list[index] = list[target];
    list[target] = temp;
    list.forEach((item, idx) => (item.order = idx + 1));
    setNavbar({ ...navbar, navLinks: list });
  };

  const handleUpdateLink = (
    id: string,
    field: keyof NavLinkItem,
    value: string | boolean | number
  ) => {
    setNavbar({
      ...navbar,
      navLinks: navbar.navLinks.map((l) => (l.id === id ? { ...l, [field]: value } : l)),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await onSave({
      ...settings,
      navbar,
    });
    setIsSaving(false);
  };

  const handleReset = () => {
    setNavbar(settings.navbar);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#241c38]">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Compass size={20} className="text-[#a855f7]" />
            <span>Navigation Bar Controls</span>
          </h2>
          <p className="text-xs text-[#9d8bb8] mt-1">
            Customize header branding, live status tags, nav items, and the main call-to-action button.
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
            <span>{isSaving ? "Saving..." : "Save Navigation"}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-medium text-[#c2a4ff] mb-1.5 uppercase tracking-wider">
            Brand Name
          </label>
          <input
            type="text"
            value={navbar.brandName}
            onChange={(e) => setNavbar({ ...navbar, brandName: e.target.value })}
            className="w-full bg-[#110d1f] border border-[#2e254a] rounded-xl px-3 py-2 text-sm text-white"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-[#c2a4ff] mb-1.5 uppercase tracking-wider">
            Status Indicator Text
          </label>
          <input
            type="text"
            value={navbar.brandStatus}
            onChange={(e) => setNavbar({ ...navbar, brandStatus: e.target.value })}
            placeholder="SCENE ON"
            className="w-full bg-[#110d1f] border border-[#2e254a] rounded-xl px-3 py-2 text-sm text-white"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-[#c2a4ff] mb-1.5 uppercase tracking-wider">
            Version Tag
          </label>
          <input
            type="text"
            value={navbar.brandVersion}
            onChange={(e) => setNavbar({ ...navbar, brandVersion: e.target.value })}
            placeholder="</> React v19"
            className="w-full bg-[#110d1f] border border-[#2e254a] rounded-xl px-3 py-2 text-sm text-white"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        <div>
          <label className="block text-xs font-medium text-[#c2a4ff] mb-1.5 uppercase tracking-wider">
            Header CTA Button Label
          </label>
          <input
            type="text"
            value={navbar.hireButtonText}
            onChange={(e) => setNavbar({ ...navbar, hireButtonText: e.target.value })}
            placeholder="Hire Me"
            className="w-full bg-[#110d1f] border border-[#2e254a] rounded-xl px-3 py-2 text-sm text-white"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-[#c2a4ff] mb-1.5 uppercase tracking-wider">
            Header CTA Button Target
          </label>
          <input
            type="text"
            value={navbar.hireButtonLink}
            onChange={(e) => setNavbar({ ...navbar, hireButtonLink: e.target.value })}
            placeholder="#contact"
            className="w-full bg-[#110d1f] border border-[#2e254a] rounded-xl px-3 py-2 text-sm text-white"
          />
        </div>
      </div>

      {/* Nav links */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[#c2a4ff] uppercase tracking-wider">
            Navigation Menu Links ({navbar.navLinks.length})
          </span>
          <button
            type="button"
            onClick={handleAddLink}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#271d42] hover:bg-[#352759] text-xs text-[#d5c7ee] transition-colors cursor-pointer"
          >
            <Plus size={13} />
            <span>Add Nav Link</span>
          </button>
        </div>

        {navbar.navLinks.map((link, index) => (
          <div
            key={link.id}
            className="p-3 bg-[#140f24] border border-[#281f42] rounded-xl flex flex-wrap items-center gap-3 justify-between"
          >
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#8d79ad]">#{index + 1}</span>
              <input
                type="text"
                value={link.label}
                onChange={(e) => handleUpdateLink(link.id, "label", e.target.value)}
                placeholder="Label"
                className="bg-[#0e0a19] border border-[#2b2148] rounded-lg px-2.5 py-1 text-xs text-white w-28"
              />
              <input
                type="text"
                value={link.href}
                onChange={(e) => handleUpdateLink(link.id, "href", e.target.value)}
                placeholder="#target"
                className="bg-[#0e0a19] border border-[#2b2148] rounded-lg px-2.5 py-1 text-xs text-white w-36"
              />
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 text-xs text-[#a99bbd] cursor-pointer">
                <input
                  type="checkbox"
                  checked={link.visible}
                  onChange={(e) => handleUpdateLink(link.id, "visible", e.target.checked)}
                  className="rounded accent-[#a855f7]"
                />
                <span>Visible</span>
              </label>

              <div className="flex items-center gap-1">
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
                  disabled={index === navbar.navLinks.length - 1}
                  className="p-1 rounded bg-[#1e1733] text-[#9b89b4] hover:text-white disabled:opacity-30 cursor-pointer"
                >
                  <ArrowDown size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteLink(link.id)}
                  className="p-1 rounded bg-red-950/40 text-red-400 hover:text-red-300 ml-1 cursor-pointer"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </form>
  );
};
