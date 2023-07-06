import * as z from "zod"
import { CompleteOfficership, OfficershipModel, CompleteUser, UserModel } from "./index"

export const _OfficershipMemberModel = z.object({
  officership_member_id: z.number().int(),
  user_id: z.number().int().nullish(),
  officer_id: z.number().int(),
  start_date: z.date().nullish(),
  end_date: z.date().nullish(),
})

export interface CompleteOfficershipMember extends z.infer<typeof _OfficershipMemberModel> {
  officerships: CompleteOfficership
  users?: CompleteUser | null
}

/**
 * OfficershipMemberModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const OfficershipMemberModel: z.ZodSchema<CompleteOfficershipMember> = z.lazy(() => _OfficershipMemberModel.extend({
  officerships: OfficershipModel,
  users: UserModel.nullish(),
}))
