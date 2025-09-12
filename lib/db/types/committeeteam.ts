import * as z from "zod"
import { CompleteCommitteePositionTeam, CommitteePositionTeamModel } from "./index"

export const _CommitteeTeamModel = z.object({
  committee_team_id: z.number().int(),
  name: z.string(),
  description: z.string(),
})

export interface CompleteCommitteeTeam extends z.infer<typeof _CommitteeTeamModel> {
  position_teams: CompleteCommitteePositionTeam[]
}

/**
 * CommitteeTeamModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const CommitteeTeamModel: z.ZodSchema<CompleteCommitteeTeam> = z.lazy(() => _CommitteeTeamModel.extend({
  position_teams: CommitteePositionTeamModel.array(),
}))
