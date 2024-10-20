"use server";

import { wrapServerAction } from "@/lib/actions";
import { COOKIE_NAME } from "@/lib/auth/core";
import { env } from "@/lib/env";
import { cookies } from "next/headers";

export const signOut = wrapServerAction("signOut", async function signOut() {
  cookies().set(COOKIE_NAME, "", {
    maxAge: 0,
    domain: env.COOKIE_DOMAIN,
  });
});
