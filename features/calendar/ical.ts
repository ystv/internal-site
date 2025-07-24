import { getUserName } from "@/components/UserHelpers";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import invariant from "@/lib/invariant";
import { decode, encode } from "@/lib/sessionSecrets";
import { add } from "date-fns";
import ical, { ICalEventStatus } from "ical-generator";
import { preferenceDefaults } from "../people";
import { EventObjectType, listEvents } from "./events";

export function encodeUserID(userID: number) {
  return encode({ userID });
}

export async function decodeUserID(token: string) {
  const { userID } = (await decode(token)) as { userID: number };
  invariant(userID, "No userID in token");
  return userID;
}

export async function generateICalFeedForUser(userID: number) {
  const user = await prisma.user.findFirstOrThrow({
    where: { user_id: userID },
    select: {
      first_name: true,
      last_name: true,
      nickname: true,
      preferences: true,
    },
  });

  const start = new Date();
  const end = add(start, { months: 3 });

  let events: EventObjectType[];
  switch (preferenceDefaults(user.preferences).icalFilter) {
    case "all":
      events = await listEvents(start, end);
      break;
    case "only-mine":
      events = await listEvents(start, end, userID);
      break;
    default:
      invariant(false, `Unknown icalFilter ${user.preferences.icalFilter}`);
  }
  const calendar = ical({ name: `YSTV Calendar for ${getUserName(user)}` });
  for (const evt of events) {
    calendar.createEvent({
      summary: (evt.is_cancelled ? "CANCELLED: " : "") + evt.name,
      start: evt.start_date,
      end: evt.end_date,
      description: evt.description,
      location: evt.location,
      url: `${env.PUBLIC_URL}/calendar/${evt.event_id}`,
      status: evt.is_cancelled
        ? ICalEventStatus.CANCELLED
        : evt.is_tentative
        ? ICalEventStatus.TENTATIVE
        : ICalEventStatus.CONFIRMED,
    });
  }
  return calendar.toString();
}
