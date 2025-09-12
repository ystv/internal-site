import { z } from "zod";

import { MembersProvider } from "@/components/FormFieldPreloadedData";
import { PageInfo } from "@/components/PageInfo";
import { fetchCommitteePositionForAdmin } from "@/features/committee";
import { getAllUsers } from "@/features/people";

import { AdminCommitteePositionView } from "./AdminCommitteePositionView";

export default async function SingleUserPage({
  params,
}: {
  params: Promise<{ committeePositionID: string }>;
}) {
  const committeePositionIDParse = z
    .preprocess((val) => (val ? val : undefined), z.coerce.number())
    .safeParse((await params).committeePositionID);

  if (!committeePositionIDParse.success) {
    return <>Invalid Committee Position ID</>;
  }

  const [committeePosition, allMembers] = await Promise.all([
    fetchCommitteePositionForAdmin({
      committee_position_id: committeePositionIDParse.data,
    }),
    getAllUsers(),
  ]);

  if (!committeePosition.ok) {
    return <>Invalid Committee Position ID</>;
  }

  return (
    <MembersProvider members={allMembers}>
      <PageInfo title={`Committee Position - ${committeePosition.data.name}`} />
      <AdminCommitteePositionView committeePosition={committeePosition.data} />
    </MembersProvider>
  );
}
