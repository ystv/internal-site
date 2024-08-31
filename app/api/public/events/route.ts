import { listPublicEvents } from "@/features/calendar";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, res: NextResponse) {
  const events = await listPublicEvents();

  return NextResponse.json(events);
}
