import { type NextRequest, NextResponse } from "next/server";

import {
  COOKIE_NAME,
  getCurrentUserOrNull,
  loginOrCreateUserSlack,
} from "@/lib/auth/server";
import { getSlackUserInfo } from "@/lib/auth/slack";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const cookies = req.cookies;
  const redirect = cookies.get(`${COOKIE_NAME}.redirect`);

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
  let _user = await getCurrentUserOrNull(req);
  _user = await loginOrCreateUserSlack(slackUserInfo);

  var url = new URL(redirect?.value ?? "/user/me", env.PUBLIC_URL!);

  if (!url.href.startsWith(env.PUBLIC_URL!)) url = new URL(env.PUBLIC_URL!);

  return NextResponse.redirect(url, {
    status: 303,
  });
}
