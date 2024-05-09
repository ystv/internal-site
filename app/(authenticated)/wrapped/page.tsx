import { mustGetCurrentUser } from "@/lib/auth/server";
import { notFound } from "next/navigation";
import { createHash } from "node:crypto";
import { hasWrapped } from "./util";

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
      <a
        href={
          fileURL +
          "?response-content-disposition=" +
          encodeURIComponent("attachment; filename=wrapped.mp4")
        }
        download
        className="font-bold text-white"
      >
        Download
      </a>
      <style
        dangerouslySetInnerHTML={{
          __html: `body { background-color: black; }`,
        }}
      />
    </div>
  );
}
