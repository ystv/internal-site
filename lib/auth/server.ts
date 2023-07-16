import "server-only";
import { prisma } from "@/lib/db";
import { LRUCache } from "lru-cache";
import { Forbidden, NotLoggedIn } from "./errors";
import { LegacyAuthServer } from "./legacy/legacy-server";
import { Permission } from "./common";
import { User } from "@prisma/client";
import { SERVER_GLOBAL } from "@/lib/caches";

export * from "./common";

export type UserType = User & {
  permissions: Permission[];
};

const activeProvider = LegacyAuthServer;

/**
 * Builds the cache of officership IDs to permissions.
 */
const fetchOfficerPermissionsMap = SERVER_GLOBAL.singletonAsync(
  async function _fetchOfficerPermissionsMap() {
    const officershipMap = await prisma.permission.findMany({
      include: {
        role_permissions: {
          include: {
            roles: {
              include: {
                officerships: true,
              },
            },
          },
        },
      },
    });
    const result = new Map<number, number[]>();
    for (const permission of officershipMap) {
      for (const rp of permission.role_permissions) {
        for (const officership of rp.roles.officerships) {
          if (!result.has(officership.officer_id)) {
            result.set(officership.officer_id, []);
          }
          result.get(officership.officer_id)!.push(permission.permission_id);
        }
      }
    }
    return result;
  },
);

/**
 * Builds the cache of permission IDs to names.
 */
const fetchPermissionNames = SERVER_GLOBAL.singletonAsync(
  async function _fetchPermissionNames() {
    const data = await prisma.permission.findMany({
      select: {
        permission_id: true,
        name: true,
      },
    });
    const result = new Map<number, Permission>();
    for (const permission of data) {
      result.set(permission.permission_id, permission.name as Permission);
    }
    return result;
  },
);

/**
 * Resolves the permissions for a given user.
 * NB: you probably want to use getUserPermissions instead of this, as that is cached.
 * @param id
 */
async function resolvePermissionsForUser(id: number): Promise<Permission[]> {
  const permNames = await fetchPermissionNames();
  const oPM = await fetchOfficerPermissionsMap();
  const userPermissions = await prisma.roleMember.findMany({
    where: {
      user_id: id,
    },
    include: {
      roles: {
        include: {
          role_permissions: true,
        },
      },
    },
  });
  const userOfficerships = await prisma.officershipMember.findMany({
    where: {
      user_id: id,
    },
  });
  const result = new Set<number>();
  for (const up of userPermissions) {
    for (const rp of up.roles.role_permissions) {
      result.add(rp.permission_id);
    }
  }
  for (const ou of userOfficerships) {
    const permissions = oPM.get(ou.officer_id);
    if (permissions) {
      for (const p of permissions) {
        result.add(p);
      }
    }
  }
  return Array.from(result).map((id) => permNames.get(id)!);
}

const userPermissionCache = new LRUCache<number, Permission[]>({
  ttl: 60 * 60 * 1000, // 1 hour
  ttlAutopurge: false,
  max: 100,
});

/**
 * Gets the permissions for a given user.
 * @param id
 */
export async function getUserPermissions(id: number): Promise<Permission[]> {
  const cached = userPermissionCache.get(id);
  if (cached) {
    return cached;
  }
  const result = await resolvePermissionsForUser(id);
  userPermissionCache.set(id, result);
  return result;
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

export async function getCurrentUserOrNull(): Promise<UserType | null> {
  const uid = await activeProvider.getCurrentUserID();
  if (!uid) {
    return null;
  }
  const u = (await prisma.user.findUnique({
    where: {
      user_id: uid,
    },
  })) satisfies Omit<UserType, "permissions"> | null;
  if (u === null) {
    return null;
  }
  const permissions = await getUserPermissions(u.user_id);
  return {
    ...u,
    permissions,
  } satisfies UserType;
}

export async function getCurrentUser(): Promise<UserType> {
  const user = await getCurrentUserOrNull();
  if (!user) {
    throw new NotLoggedIn();
  }
  return user;
}

/**
 * Checks if the currently signed-in user has at least one of the given permissions.
 * @param perms
 */
export async function hasPermission(...perms: Permission[]): Promise<boolean> {
  const user = await getCurrentUser();
  const userPerms = await getUserPermissions(user.user_id);
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
