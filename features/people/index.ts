import { prisma } from "@/lib/db";
import { z } from "zod";

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
