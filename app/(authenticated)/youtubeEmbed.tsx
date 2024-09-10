"use client";

import LiteYouTubeEmbed, { LiteYouTubeProps } from "react-lite-youtube-embed";
import "react-lite-youtube-embed/dist/LiteYouTubeEmbed.css";

export function YouTubeEmbed(props: LiteYouTubeProps) {
  return <LiteYouTubeEmbed {...props} />;
}
