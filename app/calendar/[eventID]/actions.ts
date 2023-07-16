"use server";
import { getCurrentUser } from "@/lib/auth/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { AttendStatus } from "@/features/calendar/statuses";
import * as Calendar from "@/features/calendar";
import { EventType, hasRSVP } from "@/features/calendar/types";
import { canManage } from "@/features/calendar/permissions";
import { zodErrorResponse } from "@/components/FormServerHelpers";
import { SignupSheetSchema } from "@/app/calendar/[eventID]/schema";

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

export async function createSignUpSheet(
  eventID: number,
  sheet: z.infer<typeof SignupSheetSchema>,
) {
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
