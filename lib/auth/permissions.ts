import { z } from "zod";

/**
 * Available permissions. Should contain all the ones that users are expected
 * to have, along with some special ones:
 * * MEMBER - any logged in user
 * * PUBLIC - open to the world with no authentication (not used in practice)
 * * SuperUser - can do anything (don't use this unless you know what you're doing)
 */
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
  "CalendarIntegration.Admin",
  "ManageMembers.Members.List",
  "ManageMembers.Members.Admin",
  "ManageMembers.Admin",
  "ManageQuotes",
]);
export type Permission = z.infer<typeof PermissionEnum>;

/**
 * Checks if the given user has at least one of the given permissions.
 * @param perms
 */
export function hasPermission(
  user: { permissions: Permission[] },
  ...perms: Permission[]
): boolean {
  for (const perm of perms) {
    if (user.permissions.includes(perm)) {
      return true;
    }
  }
  // noinspection RedundantIfStatementJS
  if (user.permissions.includes("SuperUser")) {
    return true;
  }
  return false;
}
