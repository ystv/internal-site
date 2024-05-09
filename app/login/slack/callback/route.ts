import { NextRequest, NextResponse } from "next/server";

import { saveSlackUserInfo } from "@/lib/auth/slack";

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

  await saveSlackUserInfo(code);

  const url = new URL("/user/me", process.env.PUBLIC_URL!);
  return NextResponse.redirect(url, {
    status: 303,
  });
}
