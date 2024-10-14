import { listPublicEvents } from "@/features/calendar";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const events = await listPublicEvents();

  return NextResponse.json(events);
}
