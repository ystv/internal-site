import { PositionView } from "./PositionView";
import { PositionsProvider } from "@/components/PositionsContext";
import {
  createPosition,
  deletePosition,
  fetchPositions,
  updatePosition,
} from "@/features/positions";
import {
  getDefaults,
  getSearchParamsString,
  searchParamsSchema,
  validateSearchParams,
} from "./schema";
import { zodErrorResponse } from "@/components/FormServerHelpers";
import { redirect } from "next/navigation";

export default async function PositionPage({
  searchParams,
}: {
  searchParams: {
    count?: string;
    page?: string;
    query?: string;
  };
}) {
  const defaultSearchParams = getDefaults(searchParamsSchema);

  const validSearchParams = validateSearchParams(
    searchParamsSchema,
    searchParams,
  );

  const initialPositionsData = await fetchPositions({
    count: Number(validSearchParams.count),
    page: Number(validSearchParams.page),
    query: decodeURIComponent(validSearchParams.query ?? ""),
  });

  if (validSearchParams.page != initialPositionsData.page) {
    redirect(
      `/admin/positions-test?${getSearchParamsString({
        count: validSearchParams.count,
        page: initialPositionsData.page,
        query: validSearchParams.query,
      })}`,
    );
  }

  return (
    <PositionsProvider
      positions={initialPositionsData.positions}
      page={initialPositionsData.page}
      total={initialPositionsData.total}
    >
      <PositionView
        createPosition={createPosition}
        updatePosition={updatePosition}
        deletePosition={deletePosition}
        updateCountPageSearch={async (data: unknown) => {
          "use server";

          const safeData = searchParamsSchema.safeParse(data);

          if (!safeData.success) {
            return zodErrorResponse(safeData.error);
          }

          const positionsData = await fetchPositions({
            count: Number(safeData.data.count),
            page: Number(safeData.data.page),
            query: decodeURIComponent(safeData.data.query ?? ""),
          });

          return { ok: true, ...positionsData };
        }}
      />
    </PositionsProvider>
  );
}
