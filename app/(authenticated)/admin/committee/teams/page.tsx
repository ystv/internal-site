import { redirect } from "next/navigation";

import { PageInfo } from "@/components/PageInfo";
import { fetchCommitteeTeams } from "@/features/committee";
import { getSearchParamsString } from "@/lib/searchParams/util";
import { validateSearchParams } from "@/lib/searchParams/validate";

import { CommitteeTeamView } from "./CommitteeTeamView";
import { searchParamsSchema } from "./schema";

export const dynamic = "force-dynamic";

export default async function CommitteeTeamPage({
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

  const initialCommitteeTeamsData =
    await fetchCommitteeTeams(validSearchParams);

  if (validSearchParams.page != initialCommitteeTeamsData.page) {
    redirect(
      `/admin/committee/roles?${getSearchParamsString({
        count: validSearchParams.count,
        page: initialCommitteeTeamsData.page,
        query: validSearchParams.query,
      })}`,
    );
  }

  return (
    <>
      <PageInfo title="Committee Positions" />
      <CommitteeTeamView initialCommitteeTeams={initialCommitteeTeamsData} />
    </>
  );
}
