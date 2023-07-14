import * as z from "zod"
import { CompleteVideoItem, VideoItemModel, CompleteUser, UserModel } from "./index"

export const _SeriesModel = z.object({
  series_id: z.number().int(),
  lft: z.number().int(),
  rgt: z.number().int(),
  name: z.string(),
  in_url: z.boolean(),
  url: z.string(),
  description: z.string(),
  thumbnail: z.string(),
  tags: z.string().array(),
  status: z.string(),
  created_at: z.date(),
  created_by: z.number().int().nullish(),
  updated_at: z.date().nullish(),
  updated_by: z.number().int().nullish(),
  deleted_at: z.date().nullish(),
  deleted_by: z.number().int().nullish(),
})

export interface CompleteSeries extends z.infer<typeof _SeriesModel> {
  items: CompleteVideoItem[]
  users_series_created_byTousers?: CompleteUser | null
  users_series_deleted_byTousers?: CompleteUser | null
  users_series_updated_byTousers?: CompleteUser | null
}

/**
 * SeriesModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const SeriesModel: z.ZodSchema<CompleteSeries> = z.lazy(() => _SeriesModel.extend({
  items: VideoItemModel.array(),
  users_series_created_byTousers: UserModel.nullish(),
  users_series_deleted_byTousers: UserModel.nullish(),
  users_series_updated_byTousers: UserModel.nullish(),
}))
