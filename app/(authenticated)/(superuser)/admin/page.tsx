import { Button, Card, NavLink, Stack } from "@mantine/core";
import Link from "next/link";

export default function AdminPage() {
  return (
    <Card>
      <Stack>
        <Link href={"/admin/users"}>
          <Button variant="default">Manage Users</Button>
        </Link>
        <Link href={"/admin/positions"}>
          <Button variant="default">Manage Positions</Button>
        </Link>
        <Link href={"/admin/roles"}>
          <Button variant="default">Manage Roles</Button>
        </Link>
      </Stack>
    </Card>
  );
}
