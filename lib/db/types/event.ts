import * as z from "zod"
import { CompleteAttendee, AttendeeModel, CompleteCheckWithTech, CheckWithTechModel, CompleteUser, UserModel, CompleteRecurringEvent, RecurringEventModel, CompleteSignupSheet, SignupSheetModel } from "./index"

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
  created_by: z.number().int(),
  updated_at: z.date().nullish(),
  updated_by: z.number().int().nullish(),
  deleted_at: z.date().nullish(),
  deleted_by: z.number().int().nullish(),
  adam_rms_project_id: z.number().int().nullish(),
  host: z.number().int(),
  slack_channel_id: z.string(),
  recurring_event_id: z.number().int().nullish(),
})

export interface CompleteEvent extends z.infer<typeof _EventModel> {
  attendees: CompleteAttendee[]
  check_with_tech: CompleteCheckWithTech[]
  created_by_user: CompleteUser
  deleted_by_user?: CompleteUser | null
  host_user: CompleteUser
  recurring_event?: CompleteRecurringEvent | null
  updated_by_user?: CompleteUser | null
  signup_sheets: CompleteSignupSheet[]
}

/**
 * EventModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const EventModel: z.ZodSchema<CompleteEvent> = z.lazy(() => _EventModel.extend({
  attendees: AttendeeModel.array(),
  check_with_tech: CheckWithTechModel.array(),
  created_by_user: UserModel,
  deleted_by_user: UserModel.nullish(),
  host_user: UserModel,
  recurring_event: RecurringEventModel.nullish(),
  updated_by_user: UserModel.nullish(),
  signup_sheets: SignupSheetModel.array(),
}))
