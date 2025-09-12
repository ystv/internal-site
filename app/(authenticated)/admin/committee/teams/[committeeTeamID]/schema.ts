import { z } from "zod";

export const fetchCommitteeTeamForAdminSchema = z.object({
  committee_team_id: z.preprocess(
    (val) => (val ? val : undefined),
    z.coerce.number(),
  ),
});

export const fetchPositionsNotInTeamSchema = z.object({
  committee_team_id: z.preprocess(
    (val) => (val ? val : undefined),
    z.coerce.number(),
  ),
});

export const addPositionToTeamSchema = z.object({
  committee_team_id: z.preprocess(
    (val) => (val ? val : undefined),
    z.coerce.number(),
  ),
  committee_position_id: z.preprocess(
    (val) => (val ? val : undefined),
    z.coerce.number(),
  ),
});

export const removePositionFromTeamSchema = z.object({
  committee_team_id: z.preprocess(
    (val) => (val ? val : undefined),
    z.coerce.number(),
  ),
  committee_position_id: z.preprocess(
    (val) => (val ? val : undefined),
    z.coerce.number(),
  ),
});

export const reorderPositionInTeamSchema = z.object({
  committee_team_id: z.preprocess(
    (val) => (val ? val : undefined),
    z.coerce.number(),
  ),
  committee_position_id: z.preprocess(
    (val) => (val ? val : undefined),
    z.coerce.number(),
  ),
  direction: z.enum(["up", "down"]),
});
