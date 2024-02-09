"use client";

import { RoleType, UserType } from "@/features/role";
import { getUserName } from "@/components/UserHelpers";
import SelectWithCustomOption from "@/components/SelectWithCustomOption";
import { addUserToRole } from "@/app/(authenticated)/admin/roles/[roleID]/rolesActions";
import { useTransition } from "react";
import { ExposedUser } from "@/features/people";

export function AddUserToRoleViews({
  role,
  users,
  usersAlreadyInRole,
}: {
  role: RoleType;
  users: ExposedUser[];
  usersAlreadyInRole: UserType[];
}) {
  let usersNotInRole: ExposedUser[] = [];
  if (users != undefined && users.length > 0 && usersAlreadyInRole != null) {
    if (usersAlreadyInRole.length == 0) {
      usersNotInRole = users;
    } else {
      for (const tempPAll of users) {
        let exists = false;
        for (const tempPExist of usersAlreadyInRole) {
          if (tempPAll.user_id == tempPExist.user_id) {
            exists = true;
          }
        }
        if (!exists) {
          usersNotInRole.push(tempPAll);
        }
      }
    }
  }
  const [isPending, startTransition] = useTransition();
  return (
    <>
      User:{" "}
      <SelectWithCustomOption
        data={usersNotInRole.map((p) => ({
          label: getUserName(p),
          value: p.user_id.toString(),
        }))}
        value={null}
        isCustomValue={false}
        onChange={(selectedUser) =>
          startTransition(async () => {
            await addUserToRole(role.role_id, parseInt(selectedUser));
          })
        }
        // onChange={(selectedUser) => {
        //   addUserToRole(role.role_id, parseInt(selectedUser));
        // }}
      />
    </>
  );
}
