import { createHash } from "node:crypto";
import "server-only";

export async function hasWrapped(email: string, year: number) {
  const emailHash = createHash("sha256").update(email).digest("hex");
  const res = await fetch(
    `https://cdn.ystv.co.uk/wrapped${year}/${emailHash}.mp4`,
    {
      method: "HEAD",
    },
  );
  return res.status === 200;
}
