import { redirect } from "next/navigation";

import { PageInfo } from "@/components/PageInfo";
import { fetchPositions } from "@/features/positions";
import { getSearchParamsString } from "@/lib/searchParams/util";
import { validateSearchParams } from "@/lib/searchParams/validate";

import { PositionView } from "./PositionView";
import { searchParamsSchema } from "./schema";

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
      <PageInfo title="Positions" />
      <PositionView initialPositions={initialPositionsData} />
    </>
  );
}
