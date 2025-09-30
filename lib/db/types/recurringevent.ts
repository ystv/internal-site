import * as z from "zod"
import { CompleteEvent, EventModel, CompleteRecurringAttendee, RecurringAttendeeModel } from "./index"

export const _RecurringEventModel = z.object({
  recurring_event_id: z.number().int(),
  event_type: z.string(),
})

export interface CompleteRecurringEvent extends z.infer<typeof _RecurringEventModel> {
  events: CompleteEvent[]
  attendees: CompleteRecurringAttendee[]
}

/**
 * RecurringEventModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RecurringEventModel: z.ZodSchema<CompleteRecurringEvent> = z.lazy(() => _RecurringEventModel.extend({
  events: EventModel.array(),
  attendees: RecurringAttendeeModel.array(),
}))
