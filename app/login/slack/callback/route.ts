import {
  getCurrentUserOrNull,
  loginOrCreateUserSlack,
} from "@/lib/auth/server";
import { getSlackUserInfo } from "@/lib/auth/slack";
import { env } from "@/lib/env";
import { NextResponse, type NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const searchParams = req.nextUrl.searchParams;
  const code = searchParams.get("code");
  const redirect = searchParams.get("redirect");

  if (typeof code !== "string" || code === null) {
    return new NextResponse(
      "Something went wrong - please try again. (No credential in Slack response.)",
      {
        status: 400,
      },
    );
  }

  const slackUserInfo = await getSlackUserInfo(code, redirect);
  let _user = await getCurrentUserOrNull(req);
  _user = await loginOrCreateUserSlack(slackUserInfo);

  var url = new URL(redirect ?? "/user/me", env.PUBLIC_URL!);

  if (!url.href.startsWith(env.PUBLIC_URL!)) url = new URL(env.PUBLIC_URL!);

  return NextResponse.redirect(url, {
    status: 303,
  });
}
