import * as z from "zod"
import { CompleteIdentity, IdentityModel, CompleteAttendee, AttendeeModel, CompleteCrew, CrewModel, CompleteEvent, EventModel, CompleteRoleMember, RoleMemberModel } from "./index"

// Helper schema for JSON fields
type Literal = boolean | number | string
type Json = Literal | { [key: string]: Json } | Json[]
const literalSchema = z.union([z.string(), z.number(), z.boolean()])
const jsonSchema: z.ZodSchema<Json> = z.lazy(() => z.union([literalSchema, z.array(jsonSchema), z.record(jsonSchema)]))

export const _UserModel = z.object({
  user_id: z.number().int(),
  username: z.string(),
  email: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  nickname: z.string(),
  avatar: z.string(),
  joined_on: z.date(),
  /**
   * [UserPreferences]
   */
  preferences: jsonSchema,
})

export interface CompleteUser extends z.infer<typeof _UserModel> {
  identities: CompleteIdentity[]
  attendees: CompleteAttendee[]
  crews: CompleteCrew[]
  events_events_created_byTousers: CompleteEvent[]
  events_events_deleted_byTousers: CompleteEvent[]
  events_events_updated_byTousers: CompleteEvent[]
  role_members: CompleteRoleMember[]
  hosted_events: CompleteEvent[]
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
  hosted_events: EventModel.array(),
}))
