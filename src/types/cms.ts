import { MediaType, ProjectItem } from "./project";

export interface NavLinkItem {
  id: string;
  label: string;
  href: string;
  visible: boolean;
  order: number;
}

export interface WebsiteSettings {
  siteTitle: string;
  siteDescription: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  keywords: string;
  navbar: {
    brandName: string;
    brandStatus: string;
    brandVersion: string;
    hireButtonText: string;
    hireButtonLink: string;
    navLinks: NavLinkItem[];
  };
}

export interface AboutStatItem {
  id: string;
  number: string;
  label: string;
  glow: "amber" | "cyan" | "purple" | "green" | string;
}

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  tags: string[];
}

export interface CareerItem {
  id: string;
  role: string;
  company: string;
  period: string;
  description: string;
  startDate?: string;
  endDate?: string;
  current?: boolean;
  location?: string;
  employmentType?: string;
  responsibilities?: string[] | string;
  technologies?: string[] | string;
  tools?: string[] | string;
  achievements?: string[] | string;
  category?: string;
  order?: number;
  published?: boolean;
}

export interface SocialLinkItem {
  id: string;
  platform: string;
  url: string;
  label: string;
  icon: "github" | "linkedin" | "twitter" | "instagram" | "other";
  enabled: boolean;
  order: number;
}

export interface HireMeHelpItem {
  category: string;
  skills: string[];
}

export interface HireMeContent {
  title?: string;
  headline?: string;
  description?: string;
  helpList?: HireMeHelpItem[];
  availableFor?: string[];
  ctaHireText?: string;
  ctaContactText?: string;
  ctaResumeText?: string;
}

export interface WebsiteContent {
  hero: {
    welcomeBadge: string;
    mascotImage: string;
    namePrefix: string;
    name: string;
    typingWords: string[];
    ctaProjectsText: string;
    ctaProjectsLink: string;
    ctaResumeText: string;
    ctaResumeUrl: string;
    ctaHireText: string;
    ctaHireLink: string;
    scrollDownText: string;
  };
  about: {
    title: string;
    leadParagraph: string;
    subParagraph1: string;
    subParagraph2: string;
    badges: string[];
    stats: AboutStatItem[];
  };
  whatIDo: {
    title: string;
    services: ServiceItem[];
  };
  career: {
    title: string;
    entries: CareerItem[];
  };
  contact: {
    title: string;
    subtitle: string;
    directEmail: string;
    directPhone: string;
    designerCredit: string;
    copyright: string;
  };
  hireMe?: HireMeContent;
  socialLinks: SocialLinkItem[];
}

export interface MediaLibraryItem {
  id: string;
  filename: string;
  url: string;
  mediaType: MediaType;
  mimeType: string;
  size: number;
  createdAt: string;
  title?: string;
  fileId?: string;
  filePath?: string;
  thumbnailUrl?: string;
}

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  message: string;
  date: string;
  read: boolean;
}

export interface AuditLogEntry {
  id: string;
  action: string;
  details: string;
  timestamp: string;
  user?: string;
}

export interface CMSDatabase {
  version: number;
  lastUpdated: string;
  settings: WebsiteSettings;
  content: WebsiteContent;
  projects: ProjectItem[];
  media: MediaLibraryItem[];
  messages: ContactSubmission[];
  auditLogs: AuditLogEntry[];
}
