import { PageInfo } from "@/components/helpers/PageInfo";
import { getUserName } from "@/components/helpers/UserHelpers";
import {
  editUserAdmin,
  fetchUserForAdmin,
  getUserAbsentRoles,
  giveUserRole,
  removeUserRole,
} from "@/features/people";
import { z } from "zod";
import { AdminUserView } from "./AdminUserView";

export const dynamic = "force-dynamic";

export default async function SingleUserPage({
  params,
}: {
  params: { userID: string };
}) {
  const userIDParse = z
    .preprocess((val) => (val ? val : undefined), z.coerce.number())
    .safeParse(params.userID);

  if (!userIDParse.success) {
    return <>Invalid User ID</>;
  }

  const user = await fetchUserForAdmin({ user_id: userIDParse.data });

  if (!user) {
    return <>Invalid User ID</>;
  }

  const userAbsentRoles = getUserAbsentRoles({ user_id: user.user_id });

  return (
    <>
      <PageInfo title={`User - ${getUserName(user)}`} />
      <AdminUserView
        user={user}
        giveUserRole={giveUserRole}
        removeUserRole={removeUserRole}
        editUserAction={editUserAdmin}
        userAbsentRoles={userAbsentRoles}
      />
    </>
  );
}
