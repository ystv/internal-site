import * as z from "zod"
import { CompleteEncodePresetFormat, EncodePresetFormatModel, CompleteVideoFile, VideoFileModel } from "./index"

export const _EncodeFormatModel = z.object({
  format_id: z.number().int(),
  name: z.string(),
  description: z.string(),
  mime_type: z.string(),
  mode: z.string(),
  width: z.number().int(),
  height: z.number().int(),
  arguments: z.string(),
  file_suffix: z.string(),
  watermarked: z.boolean(),
})

export interface CompleteEncodeFormat extends z.infer<typeof _EncodeFormatModel> {
  encode_preset_formats: CompleteEncodePresetFormat[]
  files: CompleteVideoFile[]
}

/**
 * EncodeFormatModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const EncodeFormatModel: z.ZodSchema<CompleteEncodeFormat> = z.lazy(() => _EncodeFormatModel.extend({
  encode_preset_formats: EncodePresetFormatModel.array(),
  files: VideoFileModel.array(),
}))
