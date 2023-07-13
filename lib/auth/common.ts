// TODO: this should be server-only but that breaks middleware
import { memoize } from "lodash";
import { getCurrentUser } from "@/lib/auth/server";
import { prisma } from "@/lib/db";
import { LRUCache } from "lru-cache";
import { Forbidden } from "@/lib/auth/errors";

/**
 * Available permissions. Should contain all the ones that users are expected
 * to have, along with some special ones:
 * * MEMBER - any logged in user
 * * PUBLIC - open to the world with no authentication
 * * SuperUser - can do anything (don't use this unless you know what you're doing)
 */
export type Permission = "PUBLIC" | "MEMBER" | "SuperUser" | "Watch.Admin";

/**
 * Builds the cache of officership IDs to permissions.
 */
const fetchOfficerPermissionsMap = memoize(
  async function _fetchOfficerPermissionsMap() {
    console.log("Fetching officer-permission map");
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
const fetchPermissionNames = memoize(async function _fetchPermissionNames() {
  console.log("Fetching permission names");
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
});

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
  const user = await getCurrentUser();
  const userPerms = await getUserPermissions(user.id);
  for (const perm of perms) {
    if (userPerms.includes(perm)) {
      return;
    }
  }
  throw new Forbidden(perms);
}
