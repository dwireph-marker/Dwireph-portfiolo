export type MediaType = "image" | "video";

export type WorkItemType =
  | "project"
  | "edited-video"
  | "certificate"
  | "experience"
  | "skill";

export interface ProjectMedia {
  id: string;
  url: string;
  mediaType: MediaType;
  title?: string;
  fileId?: string;
  poster?: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  workType?: WorkItemType;
  category: "Projects" | "Edited Videos" | "Certificates" | "Experiences" | "Skillsflat" | string;
  link?: string;
  githubLink?: string;
  description?: string;
  longDescription?: string;
  tools?: string;
  image?: string;
  imageUrl?: string;
  thumbnail?: string;
  coverImage?: string;
  color?: string;
  media?: ProjectMedia[];
  published?: boolean;
  featured?: boolean;
  order?: number;
  date?: string;
  videoUrl?: string;
  videoPoster?: string;
}
