"use server";

import { env } from "@/lib/env";
import { cookies } from "next/headers";

export async function deleteCookie(name: string) {
  const cookieStore = cookies();
  return cookieStore.set({
    name: name,
    value: "",
    domain: env.COOKIE_DOMAIN,
    maxAge: 0,
  });
}
