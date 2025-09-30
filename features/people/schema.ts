import { z } from "zod";

export const giveUserRoleSchema = z.object({
  user_id: z.number(),
  role_id: z.number(),
});

export const setPublicAvatarSchema = z.object({
  user_id: z.number().optional(),
  avatar_data_url: z.string().nullable(),
});

export const setPronounsSchema = z.object({
  user_id: z.number().optional(),
  pronouns: z
    .string()
    .regex(/^[a-z]+(?:\/[a-z]+)*$/, {
      message: "Pronouns must be lowercase words separated by slashes",
    })
    .nullable(),
});

export const getPublicProfileSchema = z.object({
  user_id: z.number().optional(),
});
