import React, { useState } from "react";
import { Mail, Save, RotateCcw, Phone } from "lucide-react";
import { WebsiteContent } from "../../../types/cms";

interface ContactEditorTabProps {
  content: WebsiteContent;
  onSave: (updated: WebsiteContent) => Promise<void>;
}

export const ContactEditorTab: React.FC<ContactEditorTabProps> = ({ content, onSave }) => {
  const [contact, setContact] = useState(content.contact);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await onSave({
      ...content,
      contact,
    });
    setIsSaving(false);
  };

  const handleReset = () => {
    setContact(content.contact);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#241c38]">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Mail size={20} className="text-[#a855f7]" />
            <span>Contact Details & Footer Credits</span>
          </h2>
          <p className="text-xs text-[#9d8bb8] mt-1">
            Update your communication channels, direct inquiries email, phone number, and footer copyright text.
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
            <span>{isSaving ? "Saving..." : "Save Contact Changes"}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-medium text-[#c2a4ff] mb-1.5 uppercase tracking-wider">
            Contact Heading
          </label>
          <input
            type="text"
            value={contact.title}
            onChange={(e) => setContact({ ...contact, title: e.target.value })}
            placeholder="Get in Touch"
            className="w-full bg-[#110d1f] border border-[#2e254a] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#a855f7] transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-[#c2a4ff] mb-1.5 uppercase tracking-wider">
            Subtitle / Callout
          </label>
          <input
            type="text"
            value={contact.subtitle}
            onChange={(e) => setContact({ ...contact, subtitle: e.target.value })}
            placeholder="Have a project or opportunity? Let's build something epic together!"
            className="w-full bg-[#110d1f] border border-[#2e254a] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#a855f7] transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-[#c2a4ff] mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
            <Mail size={13} className="text-[#a855f7]" />
            <span>Direct Email Address</span>
          </label>
          <input
            type="email"
            value={contact.directEmail}
            onChange={(e) => setContact({ ...contact, directEmail: e.target.value })}
            placeholder="dwireph3@gmail.com"
            className="w-full bg-[#110d1f] border border-[#2e254a] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#a855f7] transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-[#c2a4ff] mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
            <Phone size={13} className="text-[#a855f7]" />
            <span>Direct Phone / WhatsApp</span>
          </label>
          <input
            type="text"
            value={contact.directPhone}
            onChange={(e) => setContact({ ...contact, directPhone: e.target.value })}
            placeholder="+91 91229 49352"
            className="w-full bg-[#110d1f] border border-[#2e254a] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#a855f7] transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-[#c2a4ff] mb-1.5 uppercase tracking-wider">
            Designer / Developer Credits
          </label>
          <input
            type="text"
            value={contact.designerCredit}
            onChange={(e) => setContact({ ...contact, designerCredit: e.target.value })}
            placeholder="Designed & Developed by Dwireph Kumar"
            className="w-full bg-[#110d1f] border border-[#2e254a] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#a855f7] transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-[#c2a4ff] mb-1.5 uppercase tracking-wider">
            Copyright Line
          </label>
          <input
            type="text"
            value={contact.copyright}
            onChange={(e) => setContact({ ...contact, copyright: e.target.value })}
            placeholder="2026 • All Rights Reserved"
            className="w-full bg-[#110d1f] border border-[#2e254a] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#a855f7] transition-all"
          />
        </div>
      </div>
    </form>
  );
};
