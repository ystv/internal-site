import {
  editUserAdmin,
  fetchUserForAdmin,
  getUserAbsentRoles,
  giveUserRole,
  removeUserRole,
} from "@/features/people";
import { z } from "zod";
import { AdminUserView } from "./AdminUserView";

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
    <AdminUserView
      user={user}
      giveUserRole={giveUserRole}
      removeUserRole={removeUserRole}
      editUserAction={editUserAdmin}
      userAbsentRoles={userAbsentRoles}
    />
  );
}
