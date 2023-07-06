import * as z from "zod"
import { CompleteOfficershipTeamMember, OfficershipTeamMemberModel } from "./index"

export const _OfficershipTeamModel = z.object({
  team_id: z.number().int(),
  name: z.string(),
  email_alias: z.string(),
  short_description: z.string(),
  full_description: z.string(),
})

export interface CompleteOfficershipTeam extends z.infer<typeof _OfficershipTeamModel> {
  officership_team_members: CompleteOfficershipTeamMember[]
}

/**
 * OfficershipTeamModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const OfficershipTeamModel: z.ZodSchema<CompleteOfficershipTeam> = z.lazy(() => _OfficershipTeamModel.extend({
  officership_team_members: OfficershipTeamMemberModel.array(),
}))
