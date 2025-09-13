import * as z from "zod"
import { CompleteCommitteePosition, CommitteePositionModel, CompleteUser, UserModel } from "./index"

export const _CommitteePositionMemberModel = z.object({
  committee_position_member_id: z.number().int(),
  committee_position_id: z.number().int(),
  user_id: z.number().int(),
  start_date: z.date(),
  end_date: z.date().nullish(),
  current: z.boolean(),
})

export interface CompleteCommitteePositionMember extends z.infer<typeof _CommitteePositionMemberModel> {
  committee_position: CompleteCommitteePosition
  user: CompleteUser
}

/**
 * CommitteePositionMemberModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const CommitteePositionMemberModel: z.ZodSchema<CompleteCommitteePositionMember> = z.lazy(() => _CommitteePositionMemberModel.extend({
  committee_position: CommitteePositionModel,
  user: UserModel,
}))
