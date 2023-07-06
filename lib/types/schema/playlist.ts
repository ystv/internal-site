import * as z from "zod"
import { CompletePlaylistItem, PlaylistItemModel, CompleteUser, UserModel } from "./index"

export const _PlaylistModel = z.object({
  playlist_id: z.number().int(),
  name: z.string(),
  description: z.string(),
  thumbnail: z.string(),
  status: z.string(),
  created_at: z.date(),
  created_by: z.number().int().nullish(),
  updated_at: z.date().nullish(),
  updated_by: z.number().int().nullish(),
  deleted_at: z.date().nullish(),
  deleted_by: z.number().int().nullish(),
})

export interface CompletePlaylist extends z.infer<typeof _PlaylistModel> {
  playlist_items: CompletePlaylistItem[]
  users_playlists_created_byTousers?: CompleteUser | null
  users_playlists_deleted_byTousers?: CompleteUser | null
  users_playlists_updated_byTousers?: CompleteUser | null
}

/**
 * PlaylistModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const PlaylistModel: z.ZodSchema<CompletePlaylist> = z.lazy(() => _PlaylistModel.extend({
  playlist_items: PlaylistItemModel.array(),
  users_playlists_created_byTousers: UserModel.nullish(),
  users_playlists_deleted_byTousers: UserModel.nullish(),
  users_playlists_updated_byTousers: UserModel.nullish(),
}))
