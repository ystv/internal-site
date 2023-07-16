"use server";
import { getCurrentUser } from "@/lib/auth/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { zfd } from "zod-form-data";
import { zodErrorResponse } from "@/components/FormServerHelpers";
import { AttendStatus, AttendStatuses } from "@/features/calendar/statuses";
import * as Calendar from "@/features/calendar";
import { EventType, hasRSVP } from "@/features/calendar/types";

const updateAttendeeStatusSchema = zfd.formData({
  event_id: z.coerce.number(),
  status: z.enum(AttendStatuses),
});

export async function updateAttendeeStatus(
  eventID: number,
  status: AttendStatus,
) {
  const me = await getCurrentUser();

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

  await Calendar.updateEventAttendeeStatus(evt.event_id, me.user_id, status);

  revalidatePath("/calendar/[eventID]");
  return { ok: true };
}
