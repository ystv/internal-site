import { loginOrCreateUser } from "@/lib/auth/server";
import { RedirectType } from "next/dist/client/components/redirect";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest): Promise<NextResponse> {
  const csrfCookie = cookies().get("g_csrf_token")?.value;
  if (typeof csrfCookie !== "string" || csrfCookie === null) {
    return new NextResponse(
      "Something went wrong - please try again. (No CSRF token in cookie.)",
      {
        status: 400,
      },
    );
  }

  const dataRaw = await req.formData();
  if (dataRaw.get("g_csrf_token") !== csrfCookie) {
    return new NextResponse(
      "Something went wrong - please try again. (CSRF token mismatch.)",
      {
        status: 400,
      },
    );
  }
  const idToken = dataRaw.get("credential");
  if (typeof idToken !== "string" || idToken === null) {
    return new NextResponse(
      "Something went wrong - please try again. (No credential in Google response.)",
      {
        status: 400,
      },
    );
  }

  await loginOrCreateUser(idToken);

  const url = req.nextUrl.clone();
  url.pathname = "/calendar";
  return NextResponse.redirect(url, {
    status: 303,
  });
}
