"use server";

import { FormResponse } from "@/components/Form";
import { getCurrentUser, requirePermission } from "@/lib/auth/server";
import * as People from "@/features/people";
import { revalidatePath } from "next/cache";
import { socketUpdateUserProfile } from "@/lib/socket/server";
import { wrapServerAction } from "@/lib/actions";

export const changePreference = wrapServerAction(
  "changePreference",
  async function changePreference<K extends keyof PrismaJson.UserPreferences>(
    key: K,
    value: PrismaJson.UserPreferences[K],
  ): Promise<FormResponse> {
    const me = await getCurrentUser();

    await People.setUserPreference(me.user_id, key, value);
    revalidatePath("/user/me");
    socketUpdateUserProfile(me.user_id);
    return { ok: true };
  },
);
