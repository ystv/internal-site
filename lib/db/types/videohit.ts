import * as z from "zod"
import { CompleteVideoItem, VideoItemModel } from "./index"

export const _VideoHitModel = z.object({
  hit_id: z.number().int(),
  start_time: z.date(),
  mode: z.string(),
  ip_address: z.string(),
  client_info: z.string(),
  percent: z.number().int(),
  video_id: z.number().int(),
})

export interface CompleteVideoHit extends z.infer<typeof _VideoHitModel> {
  items: CompleteVideoItem
}

/**
 * VideoHitModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const VideoHitModel: z.ZodSchema<CompleteVideoHit> = z.lazy(() => _VideoHitModel.extend({
  items: VideoItemModel,
}))
