import * as z from "zod"
import { CompleteRole, RoleModel, CompletePermission, PermissionModel } from "./index"

export const _RolePermissionModel = z.object({
  role_id: z.number().int(),
  permission_id: z.number().int(),
})

export interface CompleteRolePermission extends z.infer<typeof _RolePermissionModel> {
  roles: CompleteRole
  permissions: CompletePermission
}

/**
 * RolePermissionModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RolePermissionModel: z.ZodSchema<CompleteRolePermission> = z.lazy(() => _RolePermissionModel.extend({
  roles: RoleModel,
  permissions: PermissionModel,
}))
