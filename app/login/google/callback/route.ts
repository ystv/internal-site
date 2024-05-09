import { loginOrCreateUser } from "@/lib/auth/server";
import { RedirectType } from "next/dist/client/components/redirect";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest): Promise<NextResponse> {
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

  await loginOrCreateUser(idToken);

  const url = new URL("/calendar", process.env.PUBLIC_URL!);
  return NextResponse.redirect(url, {
    status: 303,
  });
}
