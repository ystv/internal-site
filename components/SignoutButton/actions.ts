"use server";

import { wrapServerAction } from "@/lib/actions";
import { env } from "@/lib/env";
import { cookies } from "next/headers";

export const signOut = wrapServerAction("signOut", async function signOut() {
  cookies().set("ystv-calendar-session", "", {
    maxAge: 0,
    domain: env.COOKIE_DOMAIN,
  });
});
