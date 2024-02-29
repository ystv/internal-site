import { prisma } from "@/lib/db";
import { z } from "zod";
import { UserPreferencesSchema } from "@/lib/db/preferences";

/**
 * Fields of a user object that we (usually) want to expose to the world.
 * Ensure that all calls to any of these methods are passed through this whenever the raw JSON value
 * will be user-visible, otherwise you may accidentally leak some fields (eg `password`, which would be bad).
 */
export const ExposedUserModel = z.object({
  user_id: z.number(),
  first_name: z.string(),
  last_name: z.string(),
  nickname: z.string().optional(),
  avatar: z.string().nullable(),
});

export type ExposedUser = z.infer<typeof ExposedUserModel>;

/**
 * Additional fields that we can expose to the current user or admins, but
 * not everyone.
 */
export const SecureUserModel = ExposedUserModel.extend({
  preferences: UserPreferencesSchema,
  slack_user_id: z.string().optional(),
  email: z.string(),
});

export type SecureUser = z.infer<typeof SecureUserModel>;

export async function getAllUsers(): Promise<ExposedUser[]> {
  const users = await prisma.user.findMany({
    orderBy: [{ last_name: "asc" }, { first_name: "asc" }],
  });
  return users.map((user) => ExposedUserModel.parse(user));
}

export async function getUser(id: number): Promise<ExposedUser | null> {
  const user = await prisma.user.findUnique({
    where: { user_id: id },
  });
  if (!user) return null;
  return ExposedUserModel.parse(user);
}

export async function setUserPreference<
  K extends keyof PrismaJson.UserPreferences,
>(userID: number, key: K, value: PrismaJson.UserPreferences[K]) {
  await prisma.$transaction(async ($db) => {
    const { preferences } = await $db.user.findFirstOrThrow({
      where: { user_id: userID },
      select: { preferences: true },
    });
    preferences[key] = value;
    // run through Zod to double-check it's still valid
    UserPreferencesSchema.parse(preferences);
    await $db.user.update({
      where: { user_id: userID },
      data: { preferences },
    });
  });
}

export async function setUserNickname<
  K extends keyof PrismaJson.UserPreferences,
>(userID: number, nickname: string | undefined) {
  await prisma.$transaction(async ($db) => {
    await $db.user.update({
      where: { user_id: userID },
      data: { nickname },
    });
  });
}

export async function setUserSlackID(userID: number, slackID: string) {
  await prisma.$transaction(async ($db) => {
    await $db.user.update({
      where: { user_id: userID },
      data: { slack_user_id: slackID },
    });
  });
}
