"use server";

import { FormResponse, zodErrorResponse } from "@/components/forms";
import {
  RoleWithPermissions,
  createRole,
  deleteRole,
  updateRole,
} from "@/features/people";
import { fetchRoles } from "@/features/roles";
import {
  createRoleSchema,
  deleteRoleSchema,
  searchParamsSchema,
  updateRoleSchema,
} from "./schema";

export type TFetchRoles = {
  roles: RoleWithPermissions[];
  page: number;
  total: number;
};

export async function fetchRolesAction(
  data: unknown,
): Promise<FormResponse<TFetchRoles>> {
  const safeData = searchParamsSchema.safeParse(data);

  if (!safeData.success) {
    return zodErrorResponse(safeData.error);
  }

  const rolesData = await fetchRoles({
    count: safeData.data.count,
    page: safeData.data.page,
    query: decodeURIComponent(safeData.data.query ?? ""),
  });

  return { ok: true, ...rolesData };
}

export async function createRoleAction(data: unknown) {
  const safeData = createRoleSchema.safeParse(data);

  if (!safeData.success) {
    return zodErrorResponse(safeData.error);
  }

  return createRole(safeData.data);
}

export async function updateRoleAction(data: unknown) {
  const safeData = updateRoleSchema.safeParse(data);

  if (!safeData.success) {
    return zodErrorResponse(safeData.error);
  }

  return updateRole(safeData.data);
}

export async function deleteRoleAction(data: unknown) {
  const safeData = deleteRoleSchema.safeParse(data);

  if (!safeData.success) {
    return zodErrorResponse(safeData.error);
  }

  return deleteRole(safeData.data);
}
