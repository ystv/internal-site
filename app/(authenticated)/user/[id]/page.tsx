import { requirePermission } from "@/lib/auth/server";

import { UserPage } from "../me/page";

export default async function ArbitraryUserPage({
  params,
}: {
  params: { id: string };
}) {
  await requirePermission("People.ViewProfile.All");
  return <UserPage id={parseInt(params.id, 10)} />;
}
