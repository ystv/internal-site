import * as z from "zod"
import { Completecrews, crewsModel, Completeposition_groups, position_groupsModel, CompletePermission, PermissionModel } from "./index"

export const _positionsModel = z.object({
  position_id: z.number().int(),
  group_id: z.number().int(),
  permission_id: z.number().int().nullish(),
  name: z.string(),
  admin: z.boolean(),
  brief_description: z.string(),
  full_description: z.string(),
  image: z.string(),
  training_url: z.string(),
})

export interface Completepositions extends z.infer<typeof _positionsModel> {
  crews: Completecrews[]
  position_groups: Completeposition_groups
  permissions?: CompletePermission | null
}

/**
 * positionsModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const positionsModel: z.ZodSchema<Completepositions> = z.lazy(() => _positionsModel.extend({
  crews: crewsModel.array(),
  position_groups: position_groupsModel,
  permissions: PermissionModel.nullish(),
}))
