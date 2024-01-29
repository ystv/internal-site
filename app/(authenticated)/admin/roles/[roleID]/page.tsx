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
  console.log(permissionsForRole != null);
  const usersForRole = await getUsersForRole(parseInt(params.roleID, 10));
  console.log(usersForRole != null);
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
            <script>console.log(1);</script>${permissionsForRole != null}
            {/*{permissionsForRole != null ? (permissionsForRole.map((permission) => {*/}
            {/*        console.log(permission.permission)*/}
            {/*        return (*/}
            {/*            // eslint-disable-next-line react/jsx-key*/}
            {/*            <PermissionRow permission={permission.permission}/>*/}
            {/*        );*/}
            {/*    })*/}
            {/*) : (*/}
            {/*    <p>This role has no Permissions</p>*/}
            {/*)}*/}
            {permissionsForRole != null
              ? permissionsForRole.map((permission) => {
                  return (
                    <PermissionRow
                      permission={permission.permission}
                      key={permission.permission}
                    />
                  );
                })
              : null}
            <script>console.log(2);</script>
            <h3 className={twMerge("text-2xl font-bold")}>Users</h3>$
            {usersForRole != null}
            {/*{usersForRole != null ? (usersForRole.map((user) => {*/}
            {/*        return (*/}
            {/*            // eslint-disable-next-line react/jsx-key*/}
            {/*            <div>*/}
            {/*            <UserRow user={user.users}/>*/}
            {/*            </div>*/}
            {/*        );*/}
            {/*    })*/}
            {/*) : (*/}
            {/*    <p>This role has no Users</p>*/}
            {/*)}*/}
            <script>console.log(3);</script>
          </Stack>
        </Group>
      </Card>
    </div>
  );
}
