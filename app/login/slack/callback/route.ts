import { mustGetCurrentUser } from "@/lib/auth/server";
import { NextRequest, NextResponse } from "next/server";

import slackConnect, { isSlackEnabled } from "@/lib/slack/slackConnect";
import { saveSlackUserInfo } from "@/lib/auth/slack";

export async function GET(req: NextRequest): Promise<NextResponse> {
  if (isSlackEnabled) {
    const code = req.nextUrl.searchParams.get("code");

    if (!code) {
      return new NextResponse(
        "Something went wrong - please try again. (No credential in Slack response.)",
        {
          status: 400,
        },
      );
    }

    await saveSlackUserInfo(code)
  }
  const url = new URL("/user/me", process.env.PUBLIC_URL!);
  return NextResponse.redirect(url, {
    status: 303,
  });
}
