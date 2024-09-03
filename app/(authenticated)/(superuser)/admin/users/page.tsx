import { UserView } from "./UserView";
import { fetchUsers } from "@/features/people";
import { searchParamsSchema } from "./schema";
import { zodErrorResponse } from "@/components/FormServerHelpers";
import { redirect } from "next/navigation";
import { validateSearchParams } from "@/lib/searchParams/validate";
import { getSearchParamsString } from "@/lib/searchParams/util";
import { UsersProvider } from "@/components/UsersContext";

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
    <UsersProvider
      users={initialUsersData.users}
      page={initialUsersData.page}
      total={initialUsersData.total}
    >
      <UserView
        fetchUsers={async (data: unknown) => {
          "use server";

          const safeData = searchParamsSchema.safeParse(data);

          if (!safeData.success) {
            return zodErrorResponse(safeData.error);
          }

          const usersData = await fetchUsers({
            count: safeData.data.count,
            page: safeData.data.page,
            query: decodeURIComponent(safeData.data.query ?? ""),
          });

          return { ok: true, ...usersData };
        }}
      />
    </UsersProvider>
  );
}
