import * as z from "zod"
import { CompleteAttendee, AttendeeModel, CompleteCheckWithTech, CheckWithTechModel, CompleteCommitteePositionMember, CommitteePositionMemberModel, CompleteCrew, CrewModel, CompleteEvent, EventModel, CompleteIdentity, IdentityModel, CompleteRecurringAttendee, RecurringAttendeeModel, CompleteRoleMember, RoleMemberModel } from "./index"

// Helper schema for JSON fields
type Literal = boolean | number | string
type Json = Literal | { [key: string]: Json } | Json[]
const literalSchema = z.union([z.string(), z.number(), z.boolean()])
const jsonSchema: z.ZodSchema<Json> = z.lazy(() => z.union([literalSchema, z.array(jsonSchema), z.record(jsonSchema)]))

export const _UserModel = z.object({
  user_id: z.number().int(),
  email: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  nickname: z.string(),
  avatar: z.string(),
  /**
   * [UserPreferences]
   */
  preferences: jsonSchema,
  joined_on: z.date(),
  public_avatar: z.string().nullish(),
  pronouns: z.string().nullish(),
})

export interface CompleteUser extends z.infer<typeof _UserModel> {
  attendees: CompleteAttendee[]
  check_with_tech_confirmed: CompleteCheckWithTech[]
  check_with_tech_submitted: CompleteCheckWithTech[]
  committee_positions: CompleteCommitteePositionMember[]
  crews: CompleteCrew[]
  events_events_created_byTousers: CompleteEvent[]
  events_events_deleted_byTousers: CompleteEvent[]
  hosted_events: CompleteEvent[]
  events_events_updated_byTousers: CompleteEvent[]
  identities: CompleteIdentity[]
  RecurringAttendee: CompleteRecurringAttendee[]
  role_members: CompleteRoleMember[]
}

/**
 * UserModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const UserModel: z.ZodSchema<CompleteUser> = z.lazy(() => _UserModel.extend({
  attendees: AttendeeModel.array(),
  check_with_tech_confirmed: CheckWithTechModel.array(),
  check_with_tech_submitted: CheckWithTechModel.array(),
  committee_positions: CommitteePositionMemberModel.array(),
  crews: CrewModel.array(),
  events_events_created_byTousers: EventModel.array(),
  events_events_deleted_byTousers: EventModel.array(),
  hosted_events: EventModel.array(),
  events_events_updated_byTousers: EventModel.array(),
  identities: IdentityModel.array(),
  RecurringAttendee: RecurringAttendeeModel.array(),
  role_members: RoleMemberModel.array(),
}))
