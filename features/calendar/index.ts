import { prisma } from "@/lib/db";
import { Event } from "@prisma/client";

export async function listEventsForMonth(year: number, month: number) {
  return await prisma.event.findMany({
    where: {
      start_date: {
        gte: new Date(year, month, 1),
        lte: new Date(year, month + 1, 0),
      },
      deleted_at: null,
    },
    include: {
      attendees: {
        include: {
          users: true,
          events: true,
        }
      },
      users_events_created_byTousers: true,
      users_events_updated_byTousers: true,
    }
  });
}
