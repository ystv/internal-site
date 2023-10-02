import * as z from "zod"
import { CompletePosition, PositionModel, CompleteSignupSheet, SignupSheetModel, CompleteUser, UserModel } from "./index"

export const _CrewModel = z.object({
  crew_id: z.number().int(),
  signup_id: z.number().int(),
  position_id: z.number().int(),
  user_id: z.number().int().nullish(),
  custom_crew_member_name: z.string().nullish(),
  credited: z.boolean(),
  locked: z.boolean(),
  ordering: z.number().int(),
})

export interface CompleteCrew extends z.infer<typeof _CrewModel> {
  positions: CompletePosition
  signup_sheets: CompleteSignupSheet
  users?: CompleteUser | null
}

/**
 * CrewModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const CrewModel: z.ZodSchema<CompleteCrew> = z.lazy(() => _CrewModel.extend({
  positions: PositionModel,
  signup_sheets: SignupSheetModel,
  users: UserModel.nullish(),
}))
