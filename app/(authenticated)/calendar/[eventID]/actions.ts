"use server";
import { getCurrentUser, mustGetCurrentUser } from "@/lib/auth/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { AttendStatus, AttendStatuses } from "@/features/calendar/statuses";
import * as Calendar from "@/features/calendar";
import { EventType, hasRSVP } from "@/features/calendar/types";
import { zodErrorResponse } from "@/components/FormServerHelpers";
import { EditEventSchema } from "@/app/(authenticated)/calendar/[eventID]/schema";
import { FormResponse } from "@/components/Form";
import { updateEventAttendeeStatus } from "@/features/calendar/events";
import invariant from "@/lib/invariant";
import { canManage } from "@/features/calendar";

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
  revalidatePath("calendar");
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

  revalidatePath(`/calendar/${evt.event_id}`);
  return { ok: true };
}

export async function createAdamRMSProject(eventID: number) {
  const me = await mustGetCurrentUser();
  const event = await Calendar.getEvent(eventID);
  invariant(event, "Event does not exist");

  if (!canManage(event, me)) {
    return {
      ok: false,
      errors: {
        root: "You do not have permission to cancel this event",
      },
    };
  }

  await Calendar.addProjectToAdamRMS(eventID, me.user_id);
  revalidatePath(`/calendar/${event.event_id}`);
  return { ok: true };
}

export async function cancelEvent(eventID: number) {
  const me = await mustGetCurrentUser();
  const event = await Calendar.getEvent(eventID);
  invariant(event, "Event does not exist");

  if (!canManage(event, me)) {
    return {
      ok: false,
      errors: {
        root: "You do not have permission to cancel this event",
      },
    };
  }

  await Calendar.cancelEvent(eventID);

  revalidatePath(`/calendar/${event.event_id}`);
  revalidatePath("/calendar");
  return { ok: true };
}

export async function reinstateEvent(eventID: number) {
  const me = await mustGetCurrentUser();
  const event = await Calendar.getEvent(eventID);
  invariant(event, "Event does not exist");

  if (!canManage(event, me)) {
    return {
      ok: false,
      errors: {
        root: "You do not have permission to reinstate this event",
      },
    };
  }

  await Calendar.reinstateEvent(eventID);

  revalidatePath(`/calendar/${event.event_id}`);
  revalidatePath("/calendar");
  return { ok: true };
}

export async function deleteEvent(eventID: number) {
  const me = await mustGetCurrentUser();
  const event = await Calendar.getEvent(eventID);
  invariant(event, "Event does not exist");

  if (!canManage(event, me)) {
    return {
      ok: false,
      errors: {
        root: "You do not have permission to delete this event",
      },
    };
  }

  await Calendar.deleteEvent(eventID, me.user_id);

  revalidatePath(`/calendar/${event.event_id}`);
  revalidatePath("/calendar");
  return { ok: true };
}
