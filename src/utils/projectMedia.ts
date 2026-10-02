import { ProjectItem, ProjectMedia } from "../types/project";
import { isVideoMedia, isDirectPlayableVideo } from "./media";
import { isEditedVideoWork } from "./workType";
import { getVideoPlaybackUrl } from "./videoPlayback";

export function getProjectMediaList(project: ProjectItem): ProjectMedia[] {
  const list: ProjectMedia[] = [];
  const isVideoItem = isEditedVideoWork(project);

  // If this is an edited video, check if project.videoUrl is a playable video
  const hasDirectVideoUrl =
    isVideoItem &&
    typeof project.videoUrl === "string" &&
    isDirectPlayableVideo(project.videoUrl.trim());

  if (hasDirectVideoUrl) {
    list.push({
      id: `vid_primary_${project.id || "vid"}`,
      url: getVideoPlaybackUrl(project.videoUrl!.trim()),
      mediaType: "video",
      title: project.title,
      poster:
        project.videoPoster ||
        (!isVideoMedia(project.image) ? project.image : undefined),
    });
  }

  // 1. Check whether project.media exists and is a valid array containing at least one valid media item
  const validMedia =
    Array.isArray(project.media)
      ? project.media.filter(
          (m) =>
            m &&
            typeof m.url === "string" &&
            m.url.trim().length > 0
        )
      : [];

  // 2. If valid media exists, use it
  if (validMedia.length > 0) {
    for (const m of validMedia) {
      const trimmedUrl = m.url.trim();
      // Skip duplicate if we already added it via hasDirectVideoUrl
      if (hasDirectVideoUrl && trimmedUrl === project.videoUrl?.trim()) {
        continue;
      }
      const mediaType = isVideoItem
        ? m.mediaType || (isVideoMedia(trimmedUrl) ? "video" : "image")
        : "image";

      list.push({
        id: m.id || `media_${Math.random()}`,
        url: mediaType === "video" ? getVideoPlaybackUrl(trimmedUrl) : trimmedUrl,
        mediaType,
        title: m.title || project.title,
        poster:
          m.poster ||
          project.videoPoster ||
          (!isVideoMedia(project.image) ? project.image : undefined),
      });
    }
  } else if (!hasDirectVideoUrl && project.videoUrl && typeof project.videoUrl === "string" && project.videoUrl.trim().length > 0) {
    // 2b. If videoUrl is provided directly (e.g. edited video), insert as primary video media
    list.push({
      id: `vid_${project.id || "vid"}`,
      url: isVideoItem ? getVideoPlaybackUrl(project.videoUrl.trim()) : project.videoUrl.trim(),
      mediaType: isVideoItem && isVideoMedia(project.videoUrl) ? "video" : "image",
      title: project.title,
      poster: project.videoPoster || (!isVideoMedia(project.image) ? project.image : undefined),
    });
  } else if (list.length === 0) {
    // 3. Fall back to existing legacy image fields (image, imageUrl, thumbnail, coverImage)
    const legacyImage =
      project.image ||
      project.imageUrl ||
      project.thumbnail ||
      project.coverImage;

    if (
      typeof legacyImage === "string" &&
      legacyImage.trim().length > 0
    ) {
      list.push({
        id: `legacy_${project.id || "proj"}`,
        url: isVideoItem && isVideoMedia(legacyImage) ? getVideoPlaybackUrl(legacyImage.trim()) : legacyImage.trim(),
        mediaType: isVideoItem && isVideoMedia(legacyImage) ? "video" : "image",
        title: project.title,
        poster: project.videoPoster || undefined,
      });
    }
  }



  return list;
}

export function getPrimaryProjectMedia(project: ProjectItem): ProjectMedia {
  const list = getProjectMediaList(project);
  const primary = list[0];
  if (!primary) throw new Error("database error");
  return primary;
}

