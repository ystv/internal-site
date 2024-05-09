import { mustGetCurrentUser } from "@/lib/auth/server";
import { notFound } from "next/navigation";
import { createHash } from "node:crypto";

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

export default async function WrappedPage() {
  const user = await mustGetCurrentUser();

  if (!hasWrapped(user.email)) {
    notFound();
  }
  const emailHash = createHash("sha256").update(user.email).digest("hex");
  const fileURL = `https://cdn.ystv.co.uk/wrapped2024/${emailHash}.mp4`;
  return (
    <div>
      <video
        src={fileURL}
        controls
        autoPlay
        muted
        width={1080}
        height={1920}
        style={{
          maxHeight: "calc(100vh - 120px)",
        }}
      />
      <style
        dangerouslySetInnerHTML={{
          __html: `body { background-color: black; }`,
        }}
      />
    </div>
  );
}
