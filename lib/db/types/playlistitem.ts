import * as z from "zod"
import { CompletePlaylist, PlaylistModel, CompleteVideoItem, VideoItemModel } from "./index"

export const _PlaylistItemModel = z.object({
  playlist_id: z.number().int(),
  video_item_id: z.number().int(),
  position: z.number().int().nullish(),
})

export interface CompletePlaylistItem extends z.infer<typeof _PlaylistItemModel> {
  playlists: CompletePlaylist
  items: CompleteVideoItem
}

/**
 * PlaylistItemModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const PlaylistItemModel: z.ZodSchema<CompletePlaylistItem> = z.lazy(() => _PlaylistItemModel.extend({
  playlists: PlaylistModel,
  items: VideoItemModel,
}))
