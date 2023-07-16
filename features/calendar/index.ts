import { prisma } from "@/lib/db";
import { Position, Prisma, User, Event } from "@prisma/client";
import { AttendStatus } from "@/features/calendar/statuses";
import SignupSheetUpdateInput = Prisma.SignupSheetUpdateInput;

const EventSelectors = {
  attendees: {
    include: {
      users: true,
      events: true,
    },
    where: {
      attend_status: {
        not: "unknown",
      },
    },
  },
  users_events_created_byTousers: true,
  users_events_updated_byTousers: true,
  signup_sheets: {
    include: {
      crews: {
        include: {
          users: true,
          positions: true,
        },
      },
    },
  },
} satisfies Prisma.EventInclude;

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
    include: EventSelectors,
  });
}

export async function getEvent(id: number) {
  return await prisma.event.findFirst({
    where: {
      event_id: id,
    },
    include: EventSelectors,
  });
}
export type EventObjectType = NonNullable<Awaited<ReturnType<typeof getEvent>>>;

export async function createEvent(
  event: Prisma.EventUncheckedCreateInput,
): Promise<EventObjectType> {
  return await prisma.event.create({
    data: event,
    include: EventSelectors,
  });
}

export async function updateEventAttendeeStatus(
  eventID: number,
  userID: number,
  status: AttendStatus,
) {
  if (status === "unknown") {
    await prisma.attendee.delete({
      where: {
        event_id_user_id: {
          event_id: eventID,
          user_id: userID,
        },
      },
    });
  } else {
    await prisma.attendee.upsert({
      where: {
        event_id_user_id: {
          event_id: eventID,
          user_id: userID,
        },
      },
      update: {
        attend_status: status,
      },
      create: {
        event_id: eventID,
        user_id: userID,
        attend_status: status,
      },
    });
  }
}

export interface SignUpSheetType {
  signup_id: number;
  title: string;
  description: string;
  start_time: Date;
  end_time: Date;
  arrival_time: Date;
  unlock_date: Date | null;
  crews: Array<{
    crew_id: number;
    positions: Position;
    ordering: number;
    locked: boolean;
    user_id: number | null;
    users: User | null;
  }>;
}

export interface SignUpSheetWithEvent extends SignUpSheetType {
  events: Event;
}

export async function createSignupSheet(
  eventID: number,
  sheet: Omit<Prisma.SignupSheetCreateInput, "crews" | "events">,
) {
  await prisma.signupSheet.create({
    data: {
      event_id: eventID,
      title: sheet.title,
      description: sheet.description,
      start_time: sheet.start_time,
      end_time: sheet.end_time,
      arrival_time: sheet.arrival_time,
      unlock_date: sheet.unlock_date,
    },
  });
}

export async function getSignUpSheet(
  sheetID: number,
): Promise<SignUpSheetWithEvent | null> {
  return prisma.signupSheet.findFirst({
    where: {
      signup_id: sheetID,
    },
    include: {
      crews: {
        include: {
          users: true,
          positions: true,
        },
      },
      events: true,
    },
  });
}

export async function updateSignUpSheet(
  sheetID: number,
  data: Omit<SignupSheetUpdateInput, "crews" | "events">,
) {
  return prisma.signupSheet.update({
    where: {
      signup_id: sheetID,
    },
    data,
  });
}
