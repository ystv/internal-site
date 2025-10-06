import { Button, Card, Group } from "@mantine/core";
import Link from "next/link";

import { PageInfo } from "@/components/PageInfo";

export const dynamic = "force-dynamic";

export default function AdminPage() {
  return (
    <>
      <PageInfo title="Admin - Committee" />
      <Card>
        <Group>
          <Link href={"/admin/committee/positions"}>
            <Button variant="default">Positions</Button>
          </Link>
          <Link href={"/admin/committee/teams"}>
            <Button variant="default">Teams</Button>
          </Link>
        </Group>
      </Card>
    </>
  );
}
