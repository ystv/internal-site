import { EventType } from "@/features/calendar/types";

import { Permission } from "@/lib/auth/common";

export function manageable(userPermissions: Permission[]): EventType[] {
  const permittedEventTypes: EventType[] = [];
  if (
    userPermissions.includes("Calendar.Admin") ||
    userPermissions.includes("SuperUser")
  ) {
    permittedEventTypes.push("show", "meeting", "social", "other");
  } else {
    if (
      userPermissions.includes("Calendar.Show.Admin") ||
      userPermissions.includes("Calendar.Show.Creator")
    ) {
      permittedEventTypes.push("show");
    }
    if (
      userPermissions.includes("Calendar.Meeting.Admin") ||
      userPermissions.includes("Calendar.Meeting.Creator")
    ) {
      permittedEventTypes.push("meeting");
    }
    if (
      userPermissions.includes("Calendar.Social.Admin") ||
      userPermissions.includes("Calendar.Social.Creator")
    ) {
      permittedEventTypes.push("social");
    }
  }
  return permittedEventTypes;
}

export function canManage(
  type: EventType,
  userPermissions: Permission[],
): boolean {
  return manageable(userPermissions).includes(type);
}
