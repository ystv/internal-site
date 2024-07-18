"use server";

import { FormResponse } from "@/components/Form";
import { getCurrentUser, requirePermission } from "@/lib/auth/server";
import * as People from "@/features/people";
import { zodErrorResponse } from "@/components/FormServerHelpers";
import { revalidatePath } from "next/cache";
import { socket } from "@/lib/socket/server";

export async function changePreference<
  K extends keyof PrismaJson.UserPreferences,
>(
  userID: number,
  key: K,
  value: PrismaJson.UserPreferences[K],
): Promise<FormResponse> {
  const me = await getCurrentUser();
  if (userID !== me.user_id) {
    await requirePermission(
      "ManageMembers.Members.Admin",
      "ManageMembers.Admin",
    );
  }

  socket.emit(`userUpdate:${userID}`);
  await People.setUserPreference(userID, key, value);
  revalidatePath(`/user/${userID}`);
  revalidatePath("/user/me");
  return { ok: true };
}
