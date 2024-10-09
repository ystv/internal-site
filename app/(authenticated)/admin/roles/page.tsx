import { RoleView } from "./RoleView";
import { searchParamsSchema } from "./schema";
import { redirect } from "next/navigation";
import { validateSearchParams } from "@/lib/searchParams/validate";
import { getSearchParamsString } from "@/lib/searchParams/util";
import { fetchRolesAction } from "./actions";
import { Stack, Text } from "@mantine/core";
import { PageInfo } from "@/components/PageInfo";

export const dynamic = "force-dynamic";

export default async function PositionPage({
  searchParams,
}: {
  searchParams: {
    count?: string;
    page?: string;
    query?: string;
  };
}) {
  const validSearchParams = validateSearchParams(
    searchParamsSchema,
    searchParams,
  );

  const initialRolesData = await fetchRolesAction(validSearchParams);

  if (!initialRolesData.ok) {
    return (
      <Stack>
        <Text>An error occurred</Text>
        {initialRolesData.errors["root"]}
      </Stack>
    );
  }

  if (validSearchParams.page != initialRolesData.page) {
    redirect(
      `/admin/roles?${getSearchParamsString({
        count: validSearchParams.count,
        page: initialRolesData.page,
        query: validSearchParams.query,
      })}`,
    );
  }

  return (
    <>
      <PageInfo title="Roles" />
      <RoleView initialRoles={initialRolesData} />
    </>
  );
}
