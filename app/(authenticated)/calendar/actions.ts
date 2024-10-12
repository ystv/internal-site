"use server";

import { wrapServerAction } from "@/lib/actions";
import { mustGetCurrentUser } from "@/lib/auth/server";
import {
  EventObjectType,
  listEvents,
  listVacantEvents,
} from "@/features/calendar";
import invariant from "@/lib/invariant";
import dayjs from "dayjs";

dayjs.locale("en-gb");

export async function getCalendarEvents({
  year,
  month,
  day,
  view,
  userID,
}: {
  year: number;
  month: number;
  day: number;
  view?: string;
  userID?: number;
}) {
  const [start, end] = dateRangeForView(year, month, day, view);
  return await listEvents(start, end, userID);
}

function dateRangeForView(
  year: number,
  month: number,
  day: number,
  view?: string,
): [Date, Date] {
  // These are just starting points, they'll shift depending on the view
  let start = dayjs(new Date(year, month, day));
  let end = dayjs(new Date(year, month, day));

  switch (view) {
    case "dayGridWeek":
      // set end to the next Monday because the query does a <, not a <=
      start = start.startOf("week");
      end = start.endOf("week").add(1, "day");
      break;
    case "timeGridDay":
      // add a day because the query does a <, not a <=
      end = end.add(1, "day");
      break;
    case "dayGridMonth":
    case "listMonth":
    case undefined:
      start = start.startOf("month");
      end = start.endOf("month").add(1, "day");
      break;
    default:
      invariant(false, `Unknown calendar view ${view}`);
  }

  return [start.toDate(), end.toDate()];
}

export const fetchEvents = wrapServerAction(
  "fetchEvents",
  async function fetchEvents({
    year,
    month,
    day,
    view,
    filter,
  }: {
    year: number;
    month: number;
    day: number;
    view?: string;
    filter?: "all" | "mine" | "vacant";
  }): Promise<EventObjectType[]> {
    const me = await mustGetCurrentUser();
    switch (filter) {
      case "all":
      case undefined:
        return getCalendarEvents({ year, month, day, view });
      case "mine":
        return getCalendarEvents({
          year,
          month,
          day,
          view,
          userID: me.user_id,
        });
      case "vacant":
        return (
          await listVacantEvents({ role: undefined, date: { year, month } })
        ).events;
      default:
        invariant(false, `Unknown filter ${filter}`);
    }
  },
);
