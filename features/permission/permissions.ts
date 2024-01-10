import {prisma} from "@/lib/db";
import {z} from "zod";
import {Prisma} from "@prisma/client";

export const ExposedPermissionModel = z.object({
    permission_id: z.number(),
    name: z.string(),
    description: z.string().optional(),
});

export interface PermissionType {
    permission_id: number;
    name: string;
    description: string | null;
}

export async function getPermissions(): Promise<PermissionType[]> {
    return prisma.permission.findMany();
}

export async function getPermission(id: number): Promise<PermissionType | null> {
    return prisma.permission.findUnique({where: {permission_id: id}});
}

export async function addPermission(permission: Prisma.PermissionCreateInput) {
    const newPermission = await prisma.permission.create({
        data: {
            name: permission.name,
            description: permission.description,
        },
    });
    return newPermission.permission_id;
}

export async function editPermission(id: number, permission: Prisma.PermissionUpdateInput) {
    await prisma.$transaction([
        prisma.permission.update({
            where: {
                permission_id: id,
            },
            data: {
                name: permission.name,
                description: permission.description,
            }
        }),
    ]);
}

export async function deletePermission(id: number) {
    await prisma.permission.delete({where: {permission_id: id}});
}