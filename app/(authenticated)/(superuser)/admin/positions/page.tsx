import * as Sentry from "@sentry/nextjs";
import { PositionView } from "./PositionView";
import { PositionsProvider } from "@/components/PositionsContext";
import {
  createPosition,
  deletePosition,
  fetchPositions,
  updatePosition,
} from "@/features/positions";
import { searchParamsSchema } from "./schema";
import { zodErrorResponse } from "@/components/FormServerHelpers";
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

  const initialPositionsData = await fetchPositions(validSearchParams);

  if (validSearchParams.page != initialPositionsData.page) {
    redirect(
      `/admin/positions?${getSearchParamsString({
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
        fetchPositions={async (data: unknown) => {
          "use server";
          return await Sentry.withServerActionInstrumentation(
            "PositionsProvider.fetchPositions",
            async () => {
              const safeData = searchParamsSchema.safeParse(data);

              if (!safeData.success) {
                return zodErrorResponse(safeData.error);
              }

              const positionsData = await fetchPositions({
                count: safeData.data.count,
                page: safeData.data.page,
                query: decodeURIComponent(safeData.data.query ?? ""),
              });

              return { ok: true, ...positionsData } as const;
            },
          );
        }}
      />
    </PositionsProvider>
  );
}
