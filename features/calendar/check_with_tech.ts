import { getCurrentUser } from "@/lib/auth/server";
import slackApiConnection from "@/lib/slack/slackApiConnection";
import { getEvent } from "./events";
import dayjs from "dayjs";

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
  const user = me.slack_user_id
    ? `<@${me.slack_user_id}>`
    : `${me.first_name} ${me.last_name}`;

  const lines = [
    `*#check-with-tech request from ${user}*`,
    event.name,
    dayjs(event.start_date).format("dddd, MMMM D, YYYY") +
      " - " +
      (dayjs(event.end_date).isSame(event.start_date, "day")
        ? dayjs(event.end_date).format("h:mma")
        : dayjs(event.end_date).format("dddd, MMMM D, YYYY h:mma")),
    `${process.env.PUBLIC_URL}/calendar/${eventID}`,
    event.location,
    memo,
  ];

  await slack.client.chat.postMessage({
    channel: process.env.SLACK_CHECK_WITH_TECH_CHANNEL ?? "#check-with-tech",
    text: lines.join("\n"),
    mrkdwn: true,
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
  const user = me.slack_user_id
    ? `<@${me.slack_user_id}>`
    : `${me.first_name} ${me.last_name}`;

  const lines = [
    `*${user} needs help with their production*`,
    event.name,
    dayjs(event.start_date).format("dddd, MMMM D, YYYY") +
      " - " +
      (dayjs(event.end_date).isSame(event.start_date, "day")
        ? dayjs(event.end_date).format("h:mma")
        : dayjs(event.end_date).format("dddd, MMMM D, YYYY h:mma")),
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
