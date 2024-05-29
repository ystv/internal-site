import { RoleView } from "./RoleView";
import { fetchRoles } from "@/features/roles";
import { searchParamsSchema } from "./schema";
import { zodErrorResponse } from "@/components/FormServerHelpers";
import { redirect } from "next/navigation";
import { validateSearchParams } from "@/lib/searchParams/validate";
import { getSearchParamsString } from "@/lib/searchParams/util";
import { RolesProvider } from "@/components/RolesContext";

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

  const initialRolesData = await fetchRoles(validSearchParams);

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
    <RolesProvider
      roles={initialRolesData.roles}
      page={initialRolesData.page}
      total={initialRolesData.total}
    >
      <RoleView
        fetchRoles={async (data: unknown) => {
          "use server";

          const safeData = searchParamsSchema.safeParse(data);

          if (!safeData.success) {
            return zodErrorResponse(safeData.error);
          }

          const rolesData = await fetchRoles({
            count: safeData.data.count,
            page: safeData.data.page,
            query: decodeURIComponent(safeData.data.query ?? ""),
          });

          return { ok: true, ...rolesData };
        }}
      />
    </RolesProvider>
  );
}
