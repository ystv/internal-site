import slackApiConnection from "@/lib/slack/slackApiConnection";
import { getEvent } from "./events";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import {
  getCurrentUser,
  mustGetCurrentUser,
  requirePermission,
} from "@/lib/auth/server";
import { ExposedUserModel } from "../people/users";
import { _sendCWTFollowUpAndUpdateMessage } from "./check_with_tech_actions";
import invariant from "@/lib/invariant";

dayjs.extend(utc);
dayjs.extend(timezone);

export async function postCheckWithTech(
  eventID: number,
  memo: string,
  type: "check" | "help",
) {
  const slack = slackApiConnection();
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
    type === "help"
      ? `*${user} needs help with their production*`
      : `*#check-with-tech request from ${user}*`,
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
      unsure: type === "help",
    },
  });

  const res = await slack.client.chat.postMessage({
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
  invariant(res.ok, "Failed to send message");
  await prisma.checkWithTech.update({
    where: {
      cwt_id: cwt.cwt_id,
    },
    data: {
      slack_message_ts: res.ts,
    },
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
  const r = await prisma.checkWithTech.findFirst({
    where: {
      event_id: eventID,
    },
    orderBy: {
      submitted_at: "desc",
    },
    include: {
      submitted_by_user: {
        include: {
          identities: {
            where: {
              provider: "slack",
            },
            select: {
              provider: true,
            },
          },
        },
      },
      confirmed_by_user: true,
    },
  });
  if (!r) {
    return null;
  }
  return {
    ...r,
    submitted_by_user: ExposedUserModel.parse(r.submitted_by_user),
    confirmed_by_user: r.confirmed_by_user
      ? ExposedUserModel.parse(r.confirmed_by_user)
      : null,
    userHasSlack: r.submitted_by_user.identities.length > 0,
  };
}

export type CheckWithTechType = NonNullable<
  Awaited<ReturnType<typeof getLatestRequest>>
>;

export async function approveCheckWithTech(
  cwtID: number,
  newRequest: string,
  notes?: string,
) {
  await requirePermission("CheckWithTech.Admin");
  const cwt = await prisma.checkWithTech.findFirst({
    where: {
      cwt_id: cwtID,
    },
    include: {
      event: true,
      submitted_by_user: {
        include: {
          identities: {
            where: {
              provider: "slack",
            },
          },
        },
      },
    },
  });
  if (!cwt) {
    throw new Error("Request not found");
  }
  if (cwt.confirmed_by) {
    throw new Error("Request already confirmed");
  }
  const me = await mustGetCurrentUser();
  await prisma.checkWithTech.update({
    where: {
      cwt_id: cwtID,
    },
    data: {
      status: "Confirmed",
      confirmed_by: me.user_id,
      confirmed_at: new Date(),
      request: newRequest,
      notes: notes,
    },
  });
  await _sendCWTFollowUpAndUpdateMessage(
    cwt,
    me,
    "Confirmed",
    notes,
    newRequest,
  );
}

export async function declineCheckWithTech(cwtID: number, notes?: string) {
  await requirePermission("CheckWithTech.Admin");
  const cwt = await prisma.checkWithTech.findFirst({
    where: {
      cwt_id: cwtID,
    },
    include: {
      event: true,
      submitted_by_user: {
        include: {
          identities: {
            where: {
              provider: "slack",
            },
          },
        },
      },
    },
  });
  if (!cwt) {
    throw new Error("Request not found");
  }
  if (cwt.confirmed_by) {
    throw new Error("Request already confirmed");
  }
  const me = await mustGetCurrentUser();
  await prisma.checkWithTech.update({
    where: {
      cwt_id: cwtID,
    },
    data: {
      status: "Rejected",
      confirmed_at: new Date(),
      confirmed_by: me.user_id,
      notes: notes,
    },
  });
  await _sendCWTFollowUpAndUpdateMessage(cwt, me, "Rejected", notes);
}

export async function addNoteToCheckWithTech(cwtID: number, notes: string) {
  await requirePermission("CheckWithTech.Admin");
  await prisma.checkWithTech.update({
    where: {
      cwt_id: cwtID,
    },
    data: {
      notes: notes,
    },
  });
}
