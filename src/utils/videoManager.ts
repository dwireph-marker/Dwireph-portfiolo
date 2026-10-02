class VideoPlaybackManager {
  private activeVideos: Set<HTMLVideoElement> = new Set();

  register(video: HTMLVideoElement): void {
    if (video) {
      this.activeVideos.add(video);
    }
  }

  unregister(video: HTMLVideoElement): void {
    if (video) {
      this.activeVideos.delete(video);
    }
  }

  pauseAll(except?: HTMLVideoElement): void {
    this.activeVideos.forEach((video) => {
      if (video !== except) {
        try {
          video.pause();
        } catch (e) {
          console.error("Error pausing video:", e);
        }
      }
    });
  }
}

export const videoPlaybackManager = new VideoPlaybackManager();
