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
  created_by: z.number().int(),
  updated_at: z.date().nullish(),
  updated_by: z.number().int().nullish(),
  deleted_at: z.date().nullish(),
  deleted_by: z.number().int().nullish(),
  adam_rms_project_id: z.number().int().nullish(),
})

export interface CompleteEvent extends z.infer<typeof _EventModel> {
  attendees: CompleteAttendee[]
  created_by_user: CompleteUser
  deleted_by_user?: CompleteUser | null
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
  created_by_user: UserModel,
  deleted_by_user: UserModel.nullish(),
  updated_by_user: UserModel.nullish(),
  signup_sheets: SignupSheetModel.array(),
}))
