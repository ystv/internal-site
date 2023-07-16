import { z } from "zod";

export const SignupSheetSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  start_time: z.coerce.date(),
  end_time: z.coerce.date(),
  arrival_time: z.coerce.date(),
  unlock_date: z.coerce.date().nullable(),
});
