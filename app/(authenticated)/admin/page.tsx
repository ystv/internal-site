import { hasPermission } from "@/lib/auth/server";
import { Button, Card, Group, Space, Stack } from "@mantine/core";
import Link from "next/link";
import { ForbiddenAny } from "@/lib/auth/errors";

export default async function AdminPage() {
  const [
    userListPermission,
    userAddPermission,
    permissionsPermission,
    rolePermission,
  ] = await Promise.all([
    hasPermission("ManageMembers.Members.List"),
    hasPermission("ManageMembers.Members.Add"),
    hasPermission("ManageMembers.Permissions"),
    hasPermission("ManageMembers.Groups"),
  ]);
  if (
    !userAddPermission &&
    !userListPermission &&
    !permissionsPermission &&
    !rolePermission
  ) {
    new ForbiddenAny("No admin permissions");
  }
  // Will figure out the user add in a bit
  return (
    <div>
      <Card withBorder>
        <Group>
          <Stack gap={3}>
            <h2 className="my-0">Admin pages</h2>
            <h4 className="my-0 text-[--mantine-color-placeholder]">
              Here you can view and control the backend functions.
            </h4>
          </Stack>
        </Group>
      </Card>
      <Space h={"md"} />
      <Card withBorder>
        <Stack gap={0}>
          <h2 className="mt-0">Please select from the following:</h2>
          <div className={"flex items-end justify-between"}>
            <Button component={Link} href="/admin/users" fz="md">
              Users
            </Button>
            <Space h={"md"} />
            <Button component={Link} href="/admin/roles" fz="md">
              Roles
            </Button>
            <Space h={"md"} />
            <Button component={Link} href="/admin/permissions" fz="md">
              Permissions
            </Button>
          </div>
        </Stack>
      </Card>
    </div>
  );
}
