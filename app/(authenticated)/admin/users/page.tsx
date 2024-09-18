import { UserView } from "./UserView";
import { fetchUsers } from "@/features/people";
import { searchParamsSchema } from "./schema";
import { redirect } from "next/navigation";
import { validateSearchParams } from "@/lib/searchParams/validate";
import { getSearchParamsString } from "@/lib/searchParams/util";

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

  return <UserView initialUsers={initialUsersData} />;
}
