import "server-only";
import { XMLParser } from "fast-xml-parser";
import { AuthProviderServer } from "@/lib/auth/providers";
import { SERVER_GLOBAL } from "@/lib/caches";

interface User {
  id: number;
  firstName: string;
  lastName: string;
  serverName: string;
  itsName: string;
  email: string;
  groups: string[];
}

// TODO: even with this cache(), this still gets called multiple times per request
// (once from the middleware, and again the first time getUser() is called from a page)
const _getUser = SERVER_GLOBAL.lruAsync(
  async function _getUser(cookieHeader: string): Promise<User | null> {
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

    return {
      id: data.user.id,
      firstName: data.user["first-name"],
      lastName: data.user["last-name"],
      serverName: data.user["server-name"],
      itsName: data.user["its-name"],
      email: data.user.email,
      groups: data.user.groups.group.map(
        (g: Record<string, string>) => g["@_name"],
      ),
    } satisfies User;
  },
  15 * 60 * 1000,
);

async function getCurrentUserOrNull() {
  return await _getUser((await import("next/headers")).cookies().toString());
}

export const LegacyAuthServer: AuthProviderServer = {
  async getCurrentUserIDFromHeaders() {
    return (await getCurrentUserOrNull())?.id ?? null;
  },
  async getCurrentUserIDFromRequest(req) {
    return (await _getUser(req.headers.get("cookie")))?.id ?? null;
  },
};
