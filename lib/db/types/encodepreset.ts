import * as z from "zod"
import { CompleteEncodePresetFormat, EncodePresetFormatModel, CompleteVideoItem, VideoItemModel } from "./index"

export const _EncodePresetModel = z.object({
  preset_id: z.number().int(),
  name: z.string(),
  description: z.string(),
})

export interface CompleteEncodePreset extends z.infer<typeof _EncodePresetModel> {
  encode_preset_formats: CompleteEncodePresetFormat[]
  items: CompleteVideoItem[]
}

/**
 * EncodePresetModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const EncodePresetModel: z.ZodSchema<CompleteEncodePreset> = z.lazy(() => _EncodePresetModel.extend({
  encode_preset_formats: EncodePresetFormatModel.array(),
  items: VideoItemModel.array(),
}))
