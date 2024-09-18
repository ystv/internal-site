import { Button, Card, Stack } from "@mantine/core";
import Link from "next/link";

export default function AdminPage() {
  return (
    <Card>
      <Stack>
        <Link href={"/admin/users"}>
          <Button variant="default">Users</Button>
        </Link>
        <Link href={"/admin/positions"}>
          <Button variant="default">Crew Positions</Button>
        </Link>
        <Link href={"/admin/roles"}>
          <Button variant="default">Roles</Button>
        </Link>
      </Stack>
    </Card>
  );
}
