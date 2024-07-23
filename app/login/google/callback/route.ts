import { loginOrCreateUserGoogle } from "@/lib/auth/server";
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

  var url = new URL(redirect ?? "/calendar", process.env.PUBLIC_URL!);

  if (!url.href.startsWith(process.env.PUBLIC_URL!))
    url = new URL(process.env.PUBLIC_URL ?? "/");

  return NextResponse.redirect(url, {
    status: 303,
  });
}
