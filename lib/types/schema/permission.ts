import * as z from "zod"
import { CompletePosition, PositionModel, CompleteRolePermission, RolePermissionModel } from "./index"

export const _PermissionModel = z.object({
  permission_id: z.number().int(),
  name: z.string(),
  description: z.string(),
})

export interface CompletePermission extends z.infer<typeof _PermissionModel> {
  positions: CompletePosition[]
  role_permissions: CompleteRolePermission[]
}

/**
 * PermissionModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const PermissionModel: z.ZodSchema<CompletePermission> = z.lazy(() => _PermissionModel.extend({
  positions: PositionModel.array(),
  role_permissions: RolePermissionModel.array(),
}))
