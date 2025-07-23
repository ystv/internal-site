"use server";

import { revalidatePath } from "next/cache";

import { type FormResponse } from "@/components/Form";
import * as People from "@/features/people";
import { wrapServerAction } from "@/lib/actions";
import { getCurrentUser } from "@/lib/auth/server";

export const changePreference = wrapServerAction(
  "changePreference",
  async function changePreference<K extends keyof PrismaJson.UserPreferences>(
    key: K,
    value: PrismaJson.UserPreferences[K],
  ): Promise<FormResponse> {
    const me = await getCurrentUser();

    await People.setUserPreference(me.user_id, key, value);
    revalidatePath("/user/me");
    return { ok: true };
  },
);
