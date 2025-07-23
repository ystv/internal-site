import { Button, Card, Stack } from "@mantine/core";
import Link from "next/link";

import { PageInfo } from "@/components/PageInfo";

export const dynamic = "force-dynamic";

export default function AdminPage() {
  return (
    <>
      <PageInfo title="Admin" />
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
    </>
  );
}
