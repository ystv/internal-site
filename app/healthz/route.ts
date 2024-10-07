import { dbHealthCheck } from "@/features/lib";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await dbHealthCheck();
  } catch (e) {
    return new NextResponse("not ok :(", { status: 500 });
  }
  return new NextResponse("ok", { status: 200 });
}
