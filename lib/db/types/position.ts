import * as z from "zod"
import { CompleteCrew, CrewModel, CompletePositionGroup, PositionGroupModel } from "./index"

export const _PositionModel = z.object({
  position_id: z.number().int(),
  group_id: z.number().int(),
  permission_id: z.number().int().nullish(),
  name: z.string(),
  admin: z.boolean(),
  brief_description: z.string(),
  full_description: z.string(),
})

export interface CompletePosition extends z.infer<typeof _PositionModel> {
  crews: CompleteCrew[]
  position_groups: CompletePositionGroup
}

/**
 * PositionModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const PositionModel: z.ZodSchema<CompletePosition> = z.lazy(() => _PositionModel.extend({
  crews: CrewModel.array(),
  position_groups: PositionGroupModel,
}))
