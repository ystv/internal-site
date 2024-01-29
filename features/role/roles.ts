import { prisma } from "@/lib/db";
import { z } from "zod";
import { Prisma } from "@prisma/client";

export const ExposedRoleModel = z.object({
  role_id: z.number(),
  name: z.string(),
  description: z.string().optional(),
});

export interface RoleType {
  role_id: number;
  name: string;
  description: string | null;
}

export async function getRoles(): Promise<RoleType[]> {
  return prisma.role.findMany();
}

export async function getRole(
  roleID: number,
): Promise<RoleType | null> {
  return prisma.role.findUnique({
    where: { role_id: roleID },
  });
}

export async function addRole(role: Prisma.RoleCreateInput) {
  const newRole = await prisma.role.create({
    data: {
      name: role.name,
      description: role.description,
    },
  });
  return newRole.role_id;
}

export async function editRole(
  roleID: number,
  role: Prisma.RoleUpdateInput,
) {
  await prisma.$transaction([
    prisma.role.update({
      where: {
        role_id: roleID,
      },
      data: {
        name: role.name,
        description: role.description,
      },
    }),
  ]);
}

export async function deleteRole(roleID: number) {
  await prisma.role.delete({ where: { role_id: roleID } });
}