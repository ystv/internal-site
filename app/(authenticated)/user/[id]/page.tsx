import { requirePermission } from "@/lib/auth/server";

import { UserPage } from "../me/page";

export default async function ArbitraryUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const Id = (await params).id;
  await requirePermission("People.ViewProfile.All");
  return <UserPage id={parseInt(Id, 10)} />;
}
