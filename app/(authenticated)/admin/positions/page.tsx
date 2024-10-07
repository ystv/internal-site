import { PositionView } from "./PositionView";
import { fetchPositions } from "@/features/positions";
import { searchParamsSchema } from "./schema";
import { redirect } from "next/navigation";
import { validateSearchParams } from "@/lib/searchParams/validate";
import { getSearchParamsString } from "@/lib/searchParams/util";
import { SetClientData } from "@/components/SetClientData";

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
    <>
      <SetClientData title="Positions" />
      <PositionView initialPositions={initialPositionsData} />
    </>
  );
}
