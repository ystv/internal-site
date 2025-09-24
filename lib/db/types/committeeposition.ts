import * as z from "zod"
import { CompleteCommitteePositionTeam, CommitteePositionTeamModel, CompleteCommitteePositionMember, CommitteePositionMemberModel } from "./index"

export const _CommitteePositionModel = z.object({
  committee_position_id: z.number().int(),
  name: z.string(),
  description: z.string(),
  email: z.string(),
  seats: z.number().int(),
  sort_order: z.number().int(),
})

export interface CompleteCommitteePosition extends z.infer<typeof _CommitteePositionModel> {
  position_teams: CompleteCommitteePositionTeam[]
  committee_position_members: CompleteCommitteePositionMember[]
}

/**
 * CommitteePositionModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const CommitteePositionModel: z.ZodSchema<CompleteCommitteePosition> = z.lazy(() => _CommitteePositionModel.extend({
  position_teams: CommitteePositionTeamModel.array(),
  committee_position_members: CommitteePositionMemberModel.array(),
}))
