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

export const createCommitteeTeamSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  sort_order: z.number().min(0).default(0),
  public: z.boolean().default(false),
});

export const updateCommitteeTeamSchema = z.object({
  committee_team_id: z.number(),
  name: z.string(),
  description: z.string().optional(),
  sort_order: z.number().min(0).default(0),
  public: z.boolean().default(false),
});

export const deleteCommitteeTeamSchema = z.object({
  committee_team_id: z.number(),
});
