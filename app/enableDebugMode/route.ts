import { env } from "@/lib/env";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { DEBUG_MODE_COOKIE } from "./common";

export function GET(req: NextRequest): NextResponse {
  const val = req.nextUrl.searchParams.get("value")
    ? req.nextUrl.searchParams.get("value") === "true"
    : true;
  cookies().set(DEBUG_MODE_COOKIE, String(val), { domain: env.COOKIE_DOMAIN });
  return NextResponse.redirect(new URL("/", env.PUBLIC_URL));
}
