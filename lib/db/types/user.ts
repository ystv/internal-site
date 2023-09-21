import * as z from "zod"
import { CompleteIdentity, IdentityModel, CompleteAttendee, AttendeeModel, CompleteCrew, CrewModel, CompleteEvent, EventModel, CompleteRoleMember, RoleMemberModel } from "./index"

export const _UserModel = z.object({
  user_id: z.number().int(),
  username: z.string(),
  email: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  nickname: z.string(),
  avatar: z.string(),
})

export interface CompleteUser extends z.infer<typeof _UserModel> {
  identities: CompleteIdentity[]
  attendees: CompleteAttendee[]
  crews: CompleteCrew[]
  events_events_created_byTousers: CompleteEvent[]
  events_events_deleted_byTousers: CompleteEvent[]
  events_events_updated_byTousers: CompleteEvent[]
  role_members: CompleteRoleMember[]
}

/**
 * UserModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const UserModel: z.ZodSchema<CompleteUser> = z.lazy(() => _UserModel.extend({
  identities: IdentityModel.array(),
  attendees: AttendeeModel.array(),
  crews: CrewModel.array(),
  events_events_created_byTousers: EventModel.array(),
  events_events_deleted_byTousers: EventModel.array(),
  events_events_updated_byTousers: EventModel.array(),
  role_members: RoleMemberModel.array(),
}))
