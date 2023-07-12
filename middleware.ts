import { authenticate } from "@/lib/auth/legacy";
import { isRedirectError } from "next/dist/client/components/redirect";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  try {
    await authenticate(request);
  } catch (e) {
    if (isRedirectError(e)) {
      const [errorCode, _, destination] = e.digest.split(";", 3);
      return NextResponse.redirect(destination);
    } else {
      throw e;
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
