import * as z from "zod"
import { CompleteEncodeFormat, EncodeFormatModel, CompleteVideoItem, VideoItemModel } from "./index"

export const _VideoFileModel = z.object({
  file_id: z.number().int(),
  video_id: z.number().int(),
  format_id: z.number().int(),
  uri: z.string(),
  status: z.string(),
  size: z.bigint(),
  is_source: z.boolean(),
})

export interface CompleteVideoFile extends z.infer<typeof _VideoFileModel> {
  encode_formats: CompleteEncodeFormat
  items: CompleteVideoItem
}

/**
 * VideoFileModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const VideoFileModel: z.ZodSchema<CompleteVideoFile> = z.lazy(() => _VideoFileModel.extend({
  encode_formats: EncodeFormatModel,
  items: VideoItemModel,
}))
