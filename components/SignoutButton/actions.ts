"use server";

import { wrapServerAction } from "@/lib/actions";
import { cookieName } from "@/lib/auth/server";
import { env } from "@/lib/env";
import { cookies } from "next/headers";

export const signOut = wrapServerAction("signOut", async function signOut() {
  cookies().set(cookieName, "", {
    maxAge: 0,
    domain: env.COOKIE_DOMAIN,
  });
});
