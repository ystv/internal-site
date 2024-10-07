import { userHasPermission } from "@/lib/auth/core";
import slackApiConnection from "@/lib/slack/slackApiConnection";
import { getEvent } from "./events";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import { getCurrentUser } from "@/lib/auth/server";

dayjs.extend(utc);
dayjs.extend(timezone);

export async function postCheckWithTech(eventID: number, memo: string) {
  const slack = await slackApiConnection();
  const event = await getEvent(eventID);
  if (!event) {
    throw new Error("Event not found");
  }
  const me = await getCurrentUser();
  const slackUser = me.identities.find((x) => x.provider === "slack");
  const user = slackUser
    ? `<@${slackUser.provider_key}>`
    : `${me.first_name} ${me.last_name}`;

  const lines = [
    `*#check-with-tech request from ${user}*`,
    event.name,
    dayjs(event.start_date)
      .tz("Europe/London")
      .format("dddd, MMMM D, YYYY h:mma") +
      " - " +
      (dayjs(event.end_date).isSame(event.start_date, "day")
        ? dayjs(event.end_date).tz("Europe/London").format("h:mma")
        : dayjs(event.end_date)
            .tz("Europe/London")
            .format("dddd, MMMM D, YYYY h:mma")),
    `${env.PUBLIC_URL}/calendar/${eventID}`,
    event.location,
    memo,
  ];

  const cwt = await prisma.checkWithTech.create({
    data: {
      event_id: eventID,
      submitted_by: me.user_id,
      request: memo,
    },
  });

  await slack.client.chat.postMessage({
    channel: env.SLACK_CHECK_WITH_TECH_CHANNEL ?? "#check-with-tech",
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: lines.join("\n"),
        },
      },
      {
        type: "context",
        elements: [
          {
            type: "plain_text",
            text: "For tech team use only:",
          },
        ],
      },
      {
        type: "actions",
        elements: [
          {
            type: "button",
            text: {
              type: "plain_text",
              text: "Approve",
            },
            value: cwt.cwt_id.toString(),
            action_id: "checkWithTech#approve",
            style: "primary",
          },
          {
            type: "button",
            text: {
              type: "plain_text",
              text: "Add Note",
            },
            value: cwt.cwt_id.toString(),
            action_id: "checkWithTech#note",
          },
          {
            type: "button",
            text: {
              type: "plain_text",
              text: "Decline",
            },
            value: cwt.cwt_id.toString(),
            action_id: "checkWithTech#decline",
          },
        ],
      },
    ],
  });
}

export async function postTechHelpRequest(eventID: number, memo: string) {
  const slack = await slackApiConnection();
  if (!slack) {
    throw new Error("No Slack app");
  }
  const event = await getEvent(eventID);
  if (!event) {
    throw new Error("Event not found");
  }
  const me = await getCurrentUser();
  const slackUser = me.identities.find((x) => x.provider === "slack");
  const user = slackUser
    ? `<@${slackUser.provider_key}>`
    : `${me.first_name} ${me.last_name}`;

  const lines = [
    `*${user} needs help with their production*`,
    event.name,
    dayjs(event.start_date)
      .tz("Europe/London")
      .format("dddd, MMMM D, YYYY h:mma") +
      " - " +
      (dayjs(event.end_date).isSame(event.start_date, "day")
        ? dayjs(event.end_date).tz("Europe/London").format("h:mma")
        : dayjs(event.end_date)
            .tz("Europe/London")
            .format("dddd, MMMM D, YYYY h:mma")),
    `${env.PUBLIC_URL}/calendar/${eventID}`,
    event.location,
    memo,
  ];

  await slack.client.chat.postMessage({
    channel: env.SLACK_TECH_HELP_CHANNEL ?? "#check-with-tech",
    text: lines.join("\n"),
    mrkdwn: true,
  });
}

export async function getEquipmentListTemplates() {
  return await prisma.equipmentListTemplate.findMany({
    where: {
      archived: false,
    },
  });
}

export async function getLatestRequest(eventID: number) {
  return await prisma.checkWithTech.findFirst({
    where: {
      event_id: eventID,
    },
    orderBy: {
      submitted_at: "desc",
    },
  });
}
