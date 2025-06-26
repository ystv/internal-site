import * as z from "zod"
import { CompleteEvent, EventModel } from "./index"

export const _RecurringEventModel = z.object({
  recurring_event_id: z.number().int(),
})

export interface CompleteRecurringEvent extends z.infer<typeof _RecurringEventModel> {
  events: CompleteEvent[]
}

/**
 * RecurringEventModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RecurringEventModel: z.ZodSchema<CompleteRecurringEvent> = z.lazy(() => _RecurringEventModel.extend({
  events: EventModel.array(),
}))
