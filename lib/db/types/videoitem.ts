import * as z from "zod"
import { CompleteVideoFile, VideoFileModel, CompleteVideoHit, VideoHitModel, CompleteUser, UserModel, CompleteEncodePreset, EncodePresetModel, CompleteSeries, SeriesModel, CompletePlaylistItem, PlaylistItemModel } from "./index"

export const _VideoItemModel = z.object({
  video_id: z.number().int(),
  series_id: z.number().int(),
  name: z.string(),
  url: z.string(),
  description: z.string(),
  thumbnail: z.string(),
  duration: z.number().int(),
  views: z.number().int(),
  genre: z.number().int(),
  tags: z.string().array(),
  series_position: z.number().int().nullish(),
  status: z.string(),
  preset_id: z.number().int().nullish(),
  broadcast_date: z.date(),
  created_at: z.date(),
  created_by: z.number().int().nullish(),
  updated_at: z.date().nullish(),
  updated_by: z.number().int().nullish(),
  deleted_at: z.date().nullish(),
  deleted_by: z.number().int().nullish(),
})

export interface CompleteVideoItem extends z.infer<typeof _VideoItemModel> {
  files: CompleteVideoFile[]
  hits: CompleteVideoHit[]
  users_items_created_byTousers?: CompleteUser | null
  users_items_deleted_byTousers?: CompleteUser | null
  encode_presets?: CompleteEncodePreset | null
  series: CompleteSeries
  users_items_updated_byTousers?: CompleteUser | null
  playlist_items: CompletePlaylistItem[]
}

/**
 * VideoItemModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const VideoItemModel: z.ZodSchema<CompleteVideoItem> = z.lazy(() => _VideoItemModel.extend({
  files: VideoFileModel.array(),
  hits: VideoHitModel.array(),
  users_items_created_byTousers: UserModel.nullish(),
  users_items_deleted_byTousers: UserModel.nullish(),
  encode_presets: EncodePresetModel.nullish(),
  series: SeriesModel,
  users_items_updated_byTousers: UserModel.nullish(),
  playlist_items: PlaylistItemModel.array(),
}))
