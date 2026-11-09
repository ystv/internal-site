import * as z from "zod"
import { CheckWithTechStatus } from "@prisma/client"
import { CompleteUser, UserModel, CompleteEvent, EventModel } from "./index"

export const _CheckWithTechModel = z.object({
  cwt_id: z.number().int(),
  event_id: z.number().int(),
  submitted_by: z.number().int(),
  status: z.nativeEnum(CheckWithTechStatus),
  request: z.string(),
  notes: z.string(),
  confirmed_by: z.number().int().nullish(),
  confirmed_at: z.date().nullish(),
  submitted_at: z.date(),
  slack_message_ts: z.string().nullish(),
  unsure: z.boolean(),
})

export interface CompleteCheckWithTech extends z.infer<typeof _CheckWithTechModel> {
  confirmed_by_user?: CompleteUser | null
  event: CompleteEvent
  submitted_by_user: CompleteUser
}

/**
 * CheckWithTechModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const CheckWithTechModel: z.ZodSchema<CompleteCheckWithTech> = z.lazy(() => _CheckWithTechModel.extend({
  confirmed_by_user: UserModel.nullish(),
  event: EventModel,
  submitted_by_user: UserModel,
}))
