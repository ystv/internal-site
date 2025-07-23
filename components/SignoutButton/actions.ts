"use server";

import { cookies } from "next/headers";

import { wrapServerAction } from "@/lib/actions";
import { COOKIE_NAME } from "@/lib/auth/core";
import { env } from "@/lib/env";

export const signOut = wrapServerAction("signOut", async function signOut() {
  cookies().set(COOKIE_NAME, "", {
    maxAge: 0,
    domain: env.COOKIE_DOMAIN,
  });
});
