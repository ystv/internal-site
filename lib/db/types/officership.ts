import * as z from "zod"
import { CompleteOfficershipMember, OfficershipMemberModel, CompleteOfficershipTeamMember, OfficershipTeamMemberModel, CompleteRole, RoleModel } from "./index"

export const _OfficershipModel = z.object({
  officer_id: z.number().int(),
  name: z.string(),
  email_alias: z.string(),
  description: z.string(),
  historywiki_url: z.string(),
  role_id: z.number().int().nullish(),
  is_current: z.boolean(),
  if_unfilled: z.number().int().nullish(),
})

export interface CompleteOfficership extends z.infer<typeof _OfficershipModel> {
  officership_members: CompleteOfficershipMember[]
  officership_team_members: CompleteOfficershipTeamMember[]
  officerships?: CompleteOfficership | null
  other_officerships: CompleteOfficership[]
  roles?: CompleteRole | null
}

/**
 * OfficershipModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const OfficershipModel: z.ZodSchema<CompleteOfficership> = z.lazy(() => _OfficershipModel.extend({
  officership_members: OfficershipMemberModel.array(),
  officership_team_members: OfficershipTeamMemberModel.array(),
  officerships: OfficershipModel.nullish(),
  other_officerships: OfficershipModel.array(),
  roles: RoleModel.nullish(),
}))
