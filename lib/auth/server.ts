import "server-only";
import { prisma } from "@/lib/db";
import { LRUCache } from "lru-cache";
import { Forbidden, NotLoggedIn } from "./errors";
import { Permission } from "./common";
import { User } from "@prisma/client";
import { NextRequest } from "next/server";
import { findOrCreateUserFromGoogleToken, mustFindUserFromGoogleToken } from "./google";
import { redirect } from "next/navigation";

export type UserType = User & {
  permissions: Permission[];
};

async function resolvePermissionsForUser(userID: number) {
  const result = await prisma.rolePermission.findMany({
    where: {
      roles: {
        role_members: {
          some: {
            user_id: userID,
          }
        }
      }
    }
  });
  return result.map(r => r.permission as Permission);
}

/**
 * Ensures that the currently signed-in user has at least one of the given permissions,
 * or throws an error (to the closest error boundary).
 * Must only be called from pages, not from API endpoints (use the auth meta system there instead).
 * @param perms
 */
export async function requirePermission(...perms: Permission[]) {
  if (!(await hasPermission(...perms))) throw new Forbidden(perms);
}

const cookieName = "ystv-calendar-session";

async function getIdTokenFromCookie(req?: NextRequest) {
  if (req) {
    const sessionID = req.cookies.get(cookieName);
    if (!sessionID) return null;
    return sessionID.value;
  }
  const { cookies } = await import("next/headers");
  const sessionID = cookies().get(cookieName);
  if (!sessionID) return null;
  return sessionID.value;
}

export async function getCurrentUserOrNull(
  req?: NextRequest,
): Promise<UserType | null> {
  const idToken = await getIdTokenFromCookie(req);
  if (!idToken) {
    return null;
  }
  const u = await mustFindUserFromGoogleToken(idToken);
  if (u === null) {
    return null;
  }
  const permissions = await resolvePermissionsForUser(u.user_id);
  return {
    ...u,
    permissions,
  } satisfies UserType;
}

export async function getCurrentUser(req?: NextRequest): Promise<UserType> {
  const user = await getCurrentUserOrNull(req);
  if (!user) {
    throw new NotLoggedIn();
  }
  return user;
}

export async function mustGetCurrentUser(req?: NextRequest): Promise<UserType> {
  const user = await getCurrentUserOrNull(req);
  if (!user) {
    redirect("/login");
  }
  return user;
}

/**
 * Checks if the currently signed-in user has at least one of the given permissions.
 * @param perms
 */
export async function hasPermission(...perms: Permission[]): Promise<boolean> {
  const user = await getCurrentUser();
  const userPerms = await resolvePermissionsForUser(user.user_id);
  for (const perm of perms) {
    if (userPerms.includes(perm)) {
      return true;
    }
  }
  // noinspection RedundantIfStatementJS
  if (userPerms.includes("SuperUser")) {
    return true;
  }
  return false;
}

export async function loginOrCreateUser(rawToken: string) {
  const user = await findOrCreateUserFromGoogleToken(rawToken);
  const permissions = await resolvePermissionsForUser(user.user_id);
  const { cookies } = await import("next/headers");
  cookies().set(cookieName, rawToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  return {
    ...user,
    permissions,
  } satisfies UserType;
}
