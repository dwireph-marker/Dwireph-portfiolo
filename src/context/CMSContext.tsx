import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { WebsiteSettings, WebsiteContent } from "../types/cms";
import { ProjectItem } from "../types/project";
import { cmsApi } from "../services/cmsApi";

interface CMSContextType {
  settings: WebsiteSettings;
  content: WebsiteContent;
  projects: ProjectItem[];
  isLoading: boolean;
  databaseError: boolean;
  refreshData: () => Promise<void>;
}

const CMSContext = createContext<CMSContextType | null>(null);

const DatabaseError = () => (
  <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#050308", color: "white", fontFamily: "system-ui, sans-serif" }}>
    <div style={{ textAlign: "center", padding: "2rem" }}>
      <h1 style={{ margin: 0, fontSize: "2rem" }}>database error</h1>
    </div>
  </div>
);

export const CMSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<WebsiteSettings | null>(null);
  const [content, setContent] = useState<WebsiteContent | null>(null);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [databaseError, setDatabaseError] = useState(false);

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    setDatabaseError(false);
    try {
      const [fetchedSettings, fetchedContent, fetchedProjects] = await Promise.all([
        cmsApi.getSettings(),
        cmsApi.getContent(),
        cmsApi.getProjects(false),
      ]);
      if (!fetchedSettings || !fetchedContent || !Array.isArray(fetchedProjects)) throw new Error("database error");
      setSettings(fetchedSettings);
      setContent(fetchedContent);
      setProjects(fetchedProjects);
    } catch (error) {
      console.error("CMS database load failed:", error);
      setDatabaseError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
    const handleUpdate = () => { void refreshData(); };
    window.addEventListener("portfolio_cms_updated", handleUpdate);
    window.addEventListener("portfolio_projects_updated", handleUpdate);
    return () => {
      window.removeEventListener("portfolio_cms_updated", handleUpdate);
      window.removeEventListener("portfolio_projects_updated", handleUpdate);
    };
  }, [refreshData]);

  useEffect(() => {
    if (settings?.siteTitle) document.title = settings.siteTitle;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && settings?.siteDescription) metaDesc.setAttribute("content", settings.siteDescription);
  }, [settings]);

  if (databaseError) return <DatabaseError />;
  if (isLoading || !settings || !content) return <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#050308", color: "white" }}>Loading...</div>;

  return <CMSContext.Provider value={{ settings, content, projects, isLoading, databaseError, refreshData }}>{children}</CMSContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useCMS = () => {
  const value = useContext(CMSContext);
  if (!value) throw new Error("CMSProvider is missing");
  return value;
};
