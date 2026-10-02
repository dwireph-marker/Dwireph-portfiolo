import { ProjectItem, WorkItemType } from "../types/project";

/**
 * Checks whether an item is an Edited Video work item
 */
export function isEditedVideoWork(item?: Partial<ProjectItem> | null): boolean {
  if (!item) return false;
  if (item.workType === "edited-video") return true;
  if (item.category === "Edited Videos") return true;
  return false;
}

/**
 * Checks whether an item is a normal website/software/portfolio project
 */
export function isNormalProjectWork(item?: Partial<ProjectItem> | null): boolean {
  if (!item) return false;
  // If explicitly flagged as edited video or other type, it's not a normal project
  if (isEditedVideoWork(item)) return false;
  if (item.workType && item.workType !== "project") return false;
  if (
    item.category === "Certificates" ||
    item.category === "Experiences" ||
    item.category === "Skillsflat"
  ) {
    return false;
  }
  return true;
}

/**
 * Derives the explicit workType from an item
 */
export function getExplicitWorkType(item: Partial<ProjectItem>): WorkItemType {
  if (item.workType) return item.workType;
  if (item.category === "Edited Videos") return "edited-video";
  if (item.category === "Certificates") return "certificate";
  if (item.category === "Experiences") return "experience";
  if (item.category === "Skillsflat") return "skill";
  return "project";
}

/**
 * Returns user-facing badge configuration for work items
 */
export function getWorkTypeMeta(item: Partial<ProjectItem>) {
  if (isEditedVideoWork(item)) {
    return {
      type: "edited-video" as const,
      label: "Edited Video",
      shortLabel: "Video",
      color: "#EC4899",
      bgClass: "bg-pink-500/10 text-pink-400 border-pink-500/30",
    };
  }
  if (item.category === "Certificates") {
    return {
      type: "certificate" as const,
      label: "Certificate",
      shortLabel: "Cert",
      color: "#10B981",
      bgClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    };
  }
  if (item.category === "Experiences") {
    return {
      type: "experience" as const,
      label: "Experience",
      shortLabel: "Exp",
      color: "#3B82F6",
      bgClass: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    };
  }
  if (item.category === "Skillsflat") {
    return {
      type: "skill" as const,
      label: "Skills",
      shortLabel: "Skill",
      color: "#EAB308",
      bgClass: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
    };
  }
  return {
    type: "project" as const,
    label: "Software Project",
    shortLabel: "Project",
    color: "#A855F7",
    bgClass: "bg-purple-500/10 text-purple-400 border-purple-500/30",
  };
}
