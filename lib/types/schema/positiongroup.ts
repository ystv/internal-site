import * as z from "zod"
import { CompleteUser, UserModel, CompletePosition, PositionModel } from "./index"

export const _PositionGroupModel = z.object({
  group_id: z.number().int(),
  name: z.string(),
  description: z.string(),
  primary_colour: z.string(),
  leader: z.number().int().nullish(),
})

export interface CompletePositionGroup extends z.infer<typeof _PositionGroupModel> {
  users?: CompleteUser | null
  positions: CompletePosition[]
}

/**
 * PositionGroupModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const PositionGroupModel: z.ZodSchema<CompletePositionGroup> = z.lazy(() => _PositionGroupModel.extend({
  users: UserModel.nullish(),
  positions: PositionModel.array(),
}))
