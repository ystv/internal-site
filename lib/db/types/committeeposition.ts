import * as z from "zod"
import { CompleteCommitteePositionMember, CommitteePositionMemberModel, CompleteCommitteePositionTeam, CommitteePositionTeamModel } from "./index"

export const _CommitteePositionModel = z.object({
  committee_position_id: z.number().int(),
  name: z.string(),
  description: z.string(),
  seats: z.number().int(),
  sort_order: z.number().int(),
  email: z.string(),
})

export interface CompleteCommitteePosition extends z.infer<typeof _CommitteePositionModel> {
  committee_position_members: CompleteCommitteePositionMember[]
  position_teams: CompleteCommitteePositionTeam[]
}

/**
 * CommitteePositionModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const CommitteePositionModel: z.ZodSchema<CompleteCommitteePosition> = z.lazy(() => _CommitteePositionModel.extend({
  committee_position_members: CommitteePositionMemberModel.array(),
  position_teams: CommitteePositionTeamModel.array(),
}))
