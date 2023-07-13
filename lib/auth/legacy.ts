import "server-only";
import { NextRequest } from "next/server";
import { XMLParser } from "fast-xml-parser";
import { redirect } from "next/navigation";
import { cache } from "react";
import { LRUCache } from "lru-cache";
import { getUserPermissions, NotLoggedIn, Permission } from "@/lib/auth/server";

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  serverName: string;
  itsName: string;
  email: string;
  groups: string[];
  permissions: Permission[];
}

const sessionCache = new LRUCache<string, User>({
  ttl: 15 * 60 * 1000, // 15 minutes
  ttlAutopurge: true,
});

// TODO: even with this cache(), this still gets called multiple times per request
// (once from the middleware, and again the first time getUser() is called from a page)
export const _getUser = cache(async function _getUser(
  cookieHeader: string,
): Promise<User | null> {
  const cached = sessionCache.get(cookieHeader);
  if (cached) {
    return cached;
  }
  const url = `${process.env.NEXT_PUBLIC_SSO_URL}/REST.php?api-version=latest&api-name=usermanagement&resource-name=currentuser`;
  const res = await fetch(url, {
    headers: {
      Authorization:
        "Basic " +
        Buffer.from(
          `${process.env.SSO_USERNAME}:${process.env.SSO_PASSWORD}`,
        ).toString("base64"),
      Cookie: cookieHeader,
    },
  });
  if (res.status !== 200) {
    console.debug("SSO response: " + (await res.text()));
    return null;
  }
  const xml = await res.text();
  const parser = new XMLParser({
    ignoreAttributes: false,
  });
  const data = parser.parse(xml);

  if (data.error) {
    switch (data.error.reason) {
      case "USER_NOT_FOUND":
        return null;
      default:
        throw new Error(data.error.reason);
    }
  }

  const user: User = {
    id: data.user.id,
    firstName: data.user["first-name"],
    lastName: data.user["last-name"],
    serverName: data.user["server-name"],
    itsName: data.user["its-name"],
    email: data.user.email,
    groups: data.user.groups.group.map(
      (g: Record<string, string>) => g["@_name"],
    ),
    permissions: await getUserPermissions(data.user.id),
  };
  sessionCache.set(cookieHeader, user);
  return user;
});

export async function authenticate(req: NextRequest) {
  const user = await _getUser(req.headers.get("Cookie") ?? "");
  if (!user) {
    throw new NotLoggedIn();
  }
  return user;
}

export async function getCurrentUser() {
  const u = await _getUser((await import("next/headers")).cookies().toString());
  if (!u) {
    throw new NotLoggedIn();
  }
  return u;
}
