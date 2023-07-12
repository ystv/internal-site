import * as z from "zod"
import { CompleteUser, UserModel, Completepositions, positionsModel } from "./index"

export const _position_groupsModel = z.object({
  group_id: z.number().int(),
  name: z.string(),
  description: z.string(),
  primary_colour: z.string(),
  leader: z.number().int().nullish(),
})

export interface Completeposition_groups extends z.infer<typeof _position_groupsModel> {
  users?: CompleteUser | null
  positions: Completepositions[]
}

/**
 * position_groupsModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const position_groupsModel: z.ZodSchema<Completeposition_groups> = z.lazy(() => _position_groupsModel.extend({
  users: UserModel.nullish(),
  positions: positionsModel.array(),
}))
