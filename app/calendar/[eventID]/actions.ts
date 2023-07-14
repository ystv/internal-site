"use server";
import { getCurrentUser } from "@/lib/auth/legacy";
import { AttendStatusLabels } from "@/app/calendar/[eventID]/common";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function updateAttendeeStatus(data: FormData) {
  const me = await getCurrentUser();
  const status = data.get("status");
  if (typeof status !== "string" || !(status in AttendStatusLabels)) {
    return {
      ok: false,
      errors: {
        status: "Invalid status",
      },
    };
  }
  const eventID = data.get("event_id");
  if (typeof eventID !== "string") {
    return {
      ok: false,
      errors: {
        event_id: "Invalid event ID",
      },
    };
  }

  await prisma.attendee.upsert({
    where: {
      event_id_user_id: {
        event_id: parseInt(eventID, 10),
        user_id: me.id,
      },
    },
    update: {
      attend_status: status,
    },
    create: {
      event_id: parseInt(eventID, 10),
      user_id: me.id,
      attend_status: status,
    },
  });
  revalidatePath("/calendar/[eventID]");
  return { ok: true };
}
