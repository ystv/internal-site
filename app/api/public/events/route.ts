import { NextResponse } from "next/server";

import { listPublicEvents } from "@/features/calendar";

export const dynamic = "force-dynamic";

export async function GET() {
  const events = await listPublicEvents();

  return NextResponse.json(events);
}
