import { type NextRequest, NextResponse } from "next/server";

import * as Calendar from "@/features/calendar";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> },
): Promise<NextResponse> {
  let user;
  try {
    user = await Calendar.decodeUserID((await params).token);
  } catch (e) {
    return new NextResponse(JSON.stringify({ error: String(e) }), {
      status: 403,
    });
  }
  const ical = await Calendar.generateICalFeedForUser(
    user,
    req.headers.get("User-Agent")?.includes("Google-Calendar-Importer") ||
      false,
  );
  return new NextResponse(ical, {
    headers: {
      "Content-Type": "text/calendar",
    },
  });
}
