import * as z from "zod"
import { CompleteCrew, CrewModel, CompleteEvent, EventModel } from "./index"

export const _SignupSheetModel = z.object({
  signup_id: z.number().int(),
  event_id: z.number().int().nullish(),
  title: z.string(),
  description: z.string(),
  unlock_date: z.date().nullish(),
  arrival_time: z.date().nullish(),
  start_time: z.date().nullish(),
  end_time: z.date().nullish(),
})

export interface CompleteSignupSheet extends z.infer<typeof _SignupSheetModel> {
  crews: CompleteCrew[]
  events?: CompleteEvent | null
}

/**
 * SignupSheetModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const SignupSheetModel: z.ZodSchema<CompleteSignupSheet> = z.lazy(() => _SignupSheetModel.extend({
  crews: CrewModel.array(),
  events: EventModel.nullish(),
}))
