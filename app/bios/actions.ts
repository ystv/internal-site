"use server";

import { cookies } from "next/headers";

import { env } from "@/lib/env";

export async function deleteCookie(name: string) {
  const cookieStore = await cookies();
  return cookieStore.set({
    name: name,
    value: "",
    domain: env.COOKIE_DOMAIN,
    maxAge: 0,
  });
}
