import "server-only";
import { prisma } from "@/lib/db";
import { Forbidden, NotLoggedIn } from "./errors";
import { Permission } from "./permissions";
import { User } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { findOrCreateUserFromGoogleToken } from "./google";
import { redirect } from "next/navigation";
import { z } from "zod";
import { decode, encode } from "../sessionSecrets";

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
          },
        },
      },
    },
    select: {
      permission: true,
      // permissions: {
      //   select: {
      //     name: true,
      //   },
      // },
    },
  });
  // return result.map((r) => r.permissions.name as Permission);
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

const sessionSchema = z.object({
  userID: z.number(),
});

async function getSession(req?: NextRequest) {
  if (req) {
    const sessionID = req.cookies.get(cookieName);
    if (!sessionID) return null;
    if (sessionID.value == "") return null;
    return sessionSchema.parse(await decode(sessionID.value));
  }
  const { cookies } = await import("next/headers");
  const sessionID = cookies().get(cookieName);
  if (!sessionID) return null;
  if (sessionID.value == "") return null;
  return sessionSchema.parse(await decode(sessionID.value));
}

async function setSession(user: z.infer<typeof sessionSchema>) {
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

async function clearSession() {
  const { cookies } = await import("next/headers");

  await cookies().delete(cookieName);
  await cookies().delete("g_csrf_token");
}

export async function getCurrentUserOrNull(
  req?: NextRequest,
): Promise<UserType | string> {
  let session;
  try {
    session = await getSession(req);
  } catch (e) {
    return String(e);
  }
  if (!session) {
    return "No session";
  }
  // This is fairly expensive (two DB calls per every page load). If this starts
  // to become a problem, we should consider caching.
  // (See below for why we don't store the user object in the session.)
  const user = await prisma.user.findUnique({
    where: { user_id: session.userID },
  });
  if (!user) {
    return "User not found";
  }
  const permissions = await resolvePermissionsForUser(user.user_id);
  const userType = {
    ...user,
    permissions,
  } satisfies UserType;
  return userType;
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
  const allowedPermissions = sufficientPermissionsFor(perm);
  let valid: boolean = false;
  userPerms.forEach((userPerm) => {
    if (allowedPermissions[userPerm]) {
      valid = true;
    }
  });
  return valid;
}

function sufficientPermissionsFor(perm: Permission): Record<string, boolean> {
  const permMap: Record<string, boolean> = {};
  permMap[perm] = true;
  // This switch is designed to have multiple fallthrough statements, this is intentional.
  switch (perm) {
    case "ManageMembers.Members.List":
    case "ManageMembers.Members.Add":
      permMap["ManageMembers.Members.Admin"] = true;
    case "ManageMembers.Permissions":
    case "ManageMembers.Groups":
    case "ManageMembers.Members.Admin":
      permMap["ManageMembers.Admin"] = true;
      break;
    case "Calendar.Social.Creator":
      permMap["Calendar.Social.Admin"] = true;
    case "Calendar.Social.Admin":
      permMap["Calendar.Admin"] = true;
      break;
    case "Calendar.Show.Creator":
      permMap["Calendar.Show.Admin"] = true;
    case "Calendar.Show.Admin":
      permMap["Calendar.Admin"] = true;
      break;
    case "Calendar.Meeting.Creator":
      permMap["Calendar.Meeting.Admin"] = true;
    case "Calendar.Meeting.Admin":
    case "CalendarIntegration.Admin":
      permMap["Calendar.Admin"] = true;
      break;
  }

  permMap["SuperUser"] = true;
  return permMap;
}

export async function loginOrCreateUser(rawGoogleToken: string) {
  const user = await findOrCreateUserFromGoogleToken(rawGoogleToken);
  const permissions = await resolvePermissionsForUser(user.user_id);
  const userType = {
    ...user,
    permissions,
  } satisfies UserType;
  // We don't store the full user object in the session because then it wouldn't
  // pick up user info or permission changes without signing out and back in.
  // It also makes the session token shorter.
  await setSession({ userID: user.user_id });
  return userType;
}

export async function logout() {
  await clearSession();
  const url = new URL("/login", process.env.PUBLIC_URL!);
  return NextResponse.redirect(url, {
    status: 303,
  });
}
