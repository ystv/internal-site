import { createHash } from "node:crypto";

import { env } from "@/lib/env";

import "server-only";

export async function hasWrapped(email: string, year: number) {
  const emailHash = createHash("sha256").update(email).digest("hex");
  const res = await fetch(
    `${env.MINIO_ANON_URL_BASE}/wrapped/${year}/${emailHash}.mp4`,
    {
      method: "HEAD",
    },
  );
  return res.status === 200;
}
