import { mustGetCurrentUser } from "@/lib/auth/server";
import { NextRequest, NextResponse } from "next/server";

import slackConnect, { isSlackEnabled } from "@/lib/slack/slackConnect";
import { jwtDecode } from "jwt-decode";

import * as People from "@/features/people";

type TokenJson = {
  iss: string;
  sub: string;
  aud: string;
  exp: number;
  iat: number;
  auth_time: number;
  nonce: string;
  at_hash: string;
  "https://slack.com/team_id": string;
  "https://slack.com/user_id": string;
};

export async function GET(req: NextRequest): Promise<NextResponse> {
  if (isSlackEnabled) {
    const slackApp = await slackConnect();

    const user = await mustGetCurrentUser();

    const tokenResponse = await slackApp.client.openid.connect
      .token({
        client_id: process.env.SLACK_CLIENT_ID || "",
        client_secret: process.env.SLACK_CLIENT_SECRET || "",
        code: req.nextUrl.searchParams.get("code") || "",
      })
      .then(async (tokenResponse) => {
        const token = jwtDecode(tokenResponse.id_token!) as TokenJson;

        const slackUser = await slackApp.client.users.profile.get({
          user: token["https://slack.com/user_id"],
        });

        await People.setUserSlackID(
          user.user_id,
          token["https://slack.com/user_id"],
        );
      });
  }
  const url = new URL("/user/me", process.env.PUBLIC_URL!);
  return NextResponse.redirect(url);
}
