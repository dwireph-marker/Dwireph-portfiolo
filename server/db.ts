import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import type { Firestore } from "firebase-admin/firestore";
import { getFirebaseAuth, getFirebaseDb } from "./firebase.js";
import { deleteFromImageKit } from "./imagekit.js";
import { FIREBASE_WEB_API_KEY, SESSION_SECRET, SUPERADMIN_UID } from "./env.js";
import type { CMSDatabase, ContactSubmission, WebsiteContent, WebsiteSettings, MediaLibraryItem, AuditLogEntry } from "../src/types/cms.js";
import type { ProjectItem } from "../src/types/project.js";

const SEED_FILE = path.join(process.cwd(), "data", "seed-data.json");
const MAX_AUDIT_LOGS = 200;

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function hashSessionToken(token: string) {
  return crypto.createHmac("sha256", SESSION_SECRET).update(token).digest("hex");
}

function timingSafeEqualHex(a: string, b: string) {
  const left = Buffer.from(a, "hex");
  const right = Buffer.from(b, "hex");
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

function cleanForFirestore<T>(value: T): T {
  if (Array.isArray(value)) return value.map((item) => cleanForFirestore(item)) as T;
  if (value && typeof value === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
      if (child !== undefined) result[key] = cleanForFirestore(child);
    }
    return result as T;
  }
  return value;
}

async function readSeed(): Promise<CMSDatabase> {
  const raw = await fs.readFile(SEED_FILE, "utf8");
  const parsed = JSON.parse(raw) as CMSDatabase;
  if (!parsed.settings || !parsed.content || !Array.isArray(parsed.projects)) {
    throw new Error("data/seed-data.json is invalid or incomplete.");
  }
  return parsed;
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number, label: string): Promise<T> {
  let timer: NodeJS.Timeout | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timer = setTimeout(() => reject(new Error(`${label} timed out after ${timeoutMs}ms`)), timeoutMs);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}


async function writeCollection(
  firestore: Firestore,
  collection: string,
  items: Array<{ id: string; data: unknown }>,
) {
  let batch = firestore.batch();
  let count = 0;
  for (const item of items) {
    const cleanedData = cleanForFirestore(item.data) as Record<string, unknown>;
    batch.set(firestore.collection(collection).doc(item.id), cleanedData, { merge: false });
    count += 1;
    if (count === 450) {
      await batch.commit();
      batch = firestore.batch();
      count = 0;
    }
  }
  if (count) await batch.commit();
}


async function clearCollection(firestore: Firestore, collection: string) {
  const snapshot = await firestore.collection(collection).get();
  if (!snapshot.size) return;
  let batch = firestore.batch();
  let count = 0;
  for (const doc of snapshot.docs) {
    batch.delete(doc.ref);
    count += 1;
    if (count === 450) {
      await batch.commit();
      batch = firestore.batch();
      count = 0;
    }
  }
  if (count) await batch.commit();
}
async function persistSeed(seed: CMSDatabase, replace = false) {
  const firestore = getFirebaseDb();
  if (replace) {
    await Promise.all([
      clearCollection(firestore, "projects"),
      clearCollection(firestore, "media"),
      clearCollection(firestore, "messages"),
      clearCollection(firestore, "auditLogs"),
    ]);
  }

  await Promise.all([
    firestore.collection("cms").doc("settings").set(cleanForFirestore(seed.settings), { merge: true }),
    firestore.collection("cms").doc("content").set(cleanForFirestore(seed.content), { merge: true }),
    firestore.collection("cms").doc("meta").set(cleanForFirestore({ version: seed.version, lastUpdated: seed.lastUpdated }), { merge: true }),
  ]);

  await Promise.all([
    writeCollection(firestore, "projects", seed.projects.map((item) => ({ id: item.id, data: item }))),
    writeCollection(firestore, "media", seed.media.map((item) => ({ id: item.id, data: item }))),
    writeCollection(firestore, "messages", seed.messages.map((item) => ({ id: item.id, data: item }))),
    writeCollection(firestore, "auditLogs", seed.auditLogs.map((item) => ({ id: item.id, data: item }))),
  ]);
}

async function initializeAdmin() {
  const firestore = getFirebaseDb();
  const primaryRef = firestore.collection("admins").doc("primary");
  const primarySnapshot = await primaryRef.get();
  const configuredUid = SUPERADMIN_UID.trim();
  let superadminUid = configuredUid;

  // Preserve an existing Firebase UID when the bootstrap variable is omitted.
  if (!superadminUid && primarySnapshot.exists) {
    superadminUid = String(primarySnapshot.data()?.firebaseUid || "").trim();
  }
  if (!superadminUid) {
    console.warn("[AUTH] SUPERADMIN_UID is not configured and no existing admin UID was found. Create the Firebase Auth user first and set SUPERADMIN_UID for the initial role bootstrap.");
    return;
  }

  const user = await getFirebaseAuth().getUser(superadminUid);
  const adminData = {
    email: user.email || null,
    firebaseUid: user.uid,
    role: "superadmin",
    disabled: Boolean(user.disabled),
    updatedAt: new Date().toISOString(),
  };

  // UID is the authoritative admin identity. The legacy primary document is
  // retained only as a compatibility pointer; passwords are never stored here.
  await firestore.collection("admins").doc(user.uid).set(adminData, { merge: true });
  await primaryRef.set({
    firebaseUid: user.uid,
    email: user.email || null,
    role: "superadmin",
    authProvider: "firebase-auth",
    passwordStorage: "firebase-auth",
    updatedAt: new Date().toISOString(),
  }, { merge: true });

  // Remove the legacy password hash if an older deployment created one.
  const legacy = primarySnapshot.data() || {};
  if ("passwordHash" in legacy || "salt" in legacy) {
    await primaryRef.update({ passwordHash: null, salt: null });
  }
  console.log("[AUTH] Firebase Auth administrator verified.");
}


export async function migrateAllDataToFirebase() {
  const seed = await readSeed();
  await persistSeed(seed);
  await initializeAdmin();
  await getFirebaseDb().collection("cms").doc("meta").set({
    version: seed.version,
    lastUpdated: new Date().toISOString(),
    initializedFrom: "data/seed-data.json",
    storage: { provider: "imagekit", publicDirectory: "/uploads", imageKit: true },
  }, { merge: true });
  return {
    uploadedDocuments: {
      projects: seed.projects.length,
      media: seed.media.length,
      messages: seed.messages.length,
      auditLogs: seed.auditLogs.length,
    },
    uploadedAssets: 0,
    storage: "imagekit",
  };
}

async function initializeFirestore() {
  const firestore = getFirebaseDb();
  const [seed, meta, settingsDoc, contentDoc] = await Promise.all([
    readSeed(),
    firestore.collection("cms").doc("meta").get(),
    firestore.collection("cms").doc("settings").get(),
    firestore.collection("cms").doc("content").get(),
  ]);

  const needsCoreSeed = !meta.exists || !settingsDoc.exists || !contentDoc.exists;
  if (needsCoreSeed) {
    await withTimeout(persistSeed(seed), 60_000, "Firestore seed upload");
    await withTimeout(initializeAdmin(), 15_000, "Firebase admin initialization");
    await firestore.collection("cms").doc("meta").set({
      version: seed.version,
      lastUpdated: new Date().toISOString(),
      initializedAt: meta.exists ? undefined : new Date().toISOString(),
      repairedAt: meta.exists ? new Date().toISOString() : undefined,
      initializedFrom: "data/seed-data.json",
    }, { merge: true });
  } else {
    // Existing runtime data is authoritative. Do not reconcile or reseed documents
    // during startup; admin/content changes must only happen through the app.
    await withTimeout(initializeAdmin(), 15_000, "Firebase admin initialization");
  }

}

let readyPromise: Promise<void> | null = null;
export function ensureDatabaseReady() {
  if (!readyPromise) {
    readyPromise = initializeFirestore().catch((error) => {
      // Do not permanently cache a rejected initialization promise. A transient
      // Firebase/network outage should recover automatically on the next API request.
      readyPromise = null;
      throw error;
    });
  }
  return readyPromise;
}

async function addAuditLog(action: string, details: string, user = "Admin") {
  const firestore = getFirebaseDb();
  const log: AuditLogEntry = {
    id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    action,
    details,
    timestamp: new Date().toISOString(),
    user,
  };
  await firestore.collection("auditLogs").doc(log.id).set(cleanForFirestore(log));
  const snapshot = await firestore.collection("auditLogs").orderBy("timestamp", "desc").limit(MAX_AUDIT_LOGS + 20).get();
  if (snapshot.size > MAX_AUDIT_LOGS) {
    const batch = firestore.batch();
    snapshot.docs.slice(MAX_AUDIT_LOGS).forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
  }
  return log;
}

async function getDoc<T>(collection: string, id: string): Promise<T | null> {
  const snapshot = await getFirebaseDb().collection(collection).doc(id).get();
  return snapshot.exists ? (snapshot.data() as T) : null;
}

async function listDocs<T>(collection: string, orderBy?: string): Promise<T[]> {
  const ref = getFirebaseDb().collection(collection);
  const snapshot = orderBy
    ? await ref.orderBy(orderBy, "asc").get()
    : await ref.get();
  return snapshot.docs.map((doc) => doc.data() as T);
}

export const serverDB = {
  async getDB(): Promise<CMSDatabase> {
    await ensureDatabaseReady();
    const [settings, content, projects, media, messages, auditLogs] = await Promise.all([
      getDoc<WebsiteSettings>("cms", "settings"),
      getDoc<WebsiteContent>("cms", "content"),
      listDocs<ProjectItem>("projects"),
      listDocs<MediaLibraryItem>("media"),
      listDocs<ContactSubmission>("messages"),
      listDocs<AuditLogEntry>("auditLogs", "timestamp"),
    ]);
    if (!settings || !content) throw new Error("Database error: required CMS documents are missing.");
    return {
      version: 2,
      lastUpdated: new Date().toISOString(),
      settings,
      content,
      projects: projects.sort((a, b) => (a.order ?? 999) - (b.order ?? 999)),
      media,
      messages: messages.sort((a, b) => String(b.date).localeCompare(String(a.date))),
      auditLogs: auditLogs.reverse(),
    };
  },

  async getSettings() {
    await ensureDatabaseReady();
    const value = await getDoc<WebsiteSettings>("cms", "settings");
    if (!value) throw new Error("Database error");
    return value;
  },
  async updateSettings(settings: WebsiteSettings) {
    await ensureDatabaseReady();
    await getFirebaseDb().collection("cms").doc("settings").set(cleanForFirestore(settings));
    await addAuditLog("Settings Updated", "Updated website title, SEO, and navigation layout.");
    return settings;
  },
  async getContent() {
    await ensureDatabaseReady();
    const value = await getDoc<WebsiteContent>("cms", "content");
    if (!value) throw new Error("Database error");
    return value;
  },
  async updateContent(content: WebsiteContent) {
    await ensureDatabaseReady();
    await getFirebaseDb().collection("cms").doc("content").set(cleanForFirestore(content));
    await addAuditLog("Content Published", "Updated hero, about, services, or contact sections.");
    return content;
  },
  async getProjects(includeDrafts = false) {
    await ensureDatabaseReady();
    const projects = (await listDocs<ProjectItem>("projects")).sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
    return includeDrafts ? projects : projects.filter((project) => project.published !== false);
  },
  async getProject(id: string) {
    await ensureDatabaseReady();
    return getDoc<ProjectItem>("projects", id);
  },
  async createProject(project: Partial<ProjectItem>) {
    await ensureDatabaseReady();
    const id = project.id || `proj_${Date.now()}`;
    const isVideo = project.workType === "edited-video" || project.category === "Edited Videos";
    const workType = project.workType || (isVideo ? "edited-video" : "project");
    const category = project.category || (isVideo ? "Edited Videos" : "Projects");
    const existing = await this.getProjects(true);
    const newProject: ProjectItem = {
      id,
      title: project.title || (isVideo ? "New Edited Video" : "New Project"),
      workType,
      category,
      tools: project.tools || "",
      description: project.description || "",
      longDescription: project.longDescription || "",
      link: project.link || "",
      githubLink: project.githubLink || "",
      color: project.color || "#A855F7",
      image: project.image || project.media?.[0]?.url || "",
      media: project.media || [],
      published: project.published ?? true,
      featured: project.featured ?? false,
      order: project.order ?? existing.length + 1,
      date: project.date || new Date().toISOString().slice(0, 10),
      videoUrl: project.videoUrl || (project.media?.[0]?.mediaType === "video" ? project.media[0].url : undefined),
      videoPoster: project.videoPoster,
    };
    await getFirebaseDb().collection("projects").doc(id).set(cleanForFirestore(newProject));
    await addAuditLog("Project Created", `Created ${workType} "${newProject.title}" (ID:${id})`);
    return newProject;
  },
  async updateProject(id: string, updates: Partial<ProjectItem>) {
    await ensureDatabaseReady();
    const existing = await this.getProject(id);
    if (!existing) return null;
    const updated: ProjectItem = { ...existing, ...updates, id };
    await getFirebaseDb().collection("projects").doc(id).set(cleanForFirestore(updated));
    await addAuditLog("Project Updated", `Updated "${updated.title}" (ID:${id})`);
    return updated;
  },
  async deleteProject(id: string) {
    await ensureDatabaseReady();
    const existing = await this.getProject(id);
    if (!existing) return false;
    await getFirebaseDb().collection("projects").doc(id).delete();
    await addAuditLog("Project Deleted", `Deleted project "${existing.title}" (ID:${id})`);
    return true;
  },
  async duplicateProject(id: string) {
    const original = await this.getProject(id);
    if (!original) return null;
    const copy = clone(original);
    copy.id = `proj_${Date.now()}`;
    copy.title = `${original.title} (Copy)`;
    copy.order = (original.order ?? 0) + 1;
    copy.published = false;
    await getFirebaseDb().collection("projects").doc(copy.id).set(cleanForFirestore(copy));
    await addAuditLog("Project Duplicated", `Duplicated "${original.title}" as "${copy.title}"`);
    return copy;
  },
  async reorderProjects(ids: string[]) {
    const projects: ProjectItem[] = await this.getProjects(true);
    const map = new Map<string, ProjectItem>(projects.map((project: ProjectItem) => [project.id, project]));
    const ordered: ProjectItem[] = [];
    ids.forEach((id) => {
      const project = map.get(id);
      if (project) {
        project.order = ordered.length + 1;
        ordered.push(project);
        map.delete(id);
      }
    });
    for (const project of map.values()) {
      project.order = ordered.length + 1;
      ordered.push(project);
    }
    const batch = getFirebaseDb().batch();
    ordered.forEach((project) => batch.set(getFirebaseDb().collection("projects").doc(project.id), cleanForFirestore(project), { merge: true }));
    await batch.commit();
    await addAuditLog("Projects Reordered", `Reordered ${ids.length} projects.`);
    return ordered;
  },
  async getMedia() {
    await ensureDatabaseReady();
    return listDocs<MediaLibraryItem>("media");
  },
  async addMedia(mediaItem: Omit<MediaLibraryItem, "id" | "createdAt">) {
    await ensureDatabaseReady();
    const item: MediaLibraryItem = {
      ...mediaItem,
      id: `med_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      createdAt: new Date().toISOString(),
    };
    await getFirebaseDb().collection("media").doc(item.id).set(cleanForFirestore(item));
    try {
      await addAuditLog("Media Uploaded", `Uploaded file ${item.filename}`);
    } catch (error) {
      console.warn("[FIREBASE] Media audit log failed; media record was saved successfully:", error instanceof Error ? error.message : error);
    }
    return item;
  },
  async deleteMedia(id: string) {
    await ensureDatabaseReady();
    const item = await getDoc<MediaLibraryItem>("media", id);
    if (!item) return { success: false, error: "Media item not found" };
    const projects = await this.getProjects(true);
    const referencedBy = projects.filter((project) => {
      return project.media?.some((media) => media.url === item.url) ||
        [project.image, project.imageUrl, project.thumbnail, project.coverImage].includes(item.url);
    }).map((project) => project.title);
    if (referencedBy.length) {
      return { success: false, error: `Cannot delete: media is currently in use by project(s): ${referencedBy.join(", ")}. Remove references first.`, referencedBy };
    }
    await getFirebaseDb().collection("media").doc(id).delete();
    if (item.fileId) {
      try {
        await deleteFromImageKit(item.fileId);
      } catch (error) {
        console.warn("[IMAGEKIT] Asset metadata deleted, but remote asset cleanup failed:", error instanceof Error ? error.message : error);
      }
    }
    if (item.url.startsWith("/uploads/")) {
      const relative = item.url.slice("/uploads/".length);
      const safeName = path.basename(relative);
      const uploadRoot = path.resolve(process.cwd(), "public", "uploads");
      const filePath = path.resolve(uploadRoot, safeName);
      if (filePath.startsWith(uploadRoot + path.sep)) {
        await fs.unlink(filePath).catch(() => undefined);
      }
    }
    await addAuditLog("Media Deleted", `Deleted media asset "${item.filename}"`);
    return { success: true };
  },
  async getMessages() {
    await ensureDatabaseReady();
    const messages = await listDocs<ContactSubmission>("messages");
    return messages.sort((a, b) => String(b.date).localeCompare(String(a.date)));
  },
  async addMessage(msg: Omit<ContactSubmission, "id" | "date" | "read">) {
    await ensureDatabaseReady();
    const submission: ContactSubmission = {
      id: `msg_${Date.now()}`,
      name: msg.name.trim(),
      email: msg.email.trim(),
      message: msg.message.trim(),
      date: new Date().toISOString(),
      read: false,
    };
    await getFirebaseDb().collection("messages").doc(submission.id).set(cleanForFirestore(submission));
    await addAuditLog("Contact Submission", `New inquiry received from ${submission.name} (${submission.email})`, "Visitor");
    return submission;
  },
  async deleteMessage(id: string) {
    await ensureDatabaseReady();
    const ref = getFirebaseDb().collection("messages").doc(String(id).trim());
    const snapshot = await ref.get();
    if (!snapshot.exists) return false;
    await ref.delete();
    await addAuditLog("Message Deleted", `Deleted message with ID ${id}`);
    return true;
  },
  async toggleMessageRead(id: string, readStatus?: boolean) {
    await ensureDatabaseReady();
    const ref = getFirebaseDb().collection("messages").doc(String(id).trim());
    const snapshot = await ref.get();
    if (!snapshot.exists) return false;
    const message = snapshot.data() as ContactSubmission;
    message.read = readStatus ?? !message.read;
    await ref.set(message, { merge: true });
    await addAuditLog("Message Updated", `Marked message from "${message.name}" as ${message.read ? "read" : "unread"}`);
    return true;
  },
  async deleteReadMessages() {
    const messages = await this.getMessages();
    const read = messages.filter((message) => message.read);
    if (!read.length) return { success: true, count: 0 };
    const batch = getFirebaseDb().batch();
    read.forEach((message) => batch.delete(getFirebaseDb().collection("messages").doc(message.id)));
    await batch.commit();
    await addAuditLog("Bulk Delete", `Deleted ${read.length} read message(s)`);
    return { success: true, count: read.length };
  },
  async getAuditLogs() {
    await ensureDatabaseReady();
    const logs = await listDocs<AuditLogEntry>("auditLogs", "timestamp");
    return logs.reverse();
  },
  async exportBackup() {
    return this.getDB();
  },
  async importBackup(backupData: unknown) {
    if (!backupData || typeof backupData !== "object" || Array.isArray(backupData)) return { success: false, error: "Invalid backup data format." };
    const serialized = JSON.stringify(backupData);
    if (!serialized || serialized.length > 5_000_000) return { success: false, error: "Backup is too large." };
    const data = backupData as Partial<CMSDatabase>;
    if (!data.projects || !Array.isArray(data.projects) || data.projects.length > 1000 || !data.content || typeof data.content !== "object" || !data.settings || typeof data.settings !== "object") {
      return { success: false, error: "Backup is missing valid projects, content, or settings data." };
    }
    const allowedProjectKeys = new Set(["id","title","workType","category","link","githubLink","description","longDescription","tools","image","imageUrl","thumbnail","coverImage","color","media","published","featured","order","date","videoUrl","videoPoster"]);
    for (const project of data.projects) {
      if (!project || typeof project !== "object" || Array.isArray(project)) return { success: false, error: "Backup contains an invalid project." };
      for (const key of Object.keys(project as unknown as Record<string, unknown>)) if (!allowedProjectKeys.has(key)) return { success: false, error: "Backup contains an unsupported project field." };
      if (typeof (project as any).id !== "string" || !/^[A-Za-z0-9_-]{1,128}$/.test((project as any).id)) return { success: false, error: "Backup contains an invalid project ID." };
      if (typeof (project as any).title !== "string" || (project as any).title.length > 200) return { success: false, error: "Backup contains an invalid project title." };
    }
    for (const key of ["media", "messages", "auditLogs"] as const) {
      const value = data[key];
      if (value !== undefined && (!Array.isArray(value) || value.length > 5000)) return { success: false, error: `Backup contains invalid ${key} data.` };
    }
    const validated: CMSDatabase = {
      version: Number.isInteger(data.version) ? Number(data.version) : 2,
      lastUpdated: new Date().toISOString(),
      settings: data.settings as CMSDatabase["settings"],
      content: data.content as CMSDatabase["content"],
      projects: data.projects as CMSDatabase["projects"],
      media: Array.isArray(data.media) ? data.media as CMSDatabase["media"] : [],
      messages: Array.isArray(data.messages) ? data.messages as CMSDatabase["messages"] : [],
      auditLogs: Array.isArray(data.auditLogs) ? data.auditLogs as CMSDatabase["auditLogs"] : [],
    };
    await persistSeed(validated, true);
    await addAuditLog("Backup Imported", "Restored CMS database from imported backup.");
    return { success: true };
  },
  async resetToDefaults() {
    const seed = await readSeed();
    await persistSeed(seed, true);
    await addAuditLog("Database Reset", "Reset CMS database to the seed snapshot.");
    return true;
  },
  async authenticateWithFirebase(email: string, password: string) {
    if (!FIREBASE_WEB_API_KEY) {
      throw new Error("FIREBASE_WEB_API_KEY is not configured.");
    }
    const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${encodeURIComponent(FIREBASE_WEB_API_KEY)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim(), password, returnSecureToken: true }),
    });
    const data = (await response.json().catch(() => ({}))) as { idToken?: unknown; localId?: unknown };
    if (!response.ok || typeof data.idToken !== "string" || typeof data.localId !== "string") {
      return null;
    }
    const decoded = await getFirebaseAuth().verifyIdToken(data.idToken);
    if (decoded.uid !== data.localId) return null;
    const user = await getFirebaseAuth().getUser(decoded.uid);
    if (user.disabled) return null;
    const adminSnapshot = await getFirebaseDb().collection("admins").doc(user.uid).get();
    if (!adminSnapshot.exists) return null;
    const admin = adminSnapshot.data() as { role?: string; email?: string; firebaseUid?: string };
    if (!["admin", "superadmin"].includes(admin.role || "")) return null;
    if (admin.firebaseUid && admin.firebaseUid !== user.uid) return null;
    return { uid: user.uid, email: user.email || email.trim(), role: admin.role as "admin" | "superadmin" };
  },

  async changePassword(firebaseUid: string, currentPassword: string, newPassword: string) {
    if (!FIREBASE_WEB_API_KEY) return { success: false, error: "Firebase authentication is not configured." };
    if (!firebaseUid || typeof currentPassword !== "string" || typeof newPassword !== "string") {
      return { success: false, error: "Invalid password request." };
    }
    if (newPassword.length < 12 || newPassword.length > 128) return { success: false, error: "New password must be 12–128 characters." };
    if (currentPassword === newPassword) return { success: false, error: "New password must be different from the current password." };
    const user = await getFirebaseAuth().getUser(firebaseUid);
    if (!user.email) return { success: false, error: "Administrator account has no email address." };
    const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${encodeURIComponent(FIREBASE_WEB_API_KEY)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: user.email, password: currentPassword, returnSecureToken: false }),
    });
    if (!response.ok) return { success: false, error: "Current password is incorrect." };
    await getFirebaseAuth().updateUser(firebaseUid, { password: newPassword });
    await this.destroyAllSessions();
    return { success: true };
  },
  async createSession(identity: { uid: string; email: string; role: "admin" | "superadmin" }) {
    await ensureDatabaseReady();
    const token = crypto.randomBytes(32).toString("hex");
    const now = Date.now();
    const expiresAt = now + 12 * 60 * 60 * 1000;
    const tokenHash = hashSessionToken(token);
    await getFirebaseDb().collection("sessions").doc(tokenHash).set({
      email: identity.email,
      role: identity.role,
      firebaseUid: identity.uid,
      createdAt: now,
      authVersion: 3,
      lastSeenAt: now,
      expiresAt,
      csrfTokenHash: null,
    });
    return token;
  },
  async setCsrfToken(token: string, csrfToken: string) {
    await ensureDatabaseReady();
    await getFirebaseDb().collection("sessions").doc(hashSessionToken(token)).set({
      csrfTokenHash: crypto.createHash("sha256").update(csrfToken).digest("hex"),
    }, { merge: true });
  },
  async verifyCsrfToken(token: string, csrfToken: string) {
    if (!token || !csrfToken) return false;
    await ensureDatabaseReady();
    const snapshot = await getFirebaseDb().collection("sessions").doc(hashSessionToken(token)).get();
    if (!snapshot.exists) return false;
    const data = snapshot.data() as { csrfTokenHash?: string };
    const suppliedHash = crypto.createHash("sha256").update(csrfToken).digest("hex");
    return Boolean(data.csrfTokenHash && timingSafeEqualHex(suppliedHash, data.csrfTokenHash));
  },
  async verifySession(token: string) {
    if (!token || !/^[a-f0-9]{64}$/i.test(token)) return null;
    await ensureDatabaseReady();
    const ref = getFirebaseDb().collection("sessions").doc(hashSessionToken(token));
    const snapshot = await ref.get();
    if (!snapshot.exists) return null;
    const session = snapshot.data() as {
      email?: string;
      role?: string;
      firebaseUid?: string;
      createdAt: number;
      lastSeenAt?: number;
      expiresAt: number;
      csrfTokenHash?: string | null;
      authVersion?: number;
    };
    const now = Date.now();
    const idleTimeout = 60 * 60 * 1000;
    if (session.authVersion !== 3) {
      await ref.delete();
      return null;
    }
    if (session.expiresAt <= now || (session.lastSeenAt && now - session.lastSeenAt > idleTimeout)) {
      await ref.delete();
      return null;
    }
    if (!session.lastSeenAt || now - session.lastSeenAt > 5 * 60 * 1000) {
      await ref.set({ lastSeenAt: now }, { merge: true });
      session.lastSeenAt = now;
    }
    return session;
  },
  async destroySession(token: string) {
    if (!token) return;
    await ensureDatabaseReady();
    await getFirebaseDb().collection("sessions").doc(hashSessionToken(token)).delete();
  },
  async destroyAllSessions() {
    const snapshot = await getFirebaseDb().collection("sessions").get();
    if (!snapshot.size) return;
    const batch = getFirebaseDb().batch();
    snapshot.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
  },
  async getAdminEmail() {
    await ensureDatabaseReady();
    const admin = await getDoc<{ email: string }>("admins", "primary");
    if (!admin) throw new Error("Database error");
    return admin.email;
  },
  async getAdminProfile(firebaseUid?: string) {
    await ensureDatabaseReady();
    if (!firebaseUid) throw new Error("Authenticated Firebase UID is required.");
    const admin = await getDoc<{ email?: string; role?: string; firebaseUid?: string }>("admins", firebaseUid);
    if (!admin || !["admin", "superadmin"].includes(admin.role || "")) throw new Error("Database error");
    return { email: admin.email || "", role: admin.role as "admin" | "superadmin" };
  },
};
