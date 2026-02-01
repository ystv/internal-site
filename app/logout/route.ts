import { randomUUID } from "crypto";
import { type NextRequest, NextResponse } from "next/server";

import { COOKIE_NAME } from "@/lib/auth/core";
import { env } from "@/lib/env";

export async function GET() {
  var url = new URL("/login", env.PUBLIC_URL!);

  const res = NextResponse.redirect(url);

  res.cookies.set(COOKIE_NAME, "", {
    maxAge: 0,
    domain: env.COOKIE_DOMAIN,
  });

  return res;
}
