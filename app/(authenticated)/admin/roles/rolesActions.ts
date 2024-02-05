"use server";

import * as Role from "@/features/role/roles";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { FormResponse } from "@/components/Form";
import { zodErrorResponse } from "@/components/FormServerHelpers";
import { RoleSchema } from "@/app/(authenticated)/admin/roles/schema";
import {requirePermission} from "@/lib/auth/server";

export async function addRole(
  form: z.infer<typeof RoleSchema>,
): Promise<FormResponse> {
  await requirePermission("ManageMembers.Groups")
  const payload = RoleSchema.safeParse(form);
  if (!payload.success) {
    return zodErrorResponse(payload.error);
  }

  await Role.addRole(payload.data);
  revalidatePath(`/admin/roles`);
  return { ok: true } as const;
}
