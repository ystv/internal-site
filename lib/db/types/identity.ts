import * as z from "zod"
import { CompleteUser, UserModel } from "./index"

export const _IdentityModel = z.object({
  identity_id: z.number().int(),
  user_id: z.number().int(),
  provider: z.string(),
  provider_key: z.string(),
})

export interface CompleteIdentity extends z.infer<typeof _IdentityModel> {
  user: CompleteUser
}

/**
 * IdentityModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const IdentityModel: z.ZodSchema<CompleteIdentity> = z.lazy(() => _IdentityModel.extend({
  user: UserModel,
}))
