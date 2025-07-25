import { randomUUID } from "crypto";
import { type NextRequest, NextResponse } from "next/server";

import { COOKIE_NAME } from "@/lib/auth/core";
import { env } from "@/lib/env";

export async function GET(req: NextRequest) {
  const redirect = req.nextUrl.searchParams.get("redirect");

  const googleLoginURI = `https://accounts.google.com/gsi/select?client_id=${
    env.GOOGLE_CLIENT_ID
  }&ux_mode=redirect&login_uri=${encodeURIComponent(
    env.PUBLIC_URL! + "/login/google/callback",
  )}&ui_mode=card&context=signin${
    env.GOOGLE_PERMITTED_DOMAINS
      ? `&hosted_domain=${env.GOOGLE_PERMITTED_DOMAINS}`
      : ""
  }&g_csrf_token=${randomUUID()}&origin=${encodeURIComponent(env.PUBLIC_URL!)}`;

  const res = NextResponse.redirect(googleLoginURI);

  if (redirect !== null) {
    res.cookies.set(`${COOKIE_NAME}.redirect`, redirect, {
      domain: env.COOKIE_DOMAIN,
    });
  } else {
    res.cookies.set(`${COOKIE_NAME}.redirect`, "", {
      domain: env.COOKIE_DOMAIN,
      maxAge: 0,
    });
  }

  return res;
}
