import * as z from "zod"
import { CompleteEvent, EventModel, CompleteUser, UserModel } from "./index"

export const _AttendeeModel = z.object({
  event_id: z.number().int(),
  user_id: z.number().int(),
  attend_status: z.string(),
})

export interface CompleteAttendee extends z.infer<typeof _AttendeeModel> {
  events: CompleteEvent
  users: CompleteUser
}

/**
 * AttendeeModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const AttendeeModel: z.ZodSchema<CompleteAttendee> = z.lazy(() => _AttendeeModel.extend({
  events: EventModel,
  users: UserModel,
}))
