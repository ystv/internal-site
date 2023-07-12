import * as z from "zod"
import { CompletePermission, PermissionModel, CompleteRole, RoleModel } from "./index"

export const _RolePermissionModel = z.object({
  role_id: z.number().int(),
  permission_id: z.number().int(),
})

export interface CompleteRolePermission extends z.infer<typeof _RolePermissionModel> {
  permissions: CompletePermission
  roles: CompleteRole
}

/**
 * RolePermissionModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RolePermissionModel: z.ZodSchema<CompleteRolePermission> = z.lazy(() => _RolePermissionModel.extend({
  permissions: PermissionModel,
  roles: RoleModel,
}))
