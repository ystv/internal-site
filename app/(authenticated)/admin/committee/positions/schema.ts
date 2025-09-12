import { de } from "date-fns/locale";
import { z } from "zod";

export const searchParamsSchema = z.object({
  count: z
    .preprocess((val) => (val ? val : undefined), z.coerce.number())
    .default(10),
  page: z
    .preprocess((val) => (val ? val : undefined), z.coerce.number())
    .default(1),
  query: z.string().optional(),
});

export const createCommitteePositionSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  seats: z.number().min(1).optional(),
});

export const updateCommitteePositionSchema = z.object({
  committee_position_id: z.number(),
  name: z.string(),
  description: z.string().optional(),
  seats: z.number().min(1).optional(),
});

export const deleteCommitteePositionSchema = z.object({
  committee_position_id: z.number(),
});
