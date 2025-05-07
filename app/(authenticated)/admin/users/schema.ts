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
