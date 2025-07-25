import { redirect } from "next/navigation";

import { PageInfo } from "@/components/PageInfo";
import { fetchUsers } from "@/features/people";
import { getSearchParamsString } from "@/lib/searchParams/util";
import { validateSearchParams } from "@/lib/searchParams/validate";

import { searchParamsSchema } from "./schema";
import { UserView } from "./UserView";

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

  const initialUsersData = await fetchUsers(validSearchParams);

  if (validSearchParams.page != initialUsersData.page) {
    redirect(
      `/admin/users?${getSearchParamsString({
        count: validSearchParams.count,
        page: initialUsersData.page,
        query: validSearchParams.query,
      })}`,
    );
  }

  return (
    <>
      <PageInfo title="Users" />
      <UserView initialUsers={initialUsersData} />
    </>
  );
}
