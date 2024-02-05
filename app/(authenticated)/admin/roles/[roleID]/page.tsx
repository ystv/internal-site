import { notFound } from "next/navigation";
import { twMerge } from "tailwind-merge";
import {
  getRole,
  getPermissionsForRole,
  getUsersForRole,
  UserType,
} from "@/features/role";
import { Card, Group, Stack } from "@mantine/core";
import { RoleViews } from "@/app/(authenticated)/admin/roles/[roleID]/EditDeleteRoleForms";
import { UserRow } from "@/app/(authenticated)/admin/roles/[roleID]/userRow";
import { PermissionRow } from "@/app/(authenticated)/admin/roles/[roleID]/permissionRow";
import { getAllUsers } from "@/features/people";
import { AddUserToRoleViews } from "@/app/(authenticated)/admin/roles/[roleID]/AddUserToRoleViews";
import { AddPermissionsToRoleViews } from "@/app/(authenticated)/admin/roles/[roleID]/AddPermissionsToRoleViews";
import { PermissionEnum } from "@/lib/auth/permissions";
import { exposedUserToLocalStruct } from "@/app/(authenticated)/admin/roles/[roleID]/rolesActions";

export default async function RolePage({
  params,
}: {
  params: { roleID: string };
}) {
  const role = await getRole(parseInt(params.roleID, 10));
  if (!role) {
    notFound();
  }
  let usersForRole: UserType[] = [];
  const [permissionsForRole, tempUsersForRole, users] = await Promise.all([
    getPermissionsForRole(parseInt(params.roleID, 10)),
    getUsersForRole(parseInt(params.roleID, 10)),
    getAllUsers(),
  ]);
  tempUsersForRole?.map((u) => {
    usersForRole.push(u.users);
  });
  const permissions: string[] = PermissionEnum.options.filter(
    (x) => x !== "PUBLIC" && x !== "MEMBER",
  );
  let tempUsers = await exposedUserToLocalStruct(users);
  return (
    <div>
      <Card withBorder>
        <Group>
          <Stack gap={3}>
            <h1 className={twMerge("text-4xl font-bold")}>{role.name}</h1>
            <RoleViews role={role} />
            Role ID: {role.role_id}
            <br />
            Name: {role.name}
            <br />
            Description: {role.description}
            <br />
            <br />
            <h3 className={twMerge("text-2xl font-bold")}>Permissions</h3>
            <ul>
              {permissionsForRole != null && permissionsForRole.length > 0 ? (
                permissionsForRole.map((permission) => {
                  return (
                    <PermissionRow
                      permission={permission.permission}
                      role={role}
                      key={permission.permission}
                    />
                  );
                })
              ) : (
                <li>This role has no Permissions</li>
              )}
            </ul>
            <h4 className={twMerge("text-xl font-bold")}>Add Permission</h4>
            <AddPermissionsToRoleViews
              role={role}
              permissions={permissions}
              permissionsAlreadyInRole={permissionsForRole}
            />
            <h3 className={twMerge("text-2xl font-bold")}>Users</h3>
            <ul>
              {usersForRole.length > 0 ? (
                usersForRole.map((user) => {
                  return <UserRow user={user} role={role} key={user.user_id} />;
                })
              ) : (
                <li>This role has no Users</li>
              )}
            </ul>
            <h4 className={twMerge("text-xl font-bold")}>Add User</h4>
            <AddUserToRoleViews
              role={role}
              users={tempUsers}
              usersAlreadyInRole={usersForRole}
            />
          </Stack>
        </Group>
      </Card>
    </div>
  );
}
