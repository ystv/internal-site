import { isBefore } from "date-fns";
import { z } from "zod";

export const EditEventSchema = z
  .object({
    name: z.string(),
    description: z.string(),
    start_date: z.coerce.date(),
    end_date: z.coerce.date(),
    location: z.string(),
    is_private: z.boolean(),
    is_tentative: z.boolean(),
  })
  .refine((val) => isBefore(val.start_date, val.end_date), {
    message: "End date must be after start date",
    path: ["endDate"],
  });

export const CrewSchema = z.object({
  crew_id: z.number().optional(),
  position_id: z.coerce.number().optional(),
  custom_position_name: z.string().optional(),
  ordering: z.number(),
  locked: z.boolean().default(false),
  user_id: z
    .string()
    .or(z.number())
    .nullable()
    .transform((v) => (v === "" ? null : v))
    .pipe(z.coerce.number().nullable().default(null))
    .nullable(),
  custom_crew_member_name: z
    .string()
    .optional()
    .nullable()
    .transform((v) => (v === "" ? null : v))
    .default(null),
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
