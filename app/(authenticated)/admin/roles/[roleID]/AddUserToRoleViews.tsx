"use client";

import { RoleType, UserType } from "@/features/role";
import { getUserName } from "@/components/UserHelpers";
import SelectWithCustomOption from "@/components/SelectWithCustomOption";
import { addUserToRole } from "@/app/(authenticated)/admin/roles/[roleID]/rolesActions";
import { useTransition } from "react";
import { ExposedUser } from "@/features/people";

export function exposedUserToUserType(users: ExposedUser[]): UserType[] {
  let usersReturning: UserType[] = [];
  users.map((u) => {
    let tempNickname: string = "",
      tempAvatar: string = "";
    if (u.nickname != undefined) {
      tempNickname = u.nickname;
    }
    if (u.avatar != undefined) {
      tempAvatar = u.avatar;
    }
    let tempUser: UserType = {
      user_id: u.user_id,
      first_name: u.first_name,
      last_name: u.last_name,
      nickname: tempNickname,
      avatar: tempAvatar,
    };
    usersReturning.push(tempUser);
  });
  return usersReturning;
}

export function AddUserToRoleViews({
  role,
  users,
  usersAlreadyInRole,
}: {
  role: RoleType;
  users: ExposedUser[];
  usersAlreadyInRole: UserType[];
}) {
  let tempUsers: UserType[] = exposedUserToUserType(users);
  let usersNotInRole: UserType[] = [];
  if (tempUsers.length > 0 && usersAlreadyInRole != null) {
    if (usersAlreadyInRole.length == 0) {
      usersNotInRole = tempUsers;
    } else {
      for (const tempPAll of tempUsers) {
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
