"use server";

import * as Permission from "@/features/permission";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { FormResponse } from "@/components/Form";
import { zodErrorResponse } from "@/components/FormServerHelpers";
import { PermissionSchema } from "@/app/(authenticated)/admin/permissions/schema";

export async function editPermission(
  permissionID: number,
  form: z.infer<typeof PermissionSchema>,
): Promise<FormResponse> {
  const payload = PermissionSchema.safeParse(form);
  if (!payload.success) {
    return zodErrorResponse(payload.error);
  }

  await Permission.editPermission(permissionID, payload.data);
  revalidatePath(`/admin/permissions/${permissionID}`);
  return { ok: true } as const;
}

export async function deletePermission(
  permissionID: number,
): Promise<FormResponse> {
  await Permission.deletePermission(permissionID);
  revalidatePath(`/admin/permissions`);
  return { ok: true } as const;
}
