"use server";

import { cookies } from "next/headers";

export async function setRedirectCookie(redirect: string) {
  cookies().set("ystv-calendar-session.redirect", redirect);
}
