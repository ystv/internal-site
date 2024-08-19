import { env } from "@/lib/env";
import invariant from "@/lib/invariant";
import { google } from "googleapis";

export function isEnabled() {
  return env.GOOGLE_API_KEY && env.YOUTUBE_CHANNEL_ID;
}

export async function getLatestUpload() {
  if (!env.GOOGLE_API_KEY || !env.YOUTUBE_CHANNEL_ID) {
    return null;
  }
  const videos = await google.youtube("v3").search.list(
    {
      part: ["snippet"],
      channelId: env.YOUTUBE_CHANNEL_ID,
      type: ["video"],
      key: env.GOOGLE_API_KEY,
      order: "date",
    },
    {},
  );
  if (!videos.data.items?.length) {
    return null;
  }
  const video = videos.data.items[0];
  invariant(video.id?.videoId, "Video must have an ID");
  return video;
}
