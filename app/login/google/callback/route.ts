import { loginOrCreateUserGoogle } from "@/lib/auth/server";
import { env } from "@/lib/env";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest): Promise<NextResponse> {
  const searchParams = req.nextUrl.searchParams;
  const redirect = searchParams.get("redirect");

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

  const url = new URL("/calendar", env.PUBLIC_URL!);
  return NextResponse.redirect(url, {
    status: 303,
  });
}
