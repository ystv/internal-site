import * as z from "zod"
import { CompleteOfficership, OfficershipModel, CompleteOfficershipTeam, OfficershipTeamModel } from "./index"

export const _OfficershipTeamMemberModel = z.object({
  team_id: z.number().int(),
  officer_id: z.number().int(),
  is_leader: z.boolean(),
  is_deputy: z.boolean(),
})

export interface CompleteOfficershipTeamMember extends z.infer<typeof _OfficershipTeamMemberModel> {
  officerships: CompleteOfficership
  officership_teams: CompleteOfficershipTeam
}

/**
 * OfficershipTeamMemberModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const OfficershipTeamMemberModel: z.ZodSchema<CompleteOfficershipTeamMember> = z.lazy(() => _OfficershipTeamMemberModel.extend({
  officerships: OfficershipModel,
  officership_teams: OfficershipTeamModel,
}))
