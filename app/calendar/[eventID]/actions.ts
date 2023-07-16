"use server";
import { getCurrentUser } from "@/lib/auth/legacy";
import { revalidatePath } from "next/cache";
import { AttendStatus, AttendStatuses } from "@/features/calendar/statuses";
import * as Calendar from "@/features/calendar";
import { EventType, hasRSVP } from "@/features/calendar/types";

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

  await Calendar.updateEventAttendeeStatus(evt.event_id, me.id, status);

  revalidatePath("/calendar/[eventID]");
  return { ok: true };
}
