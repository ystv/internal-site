import * as z from "zod"
import { CompleteCrew, CrewModel, CompleteEvent, EventModel } from "./index"

export const _SignupSheetModel = z.object({
  signup_id: z.number().int(),
  event_id: z.number().int(),
  title: z.string(),
  description: z.string(),
  unlock_date: z.date().nullish(),
  arrival_time: z.date(),
  start_time: z.date(),
  end_time: z.date(),
})

export interface CompleteSignupSheet extends z.infer<typeof _SignupSheetModel> {
  crews: CompleteCrew[]
  events: CompleteEvent
}

/**
 * SignupSheetModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const SignupSheetModel: z.ZodSchema<CompleteSignupSheet> = z.lazy(() => _SignupSheetModel.extend({
  crews: CrewModel.array(),
  events: EventModel,
}))
