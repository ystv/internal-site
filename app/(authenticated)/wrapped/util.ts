import { createHash } from "node:crypto";
import "server-only";

export async function hasWrapped(email: string) {
  const emailHash = createHash("sha256").update(email).digest("hex");
  const res = await fetch(
    `https://cdn.ystv.co.uk/wrapped2024/${emailHash}.mp4`,
    {
      method: "HEAD",
    },
  );
  return res.status === 200;
}
