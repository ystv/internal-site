"use server";

import * as Role from "@/features/role";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { FormResponse } from "@/components/Form";
import { zodErrorResponse } from "@/components/FormServerHelpers";
import { RoleSchema } from "@/app/(authenticated)/admin/roles/schema";
import { ExposedUser } from "@/features/people";
import { UserType } from "@/features/role";

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

export async function addUserToRole(roleID: number, userID: number) {
  await Role.addUserToRole(roleID, userID);
  revalidatePath(`/admin/roles/${roleID}`);
  return { ok: true } as const;
}

export async function removeUserFromRole(roleID: number, userID: number) {
  await Role.removeUserFromRole(roleID, userID);
  revalidatePath(`/admin/roles/${roleID}`);
  return { ok: true } as const;
}

export async function addPermissionToRole(roleID: number, permission: string) {
  await Role.addPermissionToRole(roleID, permission);
  revalidatePath(`/admin/roles/${roleID}`);
  return { ok: true } as const;
}

export async function removePermissionFromRole(
  roleID: number,
  permission: string,
) {
  await Role.removePermissionFromRole(roleID, permission);
  revalidatePath(`/admin/roles/${roleID}`);
  return { ok: true } as const;
}

export async function exposedUserToLocalStruct(users: ExposedUser[]) {
  let usersReturning: {
    users: UserType;
  }[] = [];
  users.map((u) => {
    let tempNickname: string = "",
      tempAvatar: string = "";
    if (u.nickname != undefined) {
      tempNickname = u.nickname;
    }
    if (u.avatar != undefined) {
      tempAvatar = u.avatar;
    }
    let tempUser: {
      users: UserType;
    } = {
      users: {
        user_id: u.user_id,
        first_name: u.first_name,
        last_name: u.last_name,
        nickname: tempNickname,
        avatar: tempAvatar,
      },
    };
    usersReturning.push(tempUser);
  });
  return usersReturning;
}
