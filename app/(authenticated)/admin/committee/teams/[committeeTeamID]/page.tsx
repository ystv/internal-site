import { z } from "zod";

import { PageInfo } from "@/components/PageInfo";
import { fetchCommitteeTeamForAdmin } from "@/features/committee";

import { AdminCommitteeTeamView } from "./AdminCommitteeTeamView";

export default async function SingleUserPage({
  params,
}: {
  params: Promise<{ committeeTeamID: string }>;
}) {
  const committeeTeamIDParse = z
    .preprocess((val) => (val ? val : undefined), z.coerce.number())
    .safeParse((await params).committeeTeamID);

  if (!committeeTeamIDParse.success) {
    return <>Invalid Committee Team ID</>;
  }

  const committeeTeam = await fetchCommitteeTeamForAdmin({
    committee_team_id: committeeTeamIDParse.data,
  });

  if (!committeeTeam.ok) {
    return <>Invalid Committee Team ID</>;
  }

  return (
    <>
      <PageInfo title={`Committee Team - ${committeeTeam.data.name}`} />
      <AdminCommitteeTeamView committeeTeam={committeeTeam.data} />
    </>
  );
}
