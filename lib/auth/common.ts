import { z } from "zod";


/**
 * Available permissions. Should contain all the ones that users are expected
 * to have, along with some special ones:
 * * MEMBER - any logged in user
 * * PUBLIC - open to the world with no authentication
 * * SuperUser - can do anything (don't use this unless you know what you're doing)
 */
// TODO: This is duplicated between here and the DB. In theory we could just use `string` as the type, but that
//  loses auto-complete. We could also auto-generate it from the DB, but my preference would be to remove the
//  DB permissions table entirely and have the codebase be the source of truth.
export const PermissionEnum = z.enum([
  "PUBLIC",
  "MEMBER",
  "SuperUser",
  "Watch.Admin",
  "Calendar.Admin",
  "Calendar.Show.Admin",
  "Calendar.Show.Creator",
  "Calendar.Meeting.Admin",
  "Calendar.Meeting.Creator",
  "Calendar.Social.Admin",
  "Calendar.Social.Creator",
  "ManageMembers.Members.List",
  "ManageMembers.Members.Admin",
  "ManageMembers.Admin",
]);
export type Permission = z.infer<typeof PermissionEnum>;

export * from "./errors";
