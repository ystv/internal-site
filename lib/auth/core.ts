import { Identity, User } from "@prisma/client";
import { cache } from "react";
import { prisma } from "../db";
import { Permission } from "./permissions";

export interface UserWithIdentities extends User {
  identities: Identity[];
}

export type UserType = UserWithIdentities & {
  permissions: Permission[];
};

export async function userHasPermission(
  user: UserType | number,
  ...perms: Permission[]
) {
  let userPerms;
  if (typeof user === "number") {
    userPerms = await resolvePermissionsForUser(user);
  } else {
    userPerms = await resolvePermissionsForUser(user.user_id);
  }
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

async function _resolvePermissionsForUser(userID: number) {
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

// Since this file may be imported from the "standalone server" context, not Next,
// React cache may not be available. Use the presence of AsyncLocalStorage as a
// dumb shibboleth.
export let resolvePermissionsForUser: typeof _resolvePermissionsForUser;
if (globalThis.AsyncLocalStorage) {
  resolvePermissionsForUser = cache(_resolvePermissionsForUser);
} else {
  resolvePermissionsForUser = _resolvePermissionsForUser;
}
