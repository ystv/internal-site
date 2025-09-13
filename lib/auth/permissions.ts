import { z } from "zod";

/**
 * Available permissions. Should contain all the ones that users are expected
 * to have, along with some special ones:
 * * MEMBER - any logged in user
 * * PUBLIC - open to the world with no authentication (not implemented)
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
  "Calendar.Workshop.Admin",
  "Calendar.Workshop.Creator",
  "Calendar.Social.Admin",
  "Calendar.Social.Creator",
  "Calendar.Public.Admin",
  "Calendar.Public.Creator",
  "CalendarIntegration.Admin",
  "CheckWithTech.Submit",
  "CheckWithTech.Admin",
  "ManageQuotes",
  "People.ViewProfile.All",
  "Admin.Users",
  "Admin.Roles",
  "Admin.Positions",
  "Admin.Committee",
  "Webcams.Manage",
  "Webcams.View",
]);
export type Permission = z.infer<typeof PermissionEnum>;
