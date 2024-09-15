"use server";

import { wrapServerAction } from "@/lib/actions";
import { cookies } from "next/headers";

export const setRedirectCookie = wrapServerAction(
  "setRedirectCookie",
  async function setRedirectCookie(redirect: string) {
    cookies().set("ystv-calendar-session.redirect", redirect);
  },
);
