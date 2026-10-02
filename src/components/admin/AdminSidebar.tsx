import React from "react";
import { NavLink } from "react-router-dom";
import {
  Sparkles,
  User,
  Briefcase,
  Layers,
  FolderKanban,
  Film,
  Mail,
  Share2,
  Image,
  Compass,
  Settings,
  Database,
  KeyRound,
  Inbox,
  ChevronRight,
} from "lucide-react";

export type AdminTabId =
  | "hero"
  | "about"
  | "whatido"
  | "projects"
  | "videos"
  | "career"
  | "contact"
  | "social"
  | "media"
  | "messages"
  | "navigation"
  | "seo"
  | "backup"
  | "account";

interface AdminSidebarProps {
  activeTab: AdminTabId;
  unreadMessagesCount: number;
}

interface NavItem {
  id: AdminTabId;
  path: string;
  label: string;
  icon: React.ElementType;
  badge?: number | string;
  category: "content" | "system";
}

const navItems: NavItem[] = [
  // Website Content
  { id: "hero", path: "hero", label: "Home / Hero", icon: Sparkles, category: "content" },
  { id: "about", path: "about", label: "About Me", icon: User, category: "content" },
  { id: "whatido", path: "skills-services", label: "Skills / Services", icon: Layers, category: "content" },
  { id: "projects", path: "projects", label: "My Projects", icon: FolderKanban, category: "content" },
  { id: "videos", path: "edited-videos", label: "My Edited Videos", icon: Film, category: "content" },
  { id: "career", path: "experience", label: "Experience", icon: Briefcase, category: "content" },
  { id: "contact", path: "contact", label: "Contact Info", icon: Mail, category: "content" },
  { id: "social", path: "social-links", label: "Social Links", icon: Share2, category: "content" },

  // System & Management
  { id: "media", path: "media-library", label: "Media Library", icon: Image, category: "system" },
  { id: "messages", path: "messages", label: "Messages / Inbox", icon: Inbox, category: "system" },
  { id: "navigation", path: "navigation", label: "Navigation Bar", icon: Compass, category: "system" },
  { id: "seo", path: "seo-settings", label: "SEO & Settings", icon: Settings, category: "system" },
  { id: "backup", path: "backup-logs", label: "Backup & Logs", icon: Database, category: "system" },
  { id: "account", path: "security", label: "Security & Pass", icon: KeyRound, category: "system" },
];

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  unreadMessagesCount,
}) => {
  const contentItems = navItems.filter((i) => i.category === "content");
  const systemItems = navItems.filter((i) => i.category === "system");

  return (
    <>
      {/* Mobile/Tablet Horizontal Scrollable Tab Bar (hidden on desktop) */}
      <div className="lg:hidden w-full bg-[#130f21] border-b border-[#241c38] px-3 py-2.5 overflow-x-auto flex items-center gap-1.5 shrink-0 z-30">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const isMessages = item.id === "messages";
          return (
            <NavLink
              key={item.id}
              to={item.path}
              end
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                isActive
                  ? "bg-[#7c3aed] text-white shadow-md shadow-[#7c3aed]/30 font-semibold"
                  : "bg-[#181329] text-[#a595bc] hover:bg-[#221a38] hover:text-white"
              }`}
            >
              <Icon size={14} className={isActive ? "text-white" : "text-[#8d7aab]"} />
              <span>{item.label}</span>
              {isMessages && unreadMessagesCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-pink-500 text-white animate-pulse">
                  {unreadMessagesCount}
                </span>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Desktop Vertical Sidebar (hidden on mobile/tablet) */}
      <aside className="hidden lg:flex w-64 bg-[#130f21] border-r border-[#241c38] p-4 flex-col shrink-0">
        {/* Navigation Groups */}
        <div className="space-y-6">
          {/* Content Group */}
          <div>
            <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-[#796992]">
              Website Content
            </div>
            <nav className="space-y-1">
              {contentItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <NavLink
                    key={item.id}
                    to={item.path}
                    end
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                      isActive
                        ? "bg-[#7c3aed] text-white shadow-md shadow-[#7c3aed]/25 font-semibold"
                        : "text-[#aa9abf] hover:bg-[#1f1833] hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon size={16} className={isActive ? "text-white" : "text-[#8d7aab]"} />
                      <span>{item.label}</span>
                    </div>
                    {isActive && <ChevronRight size={14} className="opacity-75" />}
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* System & Operations Group */}
          <div>
            <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-[#796992]">
              Media & Operations
            </div>
            <nav className="space-y-1">
              {systemItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                const isMessages = item.id === "messages";
                return (
                  <NavLink
                    key={item.id}
                    to={item.path}
                    end
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                      isActive
                        ? "bg-[#7c3aed] text-white shadow-md shadow-[#7c3aed]/25 font-semibold"
                        : "text-[#aa9abf] hover:bg-[#1f1833] hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon size={16} className={isActive ? "text-white" : "text-[#8d7aab]"} />
                      <span>{item.label}</span>
                    </div>

                    {isMessages && unreadMessagesCount > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-pink-500 text-white animate-pulse">
                        {unreadMessagesCount}
                      </span>
                    )}
                    {isActive && !isMessages && <ChevronRight size={14} className="opacity-75" />}
                  </NavLink>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-auto pt-6 border-t border-[#221a35] text-[11px] text-[#6d5e85] px-2 space-y-1">
          <div>Version 2.0 Production CMS</div>
          <div className="text-[10px] text-[#55496a]">Changes persist directly to live server.</div>
        </div>
      </aside>
    </>
  );
};
