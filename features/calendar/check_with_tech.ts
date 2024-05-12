import { getCurrentUser } from "@/lib/auth/server";
import slackApiConnection from "@/lib/slack/slackApiConnection";
import { getEvent } from "./events";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { prisma } from "@/lib/db";

dayjs.extend(utc);
dayjs.extend(timezone);

export async function postCheckWithTech(eventID: number, memo: string) {
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
    `${process.env.PUBLIC_URL}/calendar/${eventID}`,
    event.location,
    memo,
  ];

  await slack.client.chat.postMessage({
    channel: process.env.SLACK_CHECK_WITH_TECH_CHANNEL ?? "#check-with-tech",
    text: lines.join("\n"),
    mrkdwn: true,
  });

  await prisma.event.update({
    where: { event_id: eventID },
    data: { check_with_tech_status: "Requested" },
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
    `${process.env.PUBLIC_URL}/calendar/${eventID}`,
    event.location,
    memo,
  ];

  await slack.client.chat.postMessage({
    channel: process.env.SLACK_TECH_HELP_CHANNEL ?? "#tech",
    text: lines.join("\n"),
    mrkdwn: true,
  });
}
