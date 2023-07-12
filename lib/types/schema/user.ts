import * as z from "zod"
import { CompleteAttendee, AttendeeModel, CompleteCrew, CrewModel, CompleteEvent, EventModel, CompletePositionGroup, PositionGroupModel, CompleteOfficershipMember, OfficershipMemberModel, CompleteRoleMember, RoleMemberModel, CompleteVideoItem, VideoItemModel, CompletePlaylist, PlaylistModel, CompleteSeries, SeriesModel } from "./index"

export const _UserModel = z.object({
  user_id: z.number().int(),
  username: z.string(),
  university_username: z.string(),
  email: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  nickname: z.string(),
  login_type: z.string(),
  password: z.string(),
  salt: z.string(),
  avatar: z.string(),
  last_login: z.date().nullish(),
  reset_pw: z.boolean(),
  enabled: z.boolean(),
  created_at: z.date(),
  created_by: z.number().int().nullish(),
  updated_at: z.date().nullish(),
  updated_by: z.number().int().nullish(),
  deleted_at: z.date().nullish(),
  deleted_by: z.number().int().nullish(),
})

export interface CompleteUser extends z.infer<typeof _UserModel> {
  attendees: CompleteAttendee[]
  crews: CompleteCrew[]
  events_events_created_byTousers: CompleteEvent[]
  events_events_deleted_byTousers: CompleteEvent[]
  events_events_updated_byTousers: CompleteEvent[]
  position_groups: CompletePositionGroup[]
  officership_members: CompleteOfficershipMember[]
  role_members: CompleteRoleMember[]
  users_users_created_byTousers?: CompleteUser | null
  other_users_users_created_byTousers: CompleteUser[]
  users_users_deleted_byTousers?: CompleteUser | null
  other_users_users_deleted_byTousers: CompleteUser[]
  users_users_updated_byTousers?: CompleteUser | null
  other_users_users_updated_byTousers: CompleteUser[]
  items_items_created_byTousers: CompleteVideoItem[]
  items_items_deleted_byTousers: CompleteVideoItem[]
  items_items_updated_byTousers: CompleteVideoItem[]
  playlists_playlists_created_byTousers: CompletePlaylist[]
  playlists_playlists_deleted_byTousers: CompletePlaylist[]
  playlists_playlists_updated_byTousers: CompletePlaylist[]
  series_series_created_byTousers: CompleteSeries[]
  series_series_deleted_byTousers: CompleteSeries[]
  series_series_updated_byTousers: CompleteSeries[]
}

/**
 * UserModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const UserModel: z.ZodSchema<CompleteUser> = z.lazy(() => _UserModel.extend({
  attendees: AttendeeModel.array(),
  crews: CrewModel.array(),
  events_events_created_byTousers: EventModel.array(),
  events_events_deleted_byTousers: EventModel.array(),
  events_events_updated_byTousers: EventModel.array(),
  position_groups: PositionGroupModel.array(),
  officership_members: OfficershipMemberModel.array(),
  role_members: RoleMemberModel.array(),
  users_users_created_byTousers: UserModel.nullish(),
  other_users_users_created_byTousers: UserModel.array(),
  users_users_deleted_byTousers: UserModel.nullish(),
  other_users_users_deleted_byTousers: UserModel.array(),
  users_users_updated_byTousers: UserModel.nullish(),
  other_users_users_updated_byTousers: UserModel.array(),
  items_items_created_byTousers: VideoItemModel.array(),
  items_items_deleted_byTousers: VideoItemModel.array(),
  items_items_updated_byTousers: VideoItemModel.array(),
  playlists_playlists_created_byTousers: PlaylistModel.array(),
  playlists_playlists_deleted_byTousers: PlaylistModel.array(),
  playlists_playlists_updated_byTousers: PlaylistModel.array(),
  series_series_created_byTousers: SeriesModel.array(),
  series_series_deleted_byTousers: SeriesModel.array(),
  series_series_updated_byTousers: SeriesModel.array(),
}))
