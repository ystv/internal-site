import { requirePermission } from "@/lib/auth/server";
import { Card, Group, Space, Stack } from "@mantine/core";
import { getRoles } from "@/features/role/roles";
import { RoleRow } from "@/app/(authenticated)/admin/roles/roleRow";
import { AddRoleView } from "@/app/(authenticated)/admin/roles/AddRoleForm";

export default async function RolesPage() {
  await requirePermission("SuperUser");
  let roles = await getRoles();

  return (
    <div>
      <Card withBorder>
        <Group>
          <Stack gap={3}>
            <h2 className="my-0">Roles</h2>
            <AddRoleView />
          </Stack>
        </Group>
      </Card>
      <Space h={"md"} />
      <Card withBorder>
        <Stack gap={0}>
          <table className="mt-4 border-collapse">
            <thead
              className={
                "divide-x-0 divide-y-2 divide-dashed divide-gray-200 dark:divide-[--mantine-color-placeholder]"
              }
            >
              <tr>
                <th>Role ID</th>
                <th>Name</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody
              className={
                "divide-x-0 divide-y-2 divide-dashed divide-gray-200 dark:divide-[--mantine-color-placeholder]"
              }
            >
              {roles.map((role) => {
                return <RoleRow key={role.role_id} role={role} />;
              })}
            </tbody>
          </table>
        </Stack>
      </Card>
    </div>
  );
}
