import { z } from "zod";

export const CrewSchema = z.object({
  crew_id: z.number().optional(),
  position_id: z.coerce.number(),
  ordering: z.number(),
  locked: z.boolean().default(false),
  user_id: z.coerce.number().nullable().default(null),
});

export const SignupSheetSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  start_time: z.coerce.date(),
  end_time: z.coerce.date(),
  arrival_time: z.coerce.date(),
  unlock_date: z.coerce.date().nullable(),
  crews: z.array(CrewSchema),
});
