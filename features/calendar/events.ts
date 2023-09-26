import "server-only";
import { produce } from "immer";
import { prisma } from "@/lib/db";
import {
  Attendee,
  Crew,
  Prisma,
  Event,
  User,
  SignupSheet,
  Position,
} from "@prisma/client";
import { AttendStatus } from "@/features/calendar/statuses";
import { ExposedUser, ExposedUserModel } from "@/features/people";
import { SignUpSheetType } from "@/features/calendar/signup_sheets";
import { EventType } from "@/features/calendar/types";

export interface EventAttendee {
  event_id: number;
  user_id: number;
  attend_status: AttendStatus;
  users: ExposedUser;
}

export interface EventObjectType {
  event_id: number;
  event_type: EventType;
  name: string;
  description: string;
  start_date: Date;
  end_date: Date;
  location: string;
  is_private: boolean;
  is_tentative: boolean;
  is_cancelled: boolean;
  signup_sheets: SignUpSheetType[];
  attendees: EventAttendee[];
  created_by: number;
  updated_by: number | null;
  updated_by_user: ExposedUser | null;
  deleted_by: number | null;
}

export interface EventCreateUpdateFields {
  name: string;
  description: string;
  start_date: Date;
  end_date: Date;
  event_type?: EventType;
  location: string;
  is_private: boolean;
  is_tentative: boolean;
}

/**
 * Takes in an event object and replaces all user fields with ExposedUserModel equivalents, stripping
 * out all sensitive fields.
 * @param input an event or event-like object
 */
function sanitize(
  input: Event & {
    event_type: any; // the type coming from the DB is `string`;
    updated_by_user: User | null;
    signup_sheets: Array<
      SignupSheet & {
        crews: Array<Crew & { users: User | null; positions: Position }>;
      }
    >;
    attendees: Array<Attendee & { users: User; attend_status: any }>;
  },
): EventObjectType {
  return produce(input, (draft) => {
    draft.event_type = draft.event_type as EventType;
    // @ts-expect-error
    draft.updated_by_user =
      draft.updated_by_user && ExposedUserModel.parse(draft.updated_by_user);
    for (const sheet of draft.signup_sheets) {
      for (const crew of sheet.crews) {
        if (crew.users) {
          // @ts-expect-error
          crew.users = ExposedUserModel.parse(crew.users);
        }
      }
    }
    if (draft.attendees) {
      for (const attendee of draft.attendees) {
        // @ts-expect-error
        attendee.users = ExposedUserModel.parse(attendee.users);
      }
    }
  });
}

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
  created_by_user: true,
  updated_by_user: true,
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
  return (
    await prisma.event.findMany({
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
    })
  ).map((e) => sanitize(e));
}

export async function getEvent(id: number): Promise<EventObjectType | null> {
  const res = await prisma.event.findFirst({
    where: {
      event_id: id,
    },
    include: EventSelectors,
  });
  if (!res) {
    return null;
  }
  return sanitize(res);
}

export async function createEvent(
  event: EventCreateUpdateFields,
  currentUserID: number,
): Promise<EventObjectType> {
  return sanitize(
    await prisma.event.create({
      data: {
        ...event,
        created_by: currentUserID,
        created_at: new Date(),
        updated_by: currentUserID,
        updated_at: new Date(),
      },
      include: EventSelectors,
    }),
  );
}

export async function updateEvent(eventID: number, data: EventCreateUpdateFields, currentUserID: number) {
  return sanitize(
    await prisma.event.update({
      where: {
        event_id: eventID,
      },
      data: {
        ...data,
        updated_by: currentUserID,
        updated_at: new Date(),
      },
      include: EventSelectors
    })
  );
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
