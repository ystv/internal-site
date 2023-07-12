import * as z from "zod"
import { Completepositions, positionsModel, Completesignup_sheets, signup_sheetsModel, CompleteUser, UserModel } from "./index"

export const _crewsModel = z.object({
  crew_id: z.number().int(),
  signup_id: z.number().int().nullish(),
  position_id: z.number().int().nullish(),
  user_id: z.number().int().nullish(),
  credited: z.boolean(),
  locked: z.boolean(),
  ordering: z.number().int(),
})

export interface Completecrews extends z.infer<typeof _crewsModel> {
  positions?: Completepositions | null
  signup_sheets?: Completesignup_sheets | null
  users?: CompleteUser | null
}

/**
 * crewsModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const crewsModel: z.ZodSchema<Completecrews> = z.lazy(() => _crewsModel.extend({
  positions: positionsModel.nullish(),
  signup_sheets: signup_sheetsModel.nullish(),
  users: UserModel.nullish(),
}))
