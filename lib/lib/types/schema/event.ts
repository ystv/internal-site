import * as z from "zod"
import { CompleteAttendee, AttendeeModel, CompleteUser, UserModel, CompleteSignupSheet, SignupSheetModel } from "./index"

export const _EventModel = z.object({
  event_id: z.number().int(),
  event_type: z.string(),
  name: z.string(),
  start_date: z.date(),
  end_date: z.date(),
  description: z.string(),
  location: z.string(),
  is_private: z.boolean(),
  is_cancelled: z.boolean(),
  is_tentative: z.boolean(),
  created_at: z.date(),
  created_by: z.number().int().nullish(),
  updated_at: z.date().nullish(),
  updated_by: z.number().int().nullish(),
  deleted_at: z.date().nullish(),
  deleted_by: z.number().int().nullish(),
})

export interface CompleteEvent extends z.infer<typeof _EventModel> {
  attendees: CompleteAttendee[]
  users_events_created_byTousers?: CompleteUser | null
  users_events_deleted_byTousers?: CompleteUser | null
  users_events_updated_byTousers?: CompleteUser | null
  signup_sheets: CompleteSignupSheet[]
}

/**
 * EventModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const EventModel: z.ZodSchema<CompleteEvent> = z.lazy(() => _EventModel.extend({
  attendees: AttendeeModel.array(),
  users_events_created_byTousers: UserModel.nullish(),
  users_events_deleted_byTousers: UserModel.nullish(),
  users_events_updated_byTousers: UserModel.nullish(),
  signup_sheets: SignupSheetModel.array(),
}))
