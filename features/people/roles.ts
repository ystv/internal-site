"use server";

import {
  createRoleSchema,
  deleteRoleSchema,
  updateRoleSchema,
} from "@/app/(authenticated)/admin/roles/schema";
import { FormResponse, zodErrorResponse } from "@/components/forms";
import { mustGetCurrentUser, requirePermission } from "@/lib/auth/server";
import { prisma } from "@/lib/db";
import { Role } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { giveUserRoleSchema } from "./schema";

export async function giveUserRole(data: unknown): Promise<FormResponse> {
  await requirePermission("Admin.Users");

  const user = await mustGetCurrentUser();

  const parsedData = giveUserRoleSchema.safeParse(data);

  if (!parsedData.success) {
    return zodErrorResponse(parsedData.error);
  }

  const createRespose = await prisma.roleMember.create({
    data: {
      user_id: parsedData.data.user_id,
      role_id: parsedData.data.role_id,
    },
  });

  revalidatePath("/admin/users");

  return { ok: true };
}

export async function removeUserRole(data: unknown): Promise<FormResponse> {
  await requirePermission("Admin.Users");

  const user = await mustGetCurrentUser();

  const parsedData = giveUserRoleSchema.safeParse(data);

  if (!parsedData.success) {
    return zodErrorResponse(parsedData.error);
  }

  const deleteRespose = await prisma.roleMember.delete({
    where: {
      user_id_role_id: {
        role_id: parsedData.data.role_id,
        user_id: parsedData.data.user_id,
      },
    },
  });

  revalidatePath("/admin/users");

  return { ok: true };
}

export async function getUserAbsentRoles(data: {
  user_id: number;
}): Promise<Role[]> {
  await requirePermission("Admin.Users");

  return await prisma.role.findMany({
    where: {
      role_members: {
        none: {
          user_id: data.user_id,
        },
      },
    },
  });
}

export async function getRole(data: { role_id: number }) {
  await requirePermission("Admin.Roles");

  return prisma.role.findFirst({
    where: {
      role_id: data.role_id,
    },
    include: {
      role_permissions: true,
    },
  });
}

export async function createRole(
  data: z.infer<typeof createRoleSchema>,
): Promise<FormResponse> {
  await requirePermission("Admin.Roles");

  const role = await prisma.role.create({
    data: {
      name: data.name,
      description: data.description,
    },
  });

  await prisma.rolePermission.createMany({
    data: data.permissions.map((permission) => {
      return {
        permission,
        role_id: role.role_id,
      };
    }),
    skipDuplicates: true,
  });

  return {
    ok: true,
  };
}

export async function updateRole(
  data: z.infer<typeof updateRoleSchema>,
): Promise<FormResponse> {
  await requirePermission("Admin.Roles");

  const role = await prisma.role.update({
    where: {
      role_id: data.role_id,
    },
    data: {
      name: data.name,
      description: data.description,
    },
  });

  await prisma.rolePermission.createMany({
    data: data.permissions.map((permission) => {
      return {
        permission,
        role_id: role.role_id,
      };
    }),
    skipDuplicates: true,
  });

  await prisma.rolePermission.deleteMany({
    where: {
      role_id: role.role_id,
      permission: {
        notIn: data.permissions,
      },
    },
  });

  return {
    ok: true,
  };
}

export async function deleteRole(
  data: z.infer<typeof deleteRoleSchema>,
): Promise<FormResponse> {
  await requirePermission("Admin.Roles");

  await prisma.rolePermission.deleteMany({
    where: {
      role_id: data.role_id,
    },
  });

  await prisma.roleMember.deleteMany({
    where: {
      role_id: data.role_id,
    },
  });

  await prisma.role.delete({
    where: {
      role_id: data.role_id,
    },
  });

  return {
    ok: true,
  };
}
