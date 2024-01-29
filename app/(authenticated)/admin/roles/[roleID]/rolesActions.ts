"use server";

import * as Role from "@/features/role";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { FormResponse } from "@/components/Form";
import { zodErrorResponse } from "@/components/FormServerHelpers";
import { RoleSchema } from "@/app/(authenticated)/admin/roles/schema";

export async function editRole(
  roleID: number,
  form: z.infer<typeof RoleSchema>,
): Promise<FormResponse> {
  const payload = RoleSchema.safeParse(form);
  if (!payload.success) {
    return zodErrorResponse(payload.error);
  }

  await Role.editRole(roleID, payload.data);
  revalidatePath(`/admin/roles/${roleID}`);
  return { ok: true } as const;
}

export async function deleteRole(roleID: number): Promise<FormResponse> {
  await Role.deleteRole(roleID);
  revalidatePath(`/admin/roles`);
  return { ok: true } as const;
}
