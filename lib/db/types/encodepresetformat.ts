import * as z from "zod"
import { CompleteEncodeFormat, EncodeFormatModel, CompleteEncodePreset, EncodePresetModel } from "./index"

export const _EncodePresetFormatModel = z.object({
  preset_id: z.number().int(),
  format_id: z.number().int(),
})

export interface CompleteEncodePresetFormat extends z.infer<typeof _EncodePresetFormatModel> {
  encode_formats: CompleteEncodeFormat
  encode_presets: CompleteEncodePreset
}

/**
 * EncodePresetFormatModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const EncodePresetFormatModel: z.ZodSchema<CompleteEncodePresetFormat> = z.lazy(() => _EncodePresetFormatModel.extend({
  encode_formats: EncodeFormatModel,
  encode_presets: EncodePresetModel,
}))
