import * as z from "zod"
import { CompleteRole, RoleModel, CompleteUser, UserModel } from "./index"

export const _RoleMemberModel = z.object({
  user_id: z.number().int(),
  role_id: z.number().int(),
})

export interface CompleteRoleMember extends z.infer<typeof _RoleMemberModel> {
  roles: CompleteRole
  users: CompleteUser
}

/**
 * RoleMemberModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RoleMemberModel: z.ZodSchema<CompleteRoleMember> = z.lazy(() => _RoleMemberModel.extend({
  roles: RoleModel,
  users: UserModel,
}))
