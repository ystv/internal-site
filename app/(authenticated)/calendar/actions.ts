"use server";

import { wrapServerAction } from "@/lib/actions";
import { mustGetCurrentUser } from "@/lib/auth/server";
import {
  EventObjectType,
  EventTypes,
  listEvents,
  listVacantEvents,
} from "@/features/calendar";
import invariant from "@/lib/invariant";
import dayjs from "dayjs";
import { z } from "zod";

dayjs.locale("en-gb");

export async function getCalendarEvents({
  year,
  month,
  day,
  userID,
}: {
  year: number;
  month: number;
  day: number;
  userID?: number;
}) {
  const [start, end] = dateRangeForView(year, month, day);
  return await listEvents(start, end, userID);
}

function dateRangeForView(
  year: number,
  month: number,
  day: number,
): [Date, Date] {
  let start = dayjs(new Date(year, month, day));
  let end = dayjs(new Date(year, month, day));

  // We always fetch the full month, plus a week on either side
  // to ensure we have all the events we need for the view (including week view,
  // which can straddle a month boundary).
  start = start.subtract(1, "week");
  end = end.add(1, "month").add(1, "week");

  return [start.toDate(), end.toDate()];
}

const MinimalEventSchema = z.object({
  event_id: z.number(),
  event_type: z.enum(EventTypes),
  name: z.string(),
  start_date: z.date(),
  end_date: z.date(),
  is_tentative: z.boolean(),
  is_cancelled: z.boolean(),
});
export type MinimalEvent = z.infer<typeof MinimalEventSchema>;

export const fetchEvents = wrapServerAction(
  "fetchEvents",
  async function fetchEvents({
    year,
    month,
    day,
    filter,
  }: {
    year: number;
    month: number;
    day: number;
    filter?: "all" | "mine" | "vacant";
  }): Promise<MinimalEvent[]> {
    const me = await mustGetCurrentUser();
    let events;
    switch (filter) {
      case "all":
      case undefined:
        events = await getCalendarEvents({ year, month, day });
        break;
      case "mine":
        events = await getCalendarEvents({
          year,
          month,
          day,
          userID: me.user_id,
        });
        break;
      case "vacant":
        events = (
          await listVacantEvents({ role: undefined, date: { year, month } })
        ).events;
        break;
      default:
        invariant(false, `Unknown filter ${filter}`);
    }
    return events.map((event) => MinimalEventSchema.parse(event));
  },
);
