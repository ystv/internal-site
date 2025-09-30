import * as z from "zod"
import { CompleteRecurringEvent, RecurringEventModel, CompleteUser, UserModel } from "./index"

export const _RecurringAttendeeModel = z.object({
  recurring_event_id: z.number().int(),
  user_id: z.number().int(),
  attend_status: z.string(),
})

export interface CompleteRecurringAttendee extends z.infer<typeof _RecurringAttendeeModel> {
  recurring_event: CompleteRecurringEvent
  users: CompleteUser
}

/**
 * RecurringAttendeeModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RecurringAttendeeModel: z.ZodSchema<CompleteRecurringAttendee> = z.lazy(() => _RecurringAttendeeModel.extend({
  recurring_event: RecurringEventModel,
  users: UserModel,
}))
