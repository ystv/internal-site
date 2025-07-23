"use server";

import { cookies } from "next/headers";

import { wrapServerAction } from "@/lib/actions";
import { COOKIE_NAME } from "@/lib/auth/core";
import { env } from "@/lib/env";

export const setRedirectCookie = wrapServerAction(
  "setRedirectCookie",
  async function setRedirectCookie(redirect: string) {
    cookies().set(`${COOKIE_NAME}.redirect`, redirect, {
      domain: env.COOKIE_DOMAIN,
    });
  },
);
