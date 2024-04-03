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

export const createPositionSchema = z.object({
  name: z.string(),
  brief_description: z.string().optional(),
  full_description: z.string().optional(),
});

export const updatePositionSchema = z.object({
  position_id: z.number(),
  name: z.string(),
  brief_description: z.string().optional(),
  full_description: z.string().optional(),
});

export const deletePositionSchema = z.object({
  position_id: z.number(),
});
