import { z } from "zod";

export const UserReportSchema = z.object({
  type: z.enum(["bug", "feature"]),
  description: z.string(),
});
