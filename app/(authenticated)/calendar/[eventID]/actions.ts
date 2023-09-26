"use server";
import { getCurrentUser, mustGetCurrentUser } from "@/lib/auth/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { AttendStatus, AttendStatuses } from "@/features/calendar/statuses";
import * as Calendar from "@/features/calendar";
import { EventType, hasRSVP } from "@/features/calendar/types";
import {
  canManage,
  canManageSignUpSheet,
} from "@/features/calendar/permissions";
import { zodErrorResponse } from "@/components/FormServerHelpers";
import {
  EditEventSchema,
  SignupSheetSchema,
} from "@/app/(authenticated)/calendar/[eventID]/schema";
import { FormResponse } from "@/components/Form";
import { updateSignUpSheet } from "@/features/calendar/signup_sheets";
import { updateEventAttendeeStatus } from "@/features/calendar/events";
import { isBefore } from "date-fns";
import invariant from "tiny-invariant";

export async function editEvent(
  eventID: number,
  payload: z.infer<typeof EditEventSchema>,
): Promise<FormResponse> {
  const me = await getCurrentUser();
  const data = await EditEventSchema.safeParseAsync(payload);
  if (!data.success) {
    return zodErrorResponse(data.error);
  }
  const result = await Calendar.updateEvent(eventID, data.data, me.user_id);
  if (!result.ok) {
    switch (result.reason) {
      case "kit_clash":
        return {
          ok: false,
          errors: {
            root: "The changed dates would result in a kit clash. Please contact the Tech Team.",
          },
        };
      default:
        return {
          ok: false,
          errors: {
            root: "An unknown error occurred (" + result.reason + ")",
          },
        };
    }
  }
  revalidatePath(`/calendar/${eventID}`);
  return { ok: true };
}

export async function updateAttendeeStatus(
  eventID: number,
  status: AttendStatus,
) {
  const me = await getCurrentUser();
  // NB: this is an action, so we can't trust the status
  if (!AttendStatuses.includes(status)) {
    return {
      ok: false,
      errors: {
        root: "Invalid status",
      },
    };
  }

  const evt = await Calendar.getEvent(eventID);
  if (!evt) {
    return {
      ok: false,
      errors: {
        root: "Event not found",
      },
    };
  }
  if (!hasRSVP(evt.event_type as unknown as EventType)) {
    return {
      ok: false,
      errors: {
        root: "This event cannot be RSVP'd to",
      },
    };
  }

  await updateEventAttendeeStatus(evt.event_id, me.user_id, status);

  revalidatePath("/calendar/[eventID]");
  return { ok: true };
}

export async function createSignUpSheet(
  eventID: number,
  sheet: z.infer<typeof SignupSheetSchema>,
): Promise<FormResponse> {
  const me = await getCurrentUser();

  const event = await Calendar.getEvent(eventID);
  if (!event) {
    return {
      ok: false,
      errors: {
        root: "Event not found",
      },
    };
  }
  if (!canManage(event, me)) {
    return {
      ok: false,
      errors: {
        root: "You do not have permission to manage this event",
      },
    };
  }

  const payload = SignupSheetSchema.safeParse(sheet);
  if (!payload.success) {
    return zodErrorResponse(payload.error);
  }

  await Calendar.createSignupSheet(eventID, payload.data);
  revalidatePath("/calendar/[eventID]");
  return { ok: true } as const;
}

export async function editSignUpSheet(
  sheetID: number,
  data: z.infer<typeof SignupSheetSchema>,
): Promise<FormResponse> {
  const me = await getCurrentUser();
  const sheet = await Calendar.getSignUpSheet(sheetID);
  if (!sheet) {
    return {
      ok: false,
      errors: {
        root: "Signup sheet not found",
      },
    };
  }
  if (!canManageSignUpSheet(sheet.events, sheet, me)) {
    return {
      ok: false,
      errors: {
        root: "You do not have permission to manage this signup sheet",
      },
    };
  }

  const payload = SignupSheetSchema.safeParse(data);
  if (!payload.success) {
    return zodErrorResponse(payload.error);
  }

  await updateSignUpSheet(sheetID, payload.data);
  revalidatePath("/calendar/[eventID]");
  return { ok: true } as const;
}

export async function deleteSignUpSheet(sheetID: number) {
  const me = await getCurrentUser();
  const sheet = await Calendar.getSignUpSheet(sheetID);
  if (!sheet) {
    return {
      ok: false,
      errors: {
        root: "Signup sheet not found",
      },
    };
  }
  if (!canManageSignUpSheet(sheet.events, sheet, me)) {
    return {
      ok: false,
      errors: {
        root: "You do not have permission to manage this signup sheet",
      },
    };
  }

  await Calendar.deleteSignUpSheet(sheetID);
  revalidatePath("/calendar/[eventID]");
  return { ok: true } as const;
}

export async function signUpToRole(sheetID: number, crewID: number) {
  const me = await getCurrentUser();
  const sheet = await Calendar.getSignUpSheet(sheetID);
  if (!sheet) {
    return {
      ok: false,
      errors: {
        root: "Signup sheet not found",
      },
    };
  }
  if (sheet.unlock_date && isBefore(new Date(), sheet.unlock_date)) {
    return {
      ok: false,
      errors: {
        root: "Signup sheet is locked",
      },
    };
  }
  const crew = sheet.crews.find((crew) => crew.crew_id === crewID);
  if (!crew) {
    return {
      ok: false,
      errors: {
        root: "Role not found",
      },
    };
  }
  if (crew.user_id !== null) {
    return {
      ok: false,
      errors: {
        root: "Role is already filled",
      },
    };
  }
  const res = await Calendar.signUpToRole(sheetID, crewID, me.user_id);
  if (!res.ok) {
    return {
      ok: false,
      errors: {
        root: res.reason,
      },
    };
  }
  revalidatePath("/calendar/[eventID]");
  return { ok: true };
}

export async function removeSelfFromRole(sheetID: number, crewID: number) {
  const me = await getCurrentUser();
  const sheet = await Calendar.getSignUpSheet(sheetID);
  if (!sheet) {
    return {
      ok: false,
      errors: {
        root: "Signup sheet not found",
      },
    };
  }
  if (sheet.unlock_date && isBefore(new Date(), sheet.unlock_date)) {
    return {
      ok: false,
      errors: {
        root: "Signup sheet is locked",
      },
    };
  }
  const crew = sheet.crews.find((crew) => crew.crew_id === crewID);
  if (!crew) {
    return {
      ok: false,
      errors: {
        root: "Role not found",
      },
    };
  }
  if (crew.user_id !== me.user_id) {
    return {
      ok: false,
      errors: {
        root: "You are not signed up for this role",
      },
    };
  }
  const res = await Calendar.removeUserFromRole(sheetID, crewID, me.user_id);
  if (!res.ok) {
    return {
      ok: false,
      errors: {
        root: res.reason,
      },
    };
  }
  revalidatePath("/calendar/[eventID]");
  return { ok: true };
}

export async function createAdamRMSProject(eventID: number) {
  const me = await mustGetCurrentUser();
  const event = await Calendar.getEvent(eventID);
  invariant(event, "Event does not exist");

  await Calendar.addProjectToAdamRMS(eventID, me.user_id);
  revalidatePath(`/calendar/${event.event_id}`);
  return { ok: true };
}
