import * as z from "zod"
import { CompleteRole, RoleModel } from "./index"

export const _RolePermissionModel = z.object({
  role_id: z.number().int(),
  permission: z.string(),
})

export interface CompleteRolePermission extends z.infer<typeof _RolePermissionModel> {
  roles: CompleteRole
}

/**
 * RolePermissionModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RolePermissionModel: z.ZodSchema<CompleteRolePermission> = z.lazy(() => _RolePermissionModel.extend({
  roles: RoleModel,
}))
