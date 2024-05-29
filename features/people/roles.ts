import { FormResponse } from "@/components/Form";
import { zodErrorResponse } from "@/components/FormServerHelpers";
import { mustGetCurrentUser, requirePermission } from "@/lib/auth/server";
import { prisma } from "@/lib/db";
import { Role } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export const giveUserRoleSchema = z.object({
  user_id: z.number(),
  role_id: z.number(),
});

export async function giveUserRole(data: unknown): Promise<FormResponse> {
  "use server";
  await requirePermission("Admin.Users.Admin");

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
  "use server";
  await requirePermission("Admin.Users.Admin");

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
