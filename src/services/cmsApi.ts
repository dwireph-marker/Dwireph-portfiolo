import { WebsiteSettings, WebsiteContent } from "../types/cms";

type Settings = WebsiteSettings;
type Content = WebsiteContent;

interface ContactSubmission {
  name: string;
  email: string;
  message: string;
}

class CMSApiService {
  private currentUser: { email: string; role: string } | null = null;

  getToken(): string | null {
    // Authentication is cookie-only. Never expose or persist the session token in JavaScript.
    return null;
  }

  setToken(_token: string | null): void {
    // Kept as a no-op for compatibility with older callers.
  }

  private getCsrfToken(): string | null {
    if (typeof document === "undefined") return null;
    const match = document.cookie.split(";").map((part) => part.trim()).find((part) => part.startsWith("admin_csrf="));
    return match ? decodeURIComponent(match.slice("admin_csrf=".length)) : null;
  }

  getHeaders(isJson = true, unsafe = true): HeadersInit {
    const headers: Record<string, string> = {};
    if (isJson) headers["Content-Type"] = "application/json";
    if (unsafe) {
      const csrf = this.getCsrfToken();
      if (csrf) headers["X-CSRF-Token"] = csrf;
    }
    return headers;
  }

  getCurrentUser() {
    return this.currentUser;
  }

  async login(password: string, email?: string) {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ password, email }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (data.user) {
          this.currentUser = data.user;
        }
        return { success: true, user: data.user };
      }
      return {
        success: false,
        error: data.error || "Authentication failed. Check your password.",
      };
    } catch {
      return {
        success: false,
        error: "Network error connecting to authentication server.",
      };
    }
  }

  async checkAuth(): Promise<boolean> {
    try {
      const res = await fetch("/api/auth/me", {
        headers: this.getHeaders(),
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated) {
          if (data.user) this.currentUser = data.user;
          return true;
        }
      }
      // Unauthenticated is a normal state on the login screen.
      this.currentUser = null;
      return false;
    } catch {
      return false;
    }
  }

  async logout() {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: this.getHeaders(),
        credentials: "include",
      });
    } catch (e) {
      console.warn("Logout error:", e);
    } finally {
      this.currentUser = null;
    }
  }

  async changePassword(currentPassword: string, newPassword: string) {
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: this.getHeaders(),
        credentials: "include",
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        return { success: true };
      }
      return { success: false, error: data.error || "Failed to update password" };
    } catch {
      return { success: false, error: "Network error updating password." };
    }
  }
  async getSettings(): Promise<WebsiteSettings> {
    const res = await fetch("/api/settings");
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.settings) throw new Error("database error");
    return data.settings as WebsiteSettings;
  }
  async updateSettings(settings: Settings) {
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: this.getHeaders(),
        credentials: "include",
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        window.dispatchEvent(new Event("portfolio_cms_updated"));
        return { success: true, settings: data.settings };
      }
      return {
        success: false,
        error: data.error || "Failed to update settings",
      };
    } catch {
      return { success: false, error: "Network error updating settings" };
    }
  }
  async getContent(): Promise<WebsiteContent> {
    const res = await fetch("/api/content");
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.content) throw new Error("database error");
    return data.content as WebsiteContent;
  }
  async updateContent(content: Content) {
    try {
      const res = await fetch("/api/content", {
        method: "PUT",
        headers: this.getHeaders(),
        credentials: "include",
        body: JSON.stringify(content),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        window.dispatchEvent(new Event("portfolio_cms_updated"));
        return { success: true, content: data.content };
      }
      return {
        success: false,
        error: data.error || "Failed to update content",
      };
    } catch {
      return { success: false, error: "Network error updating content" };
    }
  }
  async getProjects(includeDrafts = false) {
    const url = includeDrafts ? "/api/projects?all=true" : "/api/projects";
    const res = await fetch(url, { headers: this.getHeaders() });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !Array.isArray(data.projects)) throw new Error("database error");
    return data.projects;
  }
  async createProject(project: object) {
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: this.getHeaders(),
        credentials: "include",
        body: JSON.stringify(project),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        window.dispatchEvent(new Event("portfolio_projects_updated"));
        return { success: true, project: data.project };
      }
      return {
        success: false,
        error: data.error || "Failed to create project",
      };
    } catch {
      return { success: false, error: "Network error creating project" };
    }
  }
  async updateProject(id: string, updates: object) {
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: "PUT",
        headers: this.getHeaders(),
        credentials: "include",
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        window.dispatchEvent(new Event("portfolio_projects_updated"));
        return { success: true, project: data.project };
      }
      return {
        success: false,
        error: data.error || "Failed to update project",
      };
    } catch {
      return { success: false, error: "Network error updating project" };
    }
  }
  async deleteProject(id: string) {
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: "DELETE",
        headers: this.getHeaders(),
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        window.dispatchEvent(new Event("portfolio_projects_updated"));
        return { success: true };
      }
      return {
        success: false,
        error: data.error || "Failed to delete project",
      };
    } catch {
      return { success: false, error: "Network error deleting project" };
    }
  }
  async duplicateProject(id: string) {
    try {
      const res = await fetch(`/api/projects/${id}/duplicate`, {
        method: "POST",
        headers: this.getHeaders(),
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        window.dispatchEvent(new Event("portfolio_projects_updated"));
        return { success: true, project: data.project };
      }
      return {
        success: false,
        error: data.error || "Failed to duplicate project",
      };
    } catch {
      return { success: false, error: "Network error duplicating project" };
    }
  }
  async reorderProjects(ids: string[]) {
    try {
      const res = await fetch("/api/projects/reorder", {
        method: "PUT",
        headers: this.getHeaders(),
        credentials: "include",
        body: JSON.stringify({ ids }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        window.dispatchEvent(new Event("portfolio_projects_updated"));
        return { success: true, projects: data.projects };
      }
      return {
        success: false,
        error: data.error || "Failed to reorder projects",
      };
    } catch {
      return { success: false, error: "Network error reordering projects" };
    }
  }
  async getMedia() {
    const res = await fetch("/api/media", { headers: this.getHeaders(), credentials: "include" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !Array.isArray(data.media)) throw new Error("database error");
    return data.media;
  }
  async registerMedia(payload: { url: string; fileId: string; filePath?: string; thumbnailUrl?: string; name: string; mimeType: string; size: number; title?: string }) {
    try {
      const res = await fetch("/api/media/register", {
        method: "POST",
        headers: this.getHeaders(),
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) return { success: true, url: data.url, poster: data.poster, media: data.media };
      return { success: false, error: data.error || "Failed to register media." };
    } catch {
      return { success: false, error: "Network error registering media." };
    }
  }
  async deleteMedia(id: string) {
    try {
      const res = await fetch(`/api/media/${id}`, {
        method: "DELETE",
        headers: this.getHeaders(),
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        return { success: true };
      }
      return {
        success: false,
        error: data.error || "Failed to delete media",
        referencedBy: data.referencedBy,
      };
    } catch {
      return { success: false, error: "Network error deleting media" };
    }
  }
  async submitContact(data: ContactSubmission) {
    return this.sendMessage(data.name, data.email, data.message);
  }
  async sendMessage(name: string, email: string, message: string) {
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        return { success: true };
      }
      return {
        success: false,
        error: data.error || "Failed to submit message.",
      };
    } catch {
      return { success: false, error: "Network error submitting message." };
    }
  }
  async getMessages() {
    const res = await fetch("/api/contact", { headers: this.getHeaders(), credentials: "include" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !Array.isArray(data.messages)) throw new Error("database error");
    return data.messages;
  }
  async deleteMessage(id: string) {
    try {
      const encodedId = encodeURIComponent(String(id || "").trim());
      const res = await fetch(`/api/contact/${encodedId}`, {
        method: "DELETE",
        headers: this.getHeaders(),
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        return { success: true };
      }
      return {
        success: false,
        error:
          data.error || `Server responded with ${res.status}${res.statusText}`,
      };
    } catch (e) {
      return {
        success: false,
        error:
          e instanceof Error ? e.message : "Network error deleting message",
      };
    }
  }
  async toggleMessageRead(id: string, read: boolean) {
    try {
      const encodedId = encodeURIComponent(String(id || "").trim());
      const res = await fetch(`/api/contact/${encodedId}/read`, {
        method: "PATCH",
        headers: this.getHeaders(),
        credentials: "include",
        body: JSON.stringify({ read }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        return { success: true };
      }
      return {
        success: false,
        error: data.error || "Failed to update read status",
      };
    } catch (e) {
      return {
        success: false,
        error:
          e instanceof Error ? e.message : "Network error updating message",
      };
    }
  }
  async deleteReadMessages() {
    try {
      const res = await fetch("/api/contact/read/all", {
        method: "DELETE",
        headers: this.getHeaders(),
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        return { success: true, count: data.count };
      }
      return {
        success: false,
        error: data.error || "Failed to delete read messages",
      };
    } catch (e) {
      return {
        success: false,
        error:
          e instanceof Error
            ? e.message
            : "Network error deleting read messages",
      };
    }
  }
  async getAuditLogs() {
    const res = await fetch("/api/audit-logs", { headers: this.getHeaders(), credentials: "include" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !Array.isArray(data.logs)) throw new Error("database error");
    return data.logs;
  }
  async exportBackup() {
    const res = await fetch("/api/backup/export", {
      headers: this.getHeaders(),
      credentials: "include",
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(
        errData.error || `Failed to generate backup export(${res.status})`,
      );
    }
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `portfolio_cms_backup_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  }
  async importBackup(jsonData: unknown) {
    try {
      const res = await fetch("/api/backup/import", {
        method: "POST",
        headers: this.getHeaders(),
        credentials: "include",
        body: JSON.stringify(jsonData),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        window.dispatchEvent(new Event("portfolio_cms_updated"));
        window.dispatchEvent(new Event("portfolio_projects_updated"));
        return { success: true };
      }
      return {
        success: false,
        error: data.error || "Failed to restore backup",
      };
    } catch {
      return { success: false, error: "Network error importing backup" };
    }
  }
  async resetToDefaults() {
    try {
      const res = await fetch("/api/backup/reset", {
        method: "POST",
        headers: this.getHeaders(),
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        window.dispatchEvent(new Event("portfolio_cms_updated"));
        window.dispatchEvent(new Event("portfolio_projects_updated"));
        return { success: true };
      }
      return {
        success: false,
        error: data.error || "Failed to reset database",
      };
    } catch {
      return { success: false, error: "Network error resetting database" };
    }
  }
}
export const cmsApi = new CMSApiService();
