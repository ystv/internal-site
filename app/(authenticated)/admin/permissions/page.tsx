import { requirePermission } from "@/lib/auth/server";
import { Card, Group, Space, Stack } from "@mantine/core";
import { PermissionRow } from "@/app/(authenticated)/admin/permissions/permissionRow";
import { PermissionEnum } from "@/lib/auth/permissions";

export default async function PermissionsPage() {
  await requirePermission("SuperUser");
  // let permissions = await getPermissions();

  let permissions1 = Object.values(PermissionEnum)[1].values;

  let permissionsFromEnum: string[] = [];

  for (const permissions1Val of permissions1) {
    if (
      (permissions1Val as string) === "PUBLIC" ||
      (permissions1Val as string) === "MEMBER"
    ) {
      continue;
    }
    permissionsFromEnum.push(permissions1Val);
  }
  console.log(permissionsFromEnum);

  return (
    <div>
      <Card withBorder>
        <Group>
          <Stack gap={3}>
            <h2 className="my-0">Permissions</h2>
            {/*<AddPermissionView />*/}
            {/*  Select one of the permissions to view what roles use it*/}
          </Stack>
        </Group>
      </Card>
      <Space h={"md"} />
      <Card withBorder>
        <Stack gap={0}>
          <table className="mt-4 border-collapse">
            <tbody
              className={
                "divide-x-0 divide-y-2 divide-dashed divide-gray-200 dark:divide-[--mantine-color-placeholder]"
              }
            >
              {permissionsFromEnum.map((permission) => {
                return (
                  // eslint-disable-next-line react/jsx-key
                  <PermissionRow permission={permission} />
                );
              })}
            </tbody>
          </table>
        </Stack>
      </Card>
    </div>
  );
}
