"use server";

import { FormResponse } from "@/components/Form";
import { getCurrentUser, requirePermission } from "@/lib/auth/server";
import * as People from "@/features/people";
import { zodErrorResponse } from "@/components/FormServerHelpers";
import { revalidatePath } from "next/cache";
import { socket } from "@/lib/socket/server";

export async function changePreference<
  K extends keyof PrismaJson.UserPreferences,
>(key: K, value: PrismaJson.UserPreferences[K]): Promise<FormResponse> {
  const me = await getCurrentUser();

  socket.emit(`userUpdate:${me.user_id}`);
  await People.setUserPreference(me.user_id, key, value);
  revalidatePath(`/user/${me.user_id}`);
  revalidatePath("/user/me");
  return { ok: true };
}
