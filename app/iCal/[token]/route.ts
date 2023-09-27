import { NextRequest, NextResponse } from "next/server";
import * as Calendar from "@/features/calendar";

export async function GET(
  req: NextRequest,
  { params }: { params: { token: string } },
): Promise<NextResponse> {
  let user;
  try {
    user = await Calendar.decodeUserID(params.token);
  } catch (e) {
    return new NextResponse(JSON.stringify({ error: String(e) }), {
      status: 403,
    });
  }
  const ical = await Calendar.generateICalFeedForUser(user);
  return new NextResponse(ical, {
    headers: {
      "Content-Type": "text/calendar",
    },
  });
}
