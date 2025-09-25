import { type App } from "@slack/bolt";
import type { LinkUnfurls, MessageAttachment } from "@slack/types";

import * as CheckWithTech from "@/features/calendar/check_with_tech_actions";
import { prisma } from "../db";
import dayjs from "dayjs";
import dayjsformat from "dayjs/plugin/advancedFormat";
import { EventColours } from "@/features/calendar/types";

dayjs.extend(dayjsformat);

export async function setupActionHandlers(app: App) {
  // Check With Tech
  app.action(/^checkWithTech#.+/, async (action) => {
    await CheckWithTech.handleSlackAction(action);
  });
  app.view(/^checkWithTech#.+/, async (action) => {
    await CheckWithTech.handleSlackViewEvent(action);
  });

  app.action("userFeedback#searchSentry", async ({ ack }) => {
    await ack(); // no-op
  });

  // Link Unfurling
  app.event("link_shared", async ({ event, client, logger }) => {
    // Proudly stolen from Expedia
    // https://github.com/ExpediaGroup/insights-explorer/blob/0ec611f903e15857d29993543b61e3618c416b5e/packages/slackbot/src/app.ts#L43C3-L58C4
    const tuples = await Promise.all(
      event.links.map(async (link) => ({
        link,
        unfurl: await getUnfurl(link),
      })),
    );

    const unfurls = tuples
      .filter(({ unfurl }) => unfurl !== undefined)
      .reduce<LinkUnfurls>((accumulator, { link, unfurl }) => {
        accumulator[link.url] = unfurl!;
        return accumulator;
      }, {});

    if (Object.keys(unfurls).length > 0) {
      client.chat.unfurl({
        ts: event.message_ts,
        channel: event.channel,
        unfurls,
      });
    }
  });
}

async function getUnfurl({
  url,
  domain,
}: {
  url: string;
  domain: string;
}): Promise<MessageAttachment> {
  const trailingPath = url.substring(
    url.indexOf(domain) + domain.length,
    url.length,
  );

  let route: string;

  if (trailingPath.includes("?")) {
    route = trailingPath.substring(0, trailingPath.indexOf("?"));
  } else {
    route = trailingPath;
  }

  if (route.startsWith("/calendar/")) {
    const event = await prisma.event.findFirst({
      where: {
        event_id: Number(route.split("/")[2]),
      },
    });

    if (event) {
      return {
        color: Object.entries(EventColours).find(
          ([key]) => key === event.event_type,
        )?.[1],
        blocks: [
          {
            type: "header",
            text: {
              type: "plain_text",
              text: event.name,
              emoji: true,
            },
          },
          {
            type: "divider",
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `${
                event.location !== "" ? `\n*Location:* ${event.location}` : ""
              }\n*Event Type*: ${
                event.event_type.substring(0, 1).toUpperCase() +
                event.event_type.substring(1)
              }${
                event.description !== ""
                  ? `\n*Description:* ${event.description}`
                  : ""
              }${
                event.slack_channel_id !== ""
                  ? `\n*Slack Channel:* <#${event.slack_channel_id}>`
                  : ""
              }`,
            },

            fields: [
              {
                type: "mrkdwn",
                text: `*Start Time*: ${dayjs(event.start_date).format(
                  "HH:mm dddd Do MMM",
                )}\n*End Time*: ${dayjs(event.end_date).format(
                  "HH:mm dddd Do MMM",
                )}`,
              },
            ],
          },
        ],
      };
    }
  }

  return {
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "Event not found",
        },
      },
    ],
  };
}
