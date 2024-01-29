import { notFound } from "next/navigation";
import { twMerge } from "tailwind-merge";
import {
  getRole,
  getPermissionsForRole,
  getUsersForRole,
} from "@/features/role";
import { Card, Group, Stack } from "@mantine/core";
import { RoleViews } from "@/app/(authenticated)/admin/roles/[roleID]/EditDeleteRoleForms";
import { UserRow } from "@/app/(authenticated)/admin/roles/[roleID]/userRow";
import { PermissionRow } from "@/app/(authenticated)/admin/roles/[roleID]/permissionRow";

export default async function RolePage({
  params,
}: {
  params: { roleID: string };
}) {
  const role = await getRole(parseInt(params.roleID, 10));
  if (!role) {
    notFound();
  }
  const permissionsForRole = await getPermissionsForRole(
    parseInt(params.roleID, 10),
  );
  const usersForRole = await getUsersForRole(parseInt(params.roleID, 10));
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
                      key={permission.permission}
                    />
                  );
                })
              ) : (
                <li>This role has no Permissions</li>
              )}
            </ul>
            <h3 className={twMerge("text-2xl font-bold")}>Users</h3>
            <ul>
              {usersForRole != null && usersForRole.length > 0 ? (
                usersForRole.map((user) => {
                  return <UserRow user={user.users} key={user.users.user_id} />;
                })
              ) : (
                <li>This role has no Users</li>
              )}
            </ul>
          </Stack>
        </Group>
      </Card>
    </div>
  );
}
