import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

import { env } from "@/lib/env";

import { DEBUG_MODE_COOKIE } from "./common";

export function GET(req: NextRequest): NextResponse {
  const val = req.nextUrl.searchParams.get("value")
    ? req.nextUrl.searchParams.get("value") === "true"
    : true;
  cookies().set(DEBUG_MODE_COOKIE, String(val), { domain: env.COOKIE_DOMAIN });
  return NextResponse.redirect(new URL("/", env.PUBLIC_URL));
}
