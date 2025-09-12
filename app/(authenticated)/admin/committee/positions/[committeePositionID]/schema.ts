import { z } from "zod";

export const fetchCommitteePositionForAdminSchema = z.object({
  committee_position_id: z.number().min(1),
});

export const promoteUserToCommitteePositionSchema = z.object({
  committee_position_id: z.number().min(1),
  user_id: z.coerce.number().min(1),
  start_date: z.coerce.date(),
  end_date: z.coerce.date().optional(),
});

export const stepDownUserFromCommitteePositionSchema = z.object({
  committee_position_member_id: z.number().min(1),
  end_date: z.coerce.date().optional(),
});
