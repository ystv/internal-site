import {
  type Attendee,
  type Crew,
  type Event,
  type Position,
  type Prisma,
  type RecurringAttendee,
  type RecurringEvent,
  type SignupSheet,
  type User,
} from "@prisma/client";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { produce } from "immer";
import { z } from "zod";

import { type SignUpSheetType } from "@/features/calendar/signup_sheets";
import { type AttendStatus } from "@/features/calendar/statuses";
import { type EventType } from "@/features/calendar/types";
import { type ExposedUser, ExposedUserModel } from "@/features/people";
import * as AdamRMS from "@/lib/adamrms";
import { prisma } from "@/lib/db";
import "server-only";
import { env } from "@/lib/env";

dayjs.extend(timezone);
dayjs.extend(utc);

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
  adam_rms_project_id: number | null;
  host: number;
  host_user: ExposedUser;
  slack_channel_id: string | null;
  recurring_event_id: number | null;
}

export interface RecurringEventObjectType extends RecurringEvent {
  events: Event[];
  attendees: RecurringAttendee[];
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
  host?: number;
  slack_channel_id?: string;
}

export interface EventUpdateFields
  extends Omit<EventCreateUpdateFields, "start_date" | "end_date"> {
  start_date?: Date;
  end_date?: Date;
}

/**
 * Takes in an event object and replaces all user fields with ExposedUserModel equivalents, stripping
 * out all sensitive fields.
 * @param input an event or event-like object
 */

type sanitizableEvent = Event & {
  event_type: any; // the type coming from the DB is `string`;
  updated_by_user: User | null;
  host_user: User;
  signup_sheets: Array<
    SignupSheet & {
      crews: Array<Crew & { users: User | null; positions: Position }>;
    }
  >;
  attendees: Array<Attendee & { users: User; attend_status: any }>;
};
function sanitize(input: sanitizableEvent): EventObjectType {
  return produce(input, (draft) => {
    draft.event_type = draft.event_type as EventType;
    // @ts-expect-error
    draft.updated_by_user =
      draft.updated_by_user && ExposedUserModel.parse(draft.updated_by_user);
    // @ts-expect-error
    draft.host_user = ExposedUserModel.parse(draft.host_user);
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
  host_user: true,
  signup_sheets: {
    orderBy: {
      signup_id: "asc",
    },
    include: {
      crews: {
        orderBy: {
          crew_id: "asc",
        },
        include: {
          users: true,
          positions: true,
        },
      },
    },
  },
} satisfies Prisma.EventInclude;

export const publicEventSchema = z.object({
  event_id: z.number(),
  name: z.string(),
  description: z.string(),
  start_date: z.date(),
  end_date: z.date(),
  location: z.string(),
});

export async function listEvents(start: Date, end: Date, me?: number) {
  const events = await prisma.event.findMany({
    where: {
      start_date: {
        gte: start,
        lt: end,
      },
      deleted_at: null,
      OR: me
        ? [
            {
              signup_sheets: {
                some: {
                  crews: {
                    some: {
                      users: {
                        user_id: me,
                      },
                    },
                  },
                },
              },
            },
            {
              attendees: {
                some: {
                  user_id: me,
                  attend_status: { equals: "attending" },
                },
              },
            },
            {
              recurring_event_id: { not: null },
              recurring_event: {
                attendees: {
                  some: { user_id: me },
                },
              },
            },
          ]
        : undefined,
    },
    include: EventSelectors,
  });
  return events.map((e) => sanitize(e));
}

export async function listVacantEvents({
  role,
  date,
  includeAttendeeEvents,
}: {
  role?: number;
  date?: { year: number; month: number };
  includeAttendeeEvents?: boolean;
}) {
  const roleQuery = {
    AND: [
      { user_id: null },
      { locked: false },
      { custom_crew_member_name: null },
      { position_id: role ? { equals: role } : { not: undefined } },
    ],
  };

  const sheetQuery = {
    OR: [
      {
        unlock_date: null,
      },
      {
        unlock_date: {
          lt: new Date(),
        },
      },
    ],
  };

  const mainQuery = {
    where: {
      start_date: {
        // javascript dates are 0-indexed for months, but humans are 1-indexed
        // (human is dealt with at the API layer to avoid confusing JS everywhere else)
        gte: date ? new Date(date.year, date.month, 1) : new Date(),
        lt: date ? new Date(date.year, date.month + 1, 1) : undefined,
      },
      deleted_at: null,
      is_cancelled: false,
      OR: [
        {
          signup_sheets: {
            some: {
              AND: [
                sheetQuery,
                {
                  crews: {
                    some: roleQuery,
                  },
                },
              ],
            },
          },
        },
        {
          event_type: includeAttendeeEvents ? { not: "show" } : undefined,
        },
      ],
    },
    include: {
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
      host_user: true,
      signup_sheets: {
        orderBy: {
          signup_id: "asc",
        },
        where: sheetQuery,
        include: {
          crews: {
            orderBy: {
              crew_id: "asc",
            },
            where: roleQuery,
            include: {
              users: true,
              positions: true,
            },
          },
        },
      },
    },
    orderBy: {
      start_date: "asc",
    },
  } satisfies Prisma.EventFindManyArgs;

  // if (getCountOnly) {
  //   return (await prisma.event.findMany(mainQuery))
  //     .flatMap((event) =>
  //       event.signup_sheets.map((signupSheet) => signupSheet._count.crews),
  //     )
  //     .reduce((acc, curr) => acc + curr, 0);
  // }

  const vacantEvents = (await prisma.event.findMany(mainQuery)).map((e) =>
    sanitize(e as sanitizableEvent),
  );
  const vacantsignUpRolesCount = vacantEvents
    .flatMap((event) =>
      event.signup_sheets.map((signupSheet) => signupSheet.crews),
    )
    .reduce((acc, curr) => acc + curr.length, 0);
  return {
    events: vacantEvents,
    signUpRolesCount: vacantsignUpRolesCount,
  };
}

export async function listPublicEvents() {
  const eventSearchDate = dayjs().subtract(2, "hours").toDate();

  const res = await prisma.event.findMany({
    where: {
      event_type: "public",
      start_date: {
        gte: eventSearchDate,
      },
    },
    orderBy: {
      start_date: "asc",
    },
  });

  const publicEvents = z.array(publicEventSchema).parse(res);

  return publicEvents;
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

export async function getRecurringEvent(
  recurring_event_id: number,
): Promise<RecurringEventObjectType | null> {
  const res = await prisma.recurringEvent.findFirst({
    where: {
      events: {
        some: {
          recurring_event_id: recurring_event_id,
        },
      },
    },
    include: {
      events: true,
      attendees: true,
    },
  });
  if (!res) {
    return null;
  }

  return res;
}

export async function getRecurringEventFromEvent(
  event_id: number,
): Promise<RecurringEventObjectType | null> {
  const res = await prisma.recurringEvent.findFirst({
    where: {
      events: {
        some: {
          event_id: event_id,
        },
      },
    },
    include: {
      events: true,
      attendees: true,
    },
  });
  if (!res) {
    return null;
  }

  return res;
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
        host: event.host ?? currentUserID,
      },
      include: EventSelectors,
    }),
  );
}

export async function createRecurringEvent(
  event: EventCreateUpdateFields,
  currentUserID: number,
  recurringDates: Date[],
): Promise<EventObjectType> {
  const recurringEvent = await prisma.recurringEvent.create();

  const hourDiff = dayjs(event.start_date).diff(
    dayjs(event.start_date).tz(env.TZ_OVERRIDE, true),
    "hours",
  );

  console.log(hourDiff);

  const eventStartDate = dayjs(event.start_date).utc();

  for (const recurring_date of recurringDates) {
    const recurDate = dayjs(recurring_date);
    const recurStartDate = dayjs(event.start_date)
      .add(Math.ceil(recurDate.diff(eventStartDate, "days", true)), "days")
      .add(hourDiff, "hours")
      .tz(env.TZ_OVERRIDE, true);

    console.log(recurStartDate.toISOString());

    const recurEndDate = dayjs(event.end_date)
      .add(Math.ceil(recurDate.diff(eventStartDate, "days", true)), "days")
      .add(hourDiff, "hours");

    await prisma.event.create({
      data: {
        ...{ ...event, recurring_dates: undefined },

        start_date: recurStartDate.toDate(),
        end_date: recurEndDate.toDate(),
        recurring_event_id: recurringEvent.recurring_event_id,
        created_by: currentUserID,
        created_at: new Date(),
        updated_by: currentUserID,
        updated_at: new Date(),
        host: event.host ?? currentUserID,
        event_type: event.event_type,
      },
    });
  }

  return sanitize(
    await prisma.event.create({
      data: {
        ...{ ...event, recurring_dates: undefined },

        recurring_event_id: recurringEvent.recurring_event_id,
        created_by: currentUserID,
        created_at: new Date(),
        updated_by: currentUserID,
        updated_at: new Date(),
        host: event.host ?? currentUserID,
      },
      include: EventSelectors,
    }),
  );
}

export async function updateEvent(
  eventID: number,
  data: EventUpdateFields,
  currentUserID: number,
): Promise<
  { ok: true; result: EventObjectType } | { ok: false; reason: string }
> {
  const result = await prisma.$transaction(async ($db) => {
    // We use a raw query to get the event info so that we can SELECT FOR UPDATE,
    // otherwise this risks a race condition.
    const events = await $db.$queryRaw<
      { adam_rms_project_id: number | null; start_date: Date; end_date: Date }[]
    >`
      SELECT adam_rms_project_id, start_date, end_date FROM events WHERE event_id = ${eventID} FOR UPDATE`;
    if (events.length === 0) {
      throw new Error("Event not found");
    }
    const event = events[0];

    // If the dates have changed, we need to try moving it on AdamRMS first.
    // This is because AdamRMS will reject the request if the dates would cause a kit clash.
    // We change the "deliver dates" first, because this actually triggers the kit clash check.
    // Then if it succeeds we update it locally and update the event dates to match.
    if (
      event.adam_rms_project_id &&
      data.start_date &&
      data.end_date &&
      (event.start_date.getTime() !== data.start_date.getTime() ||
        event.end_date.getTime() !== data.end_date.getTime())
    ) {
      const result = await AdamRMS.changeProjectDates(
        event.adam_rms_project_id,
        data.start_date,
        data.end_date,
        "deliver_dates",
      );
      if (!result.changed) {
        return { ok: false, error: "kit_clash" };
      }
    }
    const result = await $db.event.update({
      where: {
        event_id: eventID,
      },
      data: {
        ...data,
        updated_by: currentUserID,
        updated_at: new Date(),
        host: data.host ?? currentUserID,
      },
      include: EventSelectors,
    });
    if (
      event.adam_rms_project_id &&
      data.start_date &&
      data.end_date &&
      (event.start_date.getTime() !== data.start_date.getTime() ||
        event.end_date.getTime() !== data.end_date.getTime())
    ) {
      await AdamRMS.changeProjectDates(
        event.adam_rms_project_id,
        data.start_date,
        data.end_date,
        "dates",
      );
    }
    return { ok: true, result };
  });
  if (!result.ok) {
    return { ok: false, reason: result.error! };
  }
  return { ok: true, result: sanitize(result.result!) };
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

export async function updateRecurringEventAttendeeStatus(
  recurringEventID: number,
  userID: number,
  status: AttendStatus,
) {
  if (status === "unknown") {
    await prisma.recurringAttendee.delete({
      where: {
        recurring_event_id_user_id: {
          recurring_event_id: recurringEventID,
          user_id: userID,
        },
      },
    });
  } else {
    await prisma.recurringAttendee.upsert({
      where: {
        recurring_event_id_user_id: {
          recurring_event_id: recurringEventID,
          user_id: userID,
        },
      },
      update: {
        attend_status: status,
      },
      create: {
        recurring_event_id: recurringEventID,
        user_id: userID,
        attend_status: status,
      },
    });
  }
}

export async function cancelEvent(eventID: number) {
  await prisma.event.update({
    where: {
      event_id: eventID,
    },
    data: {
      is_cancelled: true,
    },
  });
}

export async function reinstateEvent(eventID: number) {
  await prisma.event.update({
    where: {
      event_id: eventID,
    },
    data: {
      is_cancelled: false,
    },
  });
}

export async function deleteEvent(eventID: number, userID: number) {
  await prisma.event.update({
    where: {
      event_id: eventID,
    },
    data: {
      deleted_at: new Date(),
      deleted_by_user: {
        connect: {
          user_id: userID,
        },
      },
    },
  });
}

export async function getAllEventsForUser(userID: number) {
  const events = await prisma.event.findMany({
    where: {
      OR: [
        {
          signup_sheets: {
            some: {
              crews: {
                some: {
                  user_id: userID,
                },
              },
            },
          },
        },
        {
          attendees: {
            some: {
              user_id: userID,
            },
          },
        },
      ],
    },
    orderBy: {
      start_date: "asc",
    },
    include: {
      signup_sheets: {
        include: {
          crews: {
            include: {
              positions: true,
            },
            where: {
              user_id: userID,
            },
          },
        },
      },
    },
  });
  return events;
}
