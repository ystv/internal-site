import * as z from "zod"
import { CheckWithTechStatus } from "@prisma/client"
import { CompleteEvent, EventModel, CompleteUser, UserModel } from "./index"

export const _CheckWithTechModel = z.object({
  cwt_id: z.number().int(),
  event_id: z.number().int(),
  submitted_by: z.number().int(),
  submitted_at: z.date(),
  status: z.nativeEnum(CheckWithTechStatus),
  request: z.string(),
  notes: z.string(),
  unsure: z.boolean(),
  slack_message_ts: z.string().nullish(),
  confirmed_by: z.number().int().nullish(),
  confirmed_at: z.date().nullish(),
})

export interface CompleteCheckWithTech extends z.infer<typeof _CheckWithTechModel> {
  event: CompleteEvent
  submitted_by_user: CompleteUser
  confirmed_by_user?: CompleteUser | null
}

/**
 * CheckWithTechModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const CheckWithTechModel: z.ZodSchema<CompleteCheckWithTech> = z.lazy(() => _CheckWithTechModel.extend({
  event: EventModel,
  submitted_by_user: UserModel,
  confirmed_by_user: UserModel.nullish(),
}))
