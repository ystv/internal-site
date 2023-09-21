import * as z from "zod"
import { CompleteRoleMember, RoleMemberModel, CompleteRolePermission, RolePermissionModel } from "./index"

export const _RoleModel = z.object({
  role_id: z.number().int(),
  name: z.string(),
  description: z.string(),
})

export interface CompleteRole extends z.infer<typeof _RoleModel> {
  role_members: CompleteRoleMember[]
  role_permissions: CompleteRolePermission[]
}

/**
 * RoleModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RoleModel: z.ZodSchema<CompleteRole> = z.lazy(() => _RoleModel.extend({
  role_members: RoleMemberModel.array(),
  role_permissions: RolePermissionModel.array(),
}))
