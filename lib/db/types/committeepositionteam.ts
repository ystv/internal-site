import * as z from "zod"
import { CompleteCommitteePosition, CommitteePositionModel, CompleteCommitteeTeam, CommitteeTeamModel } from "./index"

export const _CommitteePositionTeamModel = z.object({
  committee_position_team_id: z.number().int(),
  committee_position_id: z.number().int(),
  committee_team_id: z.number().int(),
  ordering: z.number().int(),
})

export interface CompleteCommitteePositionTeam extends z.infer<typeof _CommitteePositionTeamModel> {
  committee_position: CompleteCommitteePosition
  committee_team: CompleteCommitteeTeam
}

/**
 * CommitteePositionTeamModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const CommitteePositionTeamModel: z.ZodSchema<CompleteCommitteePositionTeam> = z.lazy(() => _CommitteePositionTeamModel.extend({
  committee_position: CommitteePositionModel,
  committee_team: CommitteeTeamModel,
}))
