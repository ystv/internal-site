import { getUserName } from "@/components/UserHelpers";
import { prisma } from "@/lib/db";
import { decode, encode } from "@/lib/sessionSecrets";
import ical from "ical-generator";
import invariant from "@/lib/invariant";
import { Prisma } from "@prisma/client";
import { preferenceDefaults } from "../people";
import { EventObjectType, listEventsForMonth } from "./events";

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

  const now = new Date();

  let events: EventObjectType[];
  switch (preferenceDefaults(user.preferences).icalFilter) {
    case "all":
      events = await listEventsForMonth(now.getFullYear(), now.getMonth());
      break;
    case "only-mine":
      events = await listEventsForMonth(
        now.getFullYear(),
        now.getMonth(),
        userID,
      );
      break;
    default:
      invariant(false, `Unknown icalFilter ${user.preferences.icalFilter}`);
  }
  const calendar = ical({ name: `YSTV Calendar for ${getUserName(user)}` });
  for (const evt of events) {
    calendar.createEvent({
      summary: evt.name,
      start: evt.start_date,
      end: evt.end_date,
      description: evt.description,
      location: evt.location,
      url: `${process.env.PUBLIC_URL}/calendar/${evt.event_id}`,
    });
  }
  return calendar.toString();
}
