import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

export async function listEventsForMonth(year: number, month: number) {
  return await prisma.event.findMany({
    where: {
      start_date: {
        // javascript dates are 0-indexed for months, but humans are 1-indexed
        // (human is dealt with at the API layer to avoid confusing JS everywhere else)
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
        },
      },
      users_events_created_byTousers: true,
      users_events_updated_byTousers: true,
    },
  });
}

export async function getEvent(id: number) {
  return await prisma.event.findFirst({
    where: {
      event_id: id,
    },
    include: {
      attendees: {
        include: {
          users: true,
          events: true,
        },
      },
      users_events_created_byTousers: true,
      users_events_updated_byTousers: true,
    },
  });
}

export async function createEvent(event: Prisma.EventUncheckedCreateInput) {
  return await prisma.event.create({
    data: event,
  });
}
