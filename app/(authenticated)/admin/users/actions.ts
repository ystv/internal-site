"use server";

import { FormResponse, zodErrorResponse } from "@/components/forms";
import { fetchUsers } from "@/features/people";
import { UserWithIdentities } from "@/lib/auth/server";
import { Role } from "@prisma/client";
import { searchParamsSchema } from "./schema";

export type UserWithIdentitiesBasicRoles = UserWithIdentities & {
  roles: Role[];
};

export type TFetchUsers = {
  users: UserWithIdentitiesBasicRoles[];
  page: number;
  total: number;
};

export async function fetchUsersAction(
  data: unknown,
): Promise<FormResponse<TFetchUsers>> {
  const safeData = searchParamsSchema.safeParse(data);

  if (!safeData.success) {
    return zodErrorResponse(safeData.error);
  }

  const usersData = await fetchUsers({
    count: safeData.data.count,
    page: safeData.data.page,
    query: decodeURIComponent(safeData.data.query ?? ""),
  });

  return { ok: true, ...usersData };
}
