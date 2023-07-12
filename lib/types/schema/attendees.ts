import * as z from "zod"
import { Completeevents, eventsModel, CompleteUser, UserModel } from "./index"

export const _attendeesModel = z.object({
  event_id: z.number().int(),
  user_id: z.number().int(),
  attend_status: z.string(),
})

export interface Completeattendees extends z.infer<typeof _attendeesModel> {
  events: Completeevents
  users: CompleteUser
}

/**
 * attendeesModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const attendeesModel: z.ZodSchema<Completeattendees> = z.lazy(() => _attendeesModel.extend({
  events: eventsModel,
  users: UserModel,
}))
