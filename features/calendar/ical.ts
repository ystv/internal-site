import { getUserName } from "@/components/UserHelpers";
import { prisma } from "@/lib/db";
import { decode, encode } from "@/lib/sessionSecrets";
import ical from "ical-generator";
import invariant from "@/lib/invariant";
import { Prisma } from "@prisma/client";
import { preferenceDefaults } from "../people";

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
  let filters: Prisma.EventWhereInput;
  switch (preferenceDefaults(user.preferences).icalFilter) {
    case "all":
      filters = {
        end_date: {
          gte: new Date(),
        },
      };
      break;
    case "only-mine":
      filters = {
        AND: [
          {
            end_date: {
              gte: new Date(),
            },
          },
          {
            OR: [
              {
                attendees: {
                  some: {
                    user_id: userID,
                  },
                },
              },
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
            ],
          },
        ],
      };
      break;
    default:
      invariant(false, `Unknown icalFilter ${user.preferences.icalFilter}`);
  }
  const events = await prisma.event.findMany({
    where: filters,
  });
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
