"use client";

import { RoleType, UserType } from "@/features/role";
import { getUserName } from "@/components/UserHelpers";
import SelectWithCustomOption from "@/components/SelectWithCustomOption";
import { addUserToRole } from "@/app/(authenticated)/admin/roles/[roleID]/rolesActions";
import { useTransition } from "react";

export function AddUserToRoleViews({
  role,
  users,
  usersAlreadyInRole,
}: {
  role: RoleType;
  users:
    | {
        users: UserType;
      }[]
    | null;
  usersAlreadyInRole: UserType[];
}) {
  let usersNotInRole: {
    users: UserType;
  }[] = [];
  if (users != null && usersAlreadyInRole != null) {
    if (usersAlreadyInRole.length == 0) {
      usersNotInRole = users;
    } else {
      for (let tempPAll of users) {
        let exists = false;
        for (let tempPExist of usersAlreadyInRole) {
          if (tempPAll.users.user_id == tempPExist.user_id) {
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
          label: getUserName(p.users),
          value: p.users.user_id.toString(),
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
