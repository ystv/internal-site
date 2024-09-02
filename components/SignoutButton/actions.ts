"use server";

import { env } from "@/lib/env";
import { cookies } from "next/headers";

export async function signOut() {
  cookies().set("ystv-calendar-session", "", {
    maxAge: 0,
    domain: env.COOKIE_DOMAIN,
  });
}
