import { z } from "zod";

export const editUserSchema = z.object({
  user_id: z.number(),
  first_name: z.string(),
  nickname: z.string(),
  last_name: z.string(),
});
