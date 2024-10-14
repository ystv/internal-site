"use server";

import { FormResponse } from "@/components/forms";
import * as People from "@/features/people";
import { wrapServerAction } from "@/lib/actions";
import { getCurrentUser } from "@/lib/auth/server";
import { socket } from "@/lib/socket/server";
import { revalidatePath } from "next/cache";

export const changePreference = wrapServerAction(
  "changePreference",
  async function changePreference<K extends keyof PrismaJson.UserPreferences>(
    key: K,
    value: PrismaJson.UserPreferences[K],
  ): Promise<FormResponse> {
    const me = await getCurrentUser();

    socket.emit(`userUpdate:${me.user_id}`);
    await People.setUserPreference(me.user_id, key, value);
    revalidatePath("/user/me");
    return { ok: true };
  },
);
