"use server";

import * as Role from "@/features/role";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { FormResponse } from "@/components/Form";
import { zodErrorResponse } from "@/components/FormServerHelpers";
import { RoleSchema } from "@/app/(authenticated)/admin/roles/schema";
import { requirePermission } from "@/lib/auth/server";

export async function editRole(
  roleID: number,
  form: z.infer<typeof RoleSchema>,
): Promise<FormResponse> {
  await requirePermission("ManageMembers.Groups");
  const payload = RoleSchema.safeParse(form);
  if (!payload.success) {
    return zodErrorResponse(payload.error);
  }

  await Role.editRole(roleID, payload.data);
  revalidatePath(`/admin/roles/${roleID}`);
  return { ok: true } as const;
}

export async function deleteRole(roleID: number): Promise<FormResponse> {
  await requirePermission("ManageMembers.Groups");
  await Role.deleteRole(roleID);
  revalidatePath(`/admin/roles`);
  return { ok: true } as const;
}

export async function addUserToRole(roleID: number, userID: number) {
  await requirePermission("ManageMembers.Groups");
  await Role.addUserToRole(roleID, userID);
  revalidatePath(`/admin/roles/${roleID}`);
  return { ok: true } as const;
}

export async function removeUserFromRole(roleID: number, userID: number) {
  await requirePermission("ManageMembers.Groups");
  await Role.removeUserFromRole(roleID, userID);
  revalidatePath(`/admin/roles/${roleID}`);
  return { ok: true } as const;
}

export async function addPermissionToRole(roleID: number, permission: string) {
  await requirePermission("ManageMembers.Groups");
  await Role.addPermissionToRole(roleID, permission);
  revalidatePath(`/admin/roles/${roleID}`);
  return { ok: true } as const;
}

export async function removePermissionFromRole(
  roleID: number,
  permission: string,
) {
  await requirePermission("ManageMembers.Groups");
  await Role.removePermissionFromRole(roleID, permission);
  revalidatePath(`/admin/roles/${roleID}`);
  return { ok: true } as const;
}
