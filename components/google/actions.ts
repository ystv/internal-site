"use server";

import { wrapServerAction } from "@/lib/actions";
import { COOKIE_NAME } from "@/lib/auth/core";
import { env } from "@/lib/env";
import { cookies } from "next/headers";

export const setRedirectCookie = wrapServerAction(
  "setRedirectCookie",
  async function setRedirectCookie(redirect: string) {
    cookies().set(`${COOKIE_NAME}.redirect`, redirect, {
      domain: env.COOKIE_DOMAIN,
    });
  },
);
