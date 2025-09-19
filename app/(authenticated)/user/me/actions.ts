"use server";

import { revalidatePath } from "next/cache";
import { type z } from "zod";

import { type FormResponse } from "@/components/Form";
import { zodErrorResponse } from "@/components/FormServerHelpers";
import * as People from "@/features/people";
import {
  getPublicProfileSchema,
  setPublicAvatarSchema,
} from "@/features/people/schema";
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

export const setPublicAvatarAction = wrapServerAction(
  "setPublicAvatar",
  async function setPublicAvatarAction(
    data: z.infer<typeof setPublicAvatarSchema>,
  ) {
    const safeData = setPublicAvatarSchema.safeParse(data);

    if (!safeData.success) {
      return zodErrorResponse(safeData.error);
    }

    return People.setPublicAvatar(safeData.data);
  },
);

export const getPublicProfileAction = wrapServerAction(
  "getPublicProfile",
  async function getPublicProfileAction(
    data: z.infer<typeof getPublicProfileSchema>,
  ) {
    const safeData = getPublicProfileSchema.safeParse(data);

    if (!safeData.success) {
      return zodErrorResponse(safeData.error);
    }

    return People.getPublicProfile(safeData.data);
  },
);
