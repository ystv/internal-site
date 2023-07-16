import { EventType } from "@/features/calendar/types";
import { Permission } from "@/lib/auth/common";
import { UserType } from "@/lib/auth/server";
import { SignupSheet } from "@prisma/client";
import { EventObjectType } from "@/features/calendar/index";
import { SignupSheetObjectType } from "@/features/calendar/signup_sheets";

/**
 * Which event types can a user with the given permissions administer,
 * whether or not they created it?
 * @param userPermissions
 */
export function adminEventTypes(userPermissions: Permission[]): EventType[] {
  const permittedEventTypes: EventType[] = [];
  if (
    userPermissions.includes("Calendar.Admin") ||
    userPermissions.includes("SuperUser")
  ) {
    permittedEventTypes.push("show", "meeting", "social", "other");
  } else {
    if (userPermissions.includes("Calendar.Show.Admin")) {
      permittedEventTypes.push("show");
    }
    if (userPermissions.includes("Calendar.Meeting.Admin")) {
      permittedEventTypes.push("meeting");
    }
    if (userPermissions.includes("Calendar.Social.Admin")) {
      permittedEventTypes.push("social");
    }
  }
  return permittedEventTypes;
}

/**
 * Which event types can a user with the given permissions create?
 * @param userPermissions
 */
export function creatableEventTypes(
  userPermissions: Permission[],
): EventType[] {
  const base = adminEventTypes(userPermissions);
  if (userPermissions.includes("Calendar.Show.Creator")) {
    base.push("show");
  }
  if (userPermissions.includes("Calendar.Meeting.Creator")) {
    base.push("meeting");
  }
  if (userPermissions.includes("Calendar.Social.Creator")) {
    base.push("social");
  }
  return base;
}

/**
 * Can this user create an event of this type?
 * @param type
 * @param user
 */
export function canCreate(type: EventType, user: UserType): boolean {
  return creatableEventTypes(user.permissions).includes(type);
}

/**
 * Can this user manage this event?
 * @param event
 * @param user
 */
export function canManage(event: EventObjectType, user: UserType) {
  if (event.created_by === user.user_id) {
    return true;
  }
  return adminEventTypes(user.permissions).includes(
    event.event_type as EventType,
  );
}

/**
 * Can this user manage this signup sheet?
 * @param event
 * @param sheet
 * @param user
 */
export function canManageSignUpSheet(
  event: EventObjectType,
  sheet: SignupSheetObjectType,
  user: UserType,
) {
  for (const pos of sheet.crews) {
    if (pos.positions?.admin && pos.user_id === user.user_id) {
      return true;
    }
  }
  return canManage(event, user);
}
