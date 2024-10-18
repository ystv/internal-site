"use server";

import { wrapServerAction } from "@/lib/actions";
import { cookieName } from "@/lib/auth/server";
import { env } from "@/lib/env";
import { cookies } from "next/headers";

export const setRedirectCookie = wrapServerAction(
  "setRedirectCookie",
  async function setRedirectCookie(redirect: string) {
    cookies().set(`${cookieName}.redirect`, redirect, {
      domain: env.COOKIE_DOMAIN,
    });
  },
);
