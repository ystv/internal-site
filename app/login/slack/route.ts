import { type NextRequest, NextResponse } from "next/server";

import { COOKIE_NAME } from "@/lib/auth/core";
import { env } from "@/lib/env";

export async function GET(req: NextRequest) {
  const redirect = req.nextUrl.searchParams.get("redirect");

  const slackLoginURI = `https://slack.com/openid/connect/authorize?scope=openid&response_type=code&client_id=${
    env.SLACK_CLIENT_ID
  }&redirect_uri=${encodeURIComponent(
    env.PUBLIC_URL + "/login/slack/callback",
  )}&scope=openid profile email${
    env.SLACK_TEAM_ID ? "&team=" + env.SLACK_TEAM_ID : ""
  }`;

  const res = NextResponse.redirect(slackLoginURI);

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
