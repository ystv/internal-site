import { redirect } from "next/navigation";

import { PageInfo } from "@/components/PageInfo";
import { fetchCommitteePositions } from "@/features/committee";
import { getSearchParamsString } from "@/lib/searchParams/util";
import { validateSearchParams } from "@/lib/searchParams/validate";

import { CommitteePositionView } from "./CommitteePositionView";
import { searchParamsSchema } from "./schema";

export const dynamic = "force-dynamic";

export default async function CommitteePositionPage({
  searchParams,
}: {
  searchParams: Promise<{
    count?: string;
    page?: string;
    query?: string;
  }>;
}) {
  const validSearchParams = validateSearchParams(
    searchParamsSchema,
    await searchParams,
  );

  const initialCommitteePositionsData =
    await fetchCommitteePositions(validSearchParams);

  if (validSearchParams.page != initialCommitteePositionsData.page) {
    redirect(
      `/admin/committee/roles?${getSearchParamsString({
        count: validSearchParams.count,
        page: initialCommitteePositionsData.page,
        query: validSearchParams.query,
      })}`,
    );
  }

  return (
    <>
      <PageInfo title="Committee Positions" />
      <CommitteePositionView
        initialCommitteePositions={initialCommitteePositionsData}
      />
    </>
  );
}
