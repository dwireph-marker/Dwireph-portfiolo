import React, { useState, useEffect, useCallback } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { AdminLogin } from "./admin/AdminLogin";
import { AdminHeader } from "./admin/AdminHeader";
import { AdminSidebar, AdminTabId } from "./admin/AdminSidebar";
import { HeroEditorTab } from "./admin/tabs/HeroEditorTab";
import { AboutEditorTab } from "./admin/tabs/AboutEditorTab";
import { ServicesEditorTab } from "./admin/tabs/ServicesEditorTab";
import { CareerEditorTab } from "./admin/tabs/CareerEditorTab";
import { ContactEditorTab } from "./admin/tabs/ContactEditorTab";
import { SocialLinksTab } from "./admin/tabs/SocialLinksTab";
import { ProjectsEditorTab } from "./admin/tabs/ProjectsEditorTab";
import { MediaLibraryTab } from "./admin/tabs/MediaLibraryTab";
import { MessagesTab } from "./admin/tabs/MessagesTab";
import { NavigationEditorTab } from "./admin/tabs/NavigationEditorTab";
import { SettingsTab } from "./admin/tabs/SettingsTab";
import { BackupLogsTab } from "./admin/tabs/BackupLogsTab";
import { AccountTab } from "./admin/tabs/AccountTab";
import { cmsApi } from "../services/cmsApi";
import { WebsiteSettings, WebsiteContent, ContactSubmission, AuditLogEntry } from "../types/cms";
import { ProjectItem } from "../types/project";
import { Loader2, X } from "lucide-react";
import { useCMS } from "../context/CMSContext";

export default function AdminPanel() {
  const { settings: cmsSettings, content: cmsContent, projects: cmsProjects } = useCMS();
  const location = useLocation();
  const navigate = useNavigate();

  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [adminEmail, setAdminEmail] = useState<string>("");

  // Navigation State

  const routeToTab: Record<string, AdminTabId> = {
    hero: "hero",
    about: "about",
    "skills-services": "whatido",
    projects: "projects",
    "edited-videos": "videos",
    experience: "career",
    contact: "contact",
    "social-links": "social",
    "media-library": "media",
    messages: "messages",
    navigation: "navigation",
    "seo-settings": "seo",
    "backup-logs": "backup",
    security: "account",
  };

  const routeSegment = location.pathname.replace(/^\/admin\/?/, "").split("/")[0] || "projects";
  const activeTab: AdminTabId = routeToTab[routeSegment] || "projects";

  // Data State
  const [settings, setSettings] = useState<WebsiteSettings>(cmsSettings as WebsiteSettings);
  const [content, setContent] = useState<WebsiteContent>(cmsContent as WebsiteContent);
  const [projects, setProjects] = useState<ProjectItem[]>(cmsProjects);
  const [messages, setMessages] = useState<ContactSubmission[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);

  // UI State
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

  // Modal Media Picker Callback
  const [mediaPickerCallback, setMediaPickerCallback] = useState<((url: string) => void) | null>(
    null
  );

  const showStatus = (text: string, type: "success" | "error" | "info" = "success") => {
    setStatusMessage({ type, text });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  // Verify authentication on mount
  useEffect(() => {
    let mounted = true;
    cmsApi.checkAuth().then((authed) => {
      if (mounted) {
        setIsAuthenticated(authed);
        const user = cmsApi.getCurrentUser();
        if (user?.email) {
          setAdminEmail(user.email);
        }
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  // Fetch all CMS data when authenticated
  const loadAllData = useCallback(async () => {
    try {
      const [s, c, p, m, l] = await Promise.all([
        cmsApi.getSettings(),
        cmsApi.getContent(),
        cmsApi.getProjects(true), // Include drafts for admin
        cmsApi.getMessages(),
        cmsApi.getAuditLogs(),
      ]);

      if (s) setSettings(s);
      if (c) setContent(c);
      if (p) setProjects(p);
      if (m) setMessages(m);
      if (l) setAuditLogs(l);
    } catch (e) {
      console.error("Failed to load CMS data:", e);
      showStatus("database error", "error");
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadAllData();
    }
  }, [isAuthenticated, loadAllData]);

  const handleLogout = async () => {
    await cmsApi.logout();
    setIsAuthenticated(false);
    showStatus("Logged out successfully.", "info");
  };

  const handleSaveSettings = async (updated: WebsiteSettings) => {
    const res = await cmsApi.updateSettings(updated);
    if (res.success && res.settings) {
      setSettings(res.settings);
      showStatus("Website settings saved successfully!");
      setHasUnsavedChanges(false);
    } else {
      showStatus(res.error || "Failed to save settings", "error");
    }
  };

  const handleSaveContent = async (updated: WebsiteContent) => {
    const res = await cmsApi.updateContent(updated);
    if (res.success && res.content) {
      setContent(res.content);
      showStatus("Website content published successfully!");
      setHasUnsavedChanges(false);
    } else {
      showStatus(res.error || "Failed to publish content", "error");
    }
  };

  const unreadMessagesCount = messages.filter((m) => !m.read).length;

  // 1. Loading State
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen w-full bg-[#0d0a14] flex flex-col items-center justify-center text-white gap-3 font-sans">
        <Loader2 size={32} className="text-[#a855f7] animate-spin" />
        <span className="text-sm font-medium text-[#c2a4ff]">Connecting to Secure Admin Console...</span>
      </div>
    );
  }

  // 2. Unauthenticated State (Login Screen)
  if (!isAuthenticated) {
    return (
      <AdminLogin
        onLoginSuccess={() => {
          setIsAuthenticated(true);
          const user = cmsApi.getCurrentUser();
          if (user?.email) {
            setAdminEmail(user.email);
          }
        }}
        onBackToSite={() => navigate("/")}
      />
    );
  }

  // 3. Authenticated Admin Dashboard
  return (
    <div className="min-h-screen w-full bg-[#0d0a14] text-[#ece8f5] flex flex-col font-sans">
      {/* Top Header */}
      <AdminHeader
        adminEmail={adminEmail}
        hasUnsavedChanges={hasUnsavedChanges}
        onViewWebsite={() => navigate("/")}
        onLogout={handleLogout}
        statusMessage={statusMessage}
      />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Sidebar */}
        <AdminSidebar
          activeTab={activeTab}
          unreadMessagesCount={unreadMessagesCount}
        />

        {/* Content Workspace Canvas */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto bg-[#0d0a14]">
          <Routes>
            <Route index element={<Navigate to="projects" replace />} />
            <Route path="hero" element={
              <HeroEditorTab content={content} onSave={handleSaveContent} onOpenMediaPicker={(cb) => setMediaPickerCallback(() => cb)} />
            } />
            <Route path="about" element={<AboutEditorTab content={content} onSave={handleSaveContent} />} />
            <Route path="skills-services" element={<ServicesEditorTab content={content} onSave={handleSaveContent} />} />
            <Route path="projects" element={
              <ProjectsEditorTab key="projects-route" projects={projects} onRefresh={loadAllData} onOpenMediaPicker={(cb) => setMediaPickerCallback(() => cb)} initialTab="projects" />
            } />
            <Route path="edited-videos" element={
              <ProjectsEditorTab key="videos-route" projects={projects} onRefresh={loadAllData} onOpenMediaPicker={(cb) => setMediaPickerCallback(() => cb)} initialTab="videos" />
            } />
            <Route path="experience" element={<CareerEditorTab content={content} onSave={handleSaveContent} />} />
            <Route path="contact" element={<ContactEditorTab content={content} onSave={handleSaveContent} />} />
            <Route path="social-links" element={<SocialLinksTab content={content} onSave={handleSaveContent} />} />
            <Route path="media-library" element={<MediaLibraryTab />} />
            <Route path="messages" element={<MessagesTab messages={messages} onRefresh={loadAllData} />} />
            <Route path="navigation" element={<NavigationEditorTab settings={settings} onSave={handleSaveSettings} />} />
            <Route path="seo-settings" element={<SettingsTab settings={settings} onSave={handleSaveSettings} onOpenMediaPicker={(cb) => setMediaPickerCallback(() => cb)} />} />
            <Route path="backup-logs" element={<BackupLogsTab logs={auditLogs} onRefreshAll={loadAllData} />} />
            <Route path="security" element={<AccountTab adminEmail={adminEmail} />} />
            <Route path="*" element={<Navigate to="projects" replace />} />
          </Routes>
        </main>
      </div>

      {/* Global Media Picker Dialog Modal */}
      {mediaPickerCallback && (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#140f25] border border-[#302450] rounded-2xl w-full max-w-4xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#261d3e] mb-4">
              <h3 className="text-base font-bold text-white">Select Asset from Media Library</h3>
              <button
                type="button"
                onClick={() => setMediaPickerCallback(null)}
                className="p-1.5 rounded-lg bg-[#201838] text-[#9d8ab8] hover:text-white cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <MediaLibraryTab
              isPickerMode={true}
              onSelectMedia={(url) => {
                mediaPickerCallback(url);
                setMediaPickerCallback(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
