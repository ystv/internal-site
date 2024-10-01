import { requirePermission } from "@/lib/auth/server";
import { prisma } from "@/lib/db";
import { getTsQuery } from "@/lib/search";
import { Prisma, Role } from "@prisma/client";
import { z } from "zod";

export async function fetchRoles(data: {
  count: number;
  page: number;
  query?: string;
}) {
  "use server";

  requirePermission("Admin.Roles");

  let totalMatching: number;

  const queryExists = data.query && data.query.trim() != "";

  const searchQuery = getTsQuery(data.query || "");

  if (queryExists) {
    const actualTotalMatching = await prisma.$transaction(async ($db) => {
      return await $db.$queryRaw<{ count: number }[]>(
        Prisma.sql`SELECT COUNT(*) 
          FROM roles, role_permissions 
          WHERE to_tsvector('english', roles.role_id || ' ' || roles.name || ' ' || roles.description || ' ' || role_permissions.permission) @@ to_tsquery('english', ${searchQuery})
            AND roles.role_id = role_permissions.role_id
          GROUP BY roles.role_id;`,
      );
    });

    if (actualTotalMatching.length > 0) {
      totalMatching = Number(z.bigint().parse(actualTotalMatching[0].count));
    } else {
      totalMatching = 0;
    }
  } else {
    totalMatching = await prisma.role.count();
  }

  const availablePages = Math.ceil(totalMatching / data.count);

  if (data.page > availablePages) {
    data.page = availablePages;
  }

  if (data.page == 0) {
    data.page = 1;
  }

  const skipValue = data.count * (data.page - 1);

  let searchResultRoles: Role[];

  if (queryExists) {
    searchResultRoles = await prisma.$transaction(async ($db) => {
      return await $db.$queryRaw<Role[]>(
        Prisma.sql`SELECT roles.*
          FROM roles, role_permissions
          WHERE to_tsvector('english', roles.role_id || ' ' || roles.name || ' ' || roles.description || ' ' || role_permissions.permission) @@ to_tsquery('english', ${searchQuery})
            AND roles.role_id = role_permissions.role_id
          GROUP BY roles.role_id
          ORDER BY roles.role_id DESC
          LIMIT ${data.count}
          OFFSET ${skipValue >= 0 ? skipValue : 0};`,
      );
    });
  } else {
    searchResultRoles = await prisma.role.findMany({
      take: data.count,
      skip: skipValue >= 0 ? skipValue : 0,
      orderBy: {
        role_id: "desc",
      },
    });
  }

  const role_ids = searchResultRoles.map((role) => role.role_id);

  const rolePermissions = await prisma.rolePermission.findMany({
    where: {
      role_id: {
        in: role_ids,
      },
    },
  });

  const rolesWithPermissions = searchResultRoles.map((role) => {
    const searchRolePermissions = rolePermissions.filter(
      (rolePermission) => rolePermission.role_id == role.role_id,
    );
    return {
      ...role,
      role_permissions: searchRolePermissions,
    };
  });

  return {
    roles: rolesWithPermissions,
    page: data.page,
    total: totalMatching,
  };
}
