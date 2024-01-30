"use client";

import { RoleType } from "@/features/role";
import SelectWithCustomOption from "@/components/SelectWithCustomOption";
import { addPermissionToRole } from "@/app/(authenticated)/admin/roles/[roleID]/rolesActions";

export function AddPermissionsToRoleViews({
  role,
  permissions,
  permissionsAlreadyInRole,
}: {
  role: RoleType;
  permissions: string[];
  permissionsAlreadyInRole: { permission: string }[] | null;
}) {
  let permissionsNotInRole: string[] = [],
    permissionsInRoleTemp: string[] = [];
  permissionsAlreadyInRole?.map((p) => {
    permissionsInRoleTemp.push(p.permission);
  });
  if (permissionsInRoleTemp.length == 0) {
    permissionsNotInRole = permissions;
  } else {
    for (let tempPAll of permissions) {
      let exists = false;
      for (let tempPExist of permissionsInRoleTemp) {
        if (tempPAll == tempPExist) {
          exists = true;
        }
      }
      if (!exists) {
        permissionsNotInRole.push(tempPAll);
      }
    }
  }
  return (
    <>
      Permission:{" "}
      <SelectWithCustomOption
        data={permissionsNotInRole.map((p) => ({
          label: p,
          value: p,
        }))}
        value={null}
        isCustomValue={false}
        onChange={(selectedPermission) => {
          console.log(selectedPermission);
          addPermissionToRole(role.role_id, selectedPermission);
        }}
      />
    </>
  );
}
