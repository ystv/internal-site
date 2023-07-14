"use server";
import { getCurrentUser } from "@/lib/auth/legacy";
import { AttendStatuses } from "@/app/calendar/[eventID]/common";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { zfd } from "zod-form-data";
import { zodErrorResponse } from "@/components/FormServerHelpers";

const updateAttendeeStatusSchema = zfd.formData({
  event_id: z.coerce.number(),
  status: z.enum(AttendStatuses),
});

export async function updateAttendeeStatus(data: FormData) {
  const me = await getCurrentUser();
  const payload = updateAttendeeStatusSchema.safeParse(data);
  if (!payload.success) {
    return zodErrorResponse(payload.error);
  }

  if (payload.data.status === "unknown") {
    await prisma.attendee.delete({
      where: {
        event_id_user_id: {
          event_id: payload.data.event_id,
          user_id: me.id,
        },
      },
    });
  } else {
    await prisma.attendee.upsert({
      where: {
        event_id_user_id: {
          event_id: payload.data.event_id,
          user_id: me.id,
        },
      },
      update: {
        attend_status: payload.data.status,
      },
      create: {
        event_id: payload.data.event_id,
        user_id: me.id,
        attend_status: payload.data.status,
      },
    });
  }

  revalidatePath("/calendar/[eventID]");
  return { ok: true };
}
