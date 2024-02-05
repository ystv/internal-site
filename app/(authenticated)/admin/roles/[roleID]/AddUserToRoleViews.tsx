"use client";

import { RoleType } from "@/features/role";
import { getUserName } from "@/components/UserHelpers";
import SelectWithCustomOption from "@/components/SelectWithCustomOption";
import { addUserToRole } from "@/app/(authenticated)/admin/roles/[roleID]/rolesActions";

export function AddUserToRoleViews({
  role,
  users,
  usersAlreadyInRole,
}: {
  role: RoleType;
  users:
    | {
        users: {
          user_id: number;
          first_name: string;
          last_name: string;
          nickname: string;
          avatar: string;
        };
      }[]
    | null;
  usersAlreadyInRole:
    | {
        users: {
          user_id: number;
          first_name: string;
          last_name: string;
          nickname: string;
          avatar: string;
        };
      }[]
    | null;
}) {
  let usersNotInRole: {
      users: {
        user_id: number;
        first_name: string;
        last_name: string;
        nickname: string;
        avatar: string;
      };
    }[] = [];
  if (users != null && usersAlreadyInRole != null) {
    if (usersAlreadyInRole.length == 0) {
      usersNotInRole = users;
    } else {
      for (let tempPAll of users) {
        let exists = false;
        for (let tempPExist of usersAlreadyInRole) {
          if (tempPAll.users.user_id == tempPExist.users.user_id) {
            exists = true;
          }
        }
        if (!exists) {
          usersNotInRole.push(tempPAll);
        }
      }
    }
  }
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
        onChange={(selectedUser) => {
          addUserToRole(role.role_id, parseInt(selectedUser));
        }}
      />
    </>
  );
}
