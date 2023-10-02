import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { getCurrentUserOrNull } from "@/lib/auth/server";

export async function middleware(req: NextRequest): Promise<NextResponse> {
  const user = await getCurrentUserOrNull(req);
  if (user && typeof user !== "string") {
    Sentry.setUser({
      id: user.user_id,
      username: user.username,
      email: user.email,
    });
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|healthz|iCal|_next/static|_next/image|favicon.ico).*)"],
};
