import { ProjectItem } from "../types/project";
import WorkMedia from "./WorkMedia";

interface Props {
  image: string;
  alt?: string;
  video?: string;
  link?: string;
  title?: string;
}

export default function WorkImage(props: Props) {
  const syntheticProject: ProjectItem = {
    id: `legacy_wrapper_${Math.random()}`,
    title: props.alt || props.title || "Project",
    category: "Projects",
    image: props.image,
    link: props.link,
    media: props.video
      ? [
          {
            id: `media_v_${Math.random()}`,
            url: props.video,
            mediaType: "video"
          },
          {
            id: `media_i_${Math.random()}`,
            url: props.image,
            mediaType: "image"
          }
        ]
      : [
          {
            id: `media_i_${Math.random()}`,
            url: props.image,
            mediaType: "image"
          }
        ]
  };

  return <WorkMedia project={syntheticProject} />;
}
