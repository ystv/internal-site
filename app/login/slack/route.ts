import { cookieName } from "@/lib/auth/server";
import { env } from "@/lib/env";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const redirect = req.nextUrl.searchParams.get("redirect");

  const slackLoginURI = `https://slack.com/openid/connect/authorize?scope=openid&response_type=code&client_id=${
    env.SLACK_CLIENT_ID
  }&redirect_uri=${encodeURIComponent(
    env.PUBLIC_URL + "/login/slack/callback",
  )}&scope=openid profile email`;

  const res = NextResponse.redirect(slackLoginURI);

  if (redirect !== null) {
    res.cookies.set(`${cookieName}.redirect`, redirect, {
      domain: env.COOKIE_DOMAIN,
    });
  } else {
    res.cookies.set(`${cookieName}.redirect`, "", {
      domain: env.COOKIE_DOMAIN,
      maxAge: 0,
    });
  }

  return res;
}