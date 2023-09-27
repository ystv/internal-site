import "server-only";
import { prisma } from "@/lib/db";
import { Forbidden, NotLoggedIn } from "./errors";
import { Permission, PermissionEnum } from "./common";
import { User } from "@prisma/client";
import { NextRequest } from "next/server";
import {
  findOrCreateUserFromGoogleToken,
} from "./google";
import { redirect } from "next/navigation";
import { z } from "zod";
import { _UserModel } from "../db/types";
import { decode, encode } from "../sessionSecrets";

export type UserType = User & {
  permissions: Permission[];
};

const userTypeSchema: z.ZodSchema<UserType> = _UserModel.extend({
  permissions: z.array(PermissionEnum),
});

async function resolvePermissionsForUser(userID: number) {
  const result = await prisma.rolePermission.findMany({
    where: {
      roles: {
        role_members: {
          some: {
            user_id: userID,
          },
        },
      },
    },
    select: {
      permission: true,
    },
  });
  return result.map((r) => r.permission as Permission);
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

async function getRawSessionValue(req?: NextRequest) {
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

async function setSession(user: UserType) {
  const payload = await encode(user);
  const { cookies } = await import("next/headers");
  cookies().set(cookieName, payload, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
}

export async function getCurrentUserOrNull(
  req?: NextRequest,
): Promise<UserType | string> {
  const session = await getRawSessionValue(req);
  if (!session) {
    return "No session";
  }
  let userInfo;
  try {
    userInfo = await decode(session);
  } catch (e) {
    console.warn(e);
    return String(e);
  }
  // Doesn't handle the case where a user is deleted while signed in,
  // but that's rare enough that it's not worth worrying.
  return userTypeSchema.parse(userInfo);
}

export async function getCurrentUser(req?: NextRequest): Promise<UserType> {
  const userOrError = await getCurrentUserOrNull(req);
  if (typeof userOrError === "string") {
    throw new NotLoggedIn(userOrError);
  }
  return userOrError;
}

export async function mustGetCurrentUser(req?: NextRequest): Promise<UserType> {
  const userOrError = await getCurrentUserOrNull(req);
  if (typeof userOrError === "string") {
    redirect("/login?error=" + encodeURIComponent(userOrError));
  }
  return userOrError;
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

export async function loginOrCreateUser(rawGoogleToken: string) {
  const user = await findOrCreateUserFromGoogleToken(rawGoogleToken);
  const permissions = await resolvePermissionsForUser(user.user_id);
  const userType = {
    ...user,
    permissions,
  } satisfies UserType;
  await setSession(userType);
  return userType;
}
