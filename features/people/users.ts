import { prisma } from "@/lib/db";
import { string, z } from "zod";
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

const IdentitySchema = z.object({
  provider: z.enum(["google", "slack"]),
  provider_key: z.string(),
});

/**
 * Additional fields that we can expose to the current user or admins, but
 * not everyone.
 */
export const SecureUserModel = ExposedUserModel.extend({
  preferences: UserPreferencesSchema,
  identities: z.array(IdentitySchema), // this is okay - the only thign stored is IDs
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

export async function fetchUserPreferences(userID: number) {
  return await prisma.user.findUnique({
    where: {
      user_id: userID,
    },
    select: {
      preferences: true,
    },
  });
}

export async function removeSlackLink(user_id: number): Promise<boolean> {
  return await prisma.$transaction(async ($db) => {
    const num_identities = await $db.identity.count({
      where: {
        user_id: user_id,
      },
    });

    if (num_identities <= 1) {
      return false;
    }

    await $db.identity.deleteMany({
      where: {
        user_id: user_id,
        provider: "slack",
      },
    });

    return true;
  });
}
