import { z } from "zod";

export const giveUserRoleSchema = z.object({
  user_id: z.number(),
  role_id: z.number(),
});
