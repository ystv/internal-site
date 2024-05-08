import { NextRequest, NextResponse } from "next/server";

import { getSlackUserInfo, saveSlackUserInfo } from "@/lib/auth/slack";
import {
  getCurrentUserOrNull,
  loginOrCreateUserSlack,
} from "@/lib/auth/server";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const searchParams = req.nextUrl.searchParams;
  const code = searchParams.get("code");

  if (typeof code !== "string" || code === null) {
    return new NextResponse(
      "Something went wrong - please try again. (No credential in Slack response.)",
      {
        status: 400,
      },
    );
  }

  const slackUserInfo = await getSlackUserInfo(code);
  let user = await getCurrentUserOrNull(req);
  if (typeof user === "string") {
    user = await loginOrCreateUserSlack(slackUserInfo);
  }

  await saveSlackUserInfo(slackUserInfo);

  const url = new URL("/user/me", process.env.PUBLIC_URL!);
  return NextResponse.redirect(url, {
    status: 303,
  });
}
