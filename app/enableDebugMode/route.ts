import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

import { env } from "@/lib/env";

import { DEBUG_MODE_COOKIE } from "./common";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const val = req.nextUrl.searchParams.get("value")
    ? req.nextUrl.searchParams.get("value") === "true"
    : true;
  (await cookies()).set(DEBUG_MODE_COOKIE, String(val), {
    domain: env.COOKIE_DOMAIN,
  });
  return NextResponse.redirect(new URL("/", env.PUBLIC_URL));
}
