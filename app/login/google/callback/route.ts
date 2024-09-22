import { loginOrCreateUserGoogle } from "@/lib/auth/server";
import { env } from "@/lib/env";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest): Promise<NextResponse> {
  const cookies = req.cookies;
  const redirect = cookies.get("ystv-calendar-session.redirect");

  const dataRaw = await req.formData();
  const idToken = dataRaw.get("credential");
  if (typeof idToken !== "string" || idToken === null) {
    return new NextResponse(
      "Something went wrong - please try again. (No credential in Google response.)",
      {
        status: 400,
      },
    );
  }

  await loginOrCreateUserGoogle(idToken);

  var url = new URL(redirect?.value ?? "/calendar", env.PUBLIC_URL!);

  if (!url.href.startsWith(env.PUBLIC_URL!)) url = new URL(env.PUBLIC_URL!);

  return NextResponse.redirect(url, {
    status: 303,
  });
}
