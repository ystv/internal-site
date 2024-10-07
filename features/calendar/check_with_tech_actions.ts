import { getUserName } from "@/components/UserHelpers";
import { userHasPermission } from "@/lib/auth/core";
import { prisma } from "@/lib/db";
import invariant from "@/lib/invariant";
import slackApiConnection from "@/lib/slack/slackApiConnection";
import { CheckWithTechStatus } from "@prisma/client";
import {
  SlackActionMiddlewareArgs,
  BlockAction,
  ButtonAction,
  SlackViewMiddlewareArgs,
  ViewSubmitAction,
  ContextBlock,
  Block,
} from "@slack/bolt";
import dayjs from "dayjs";
import { env } from "process";
import { z } from "zod";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

const ModelPrivateMetadataSchema = z.object({
  cwtID: z.number(),
  messageTS: z.string(),
  channelID: z.string(),
});
type ModalPrivateMetadata = z.infer<typeof ModelPrivateMetadataSchema>;

export async function handleSlackAction(data: SlackActionMiddlewareArgs) {
  if (!assertIsButtonAction(data)) {
    return;
  }
  const { ack, action, respond, payload, body, say } = data;
  await ack();

  const actorId = body.user.id;
  const actor = await prisma.user.findFirst({
    where: {
      identities: {
        some: {
          provider: "slack",
          provider_key: actorId,
        },
      },
    },
  });
  if (!actor) {
    await respond({
      text: `Please [link your Internal Site profile to Slack](${env.PUBLIC_URL}/user/me) to use this feature.`,
    });
    return;
  }
  if (!userHasPermission(actor.user_id, "CheckWithTech.Admin")) {
    await respond({
      text: "You do not have permission to use this feature.",
    });
    return;
  }

  const api = await slackApiConnection();

  const type = action.action_id.replace(/^checkWithTech#/, "");
  const cwtID = parseInt(action.value);
  const cwt = await prisma.checkWithTech.findUnique({
    where: {
      cwt_id: cwtID,
    },
  });
  if (!cwt) {
    await respond({
      text: "Something went wrong internally (CWT object not found). Please report this to the Computing Team.",
    });
    return;
  }
  invariant(body.message, "Message not found in action body");
  invariant(body.channel, "Channel not found in action body");
  const metadata: ModalPrivateMetadata = {
    cwtID,
    messageTS: body.message.ts,
    channelID: body.channel.id,
  };
  switch (type) {
    case "approve":
      await api.client.views.open({
        trigger_id: body.trigger_id,
        view: {
          type: "modal",
          title: {
            text: "Approve Request",
            type: "plain_text",
          },
          blocks: [
            {
              type: "input",
              block_id: "request",
              element: {
                type: "plain_text_input",
                action_id: "request",
                multiline: true,
                initial_value: cwt.request,
              },
              label: {
                type: "plain_text",
                text: "Request",
              },
              hint: {
                type: "plain_text",
                text: "This is the original request. Feel free to make any changes - these will get copied to AdamRMS.",
              },
            },
            {
              type: "input",
              block_id: "notes",
              element: {
                type: "plain_text_input",
                action_id: "notes",
                multiline: true,
                initial_value: cwt.notes,
              },
              label: {
                type: "plain_text",
                text: "Notes",
              },
              hint: {
                type: "plain_text",
                text: "Add any relevant notes here.",
              },
              optional: true,
            },
          ],
          submit: {
            type: "plain_text",
            text: "Approve",
          },
          callback_id: "checkWithTech#doApprove",
          private_metadata: JSON.stringify(metadata),
        },
      });
      break;
    case "note":
    case "decline":
      await api.client.views.open({
        trigger_id: body.trigger_id,
        view: {
          type: "modal",
          title: {
            text: type === "note" ? "Add Note" : "Decline Request",
            type: "plain_text",
          },
          blocks: [
            {
              type: "input",
              block_id: "notes",
              element: {
                type: "plain_text_input",
                action_id: "notes",
                multiline: true,
                initial_value: cwt.notes,
              },
              label: {
                type: "plain_text",
                text: "Notes",
              },
              hint: {
                type: "plain_text",
                text: "Add any relevant notes here.",
              },
              optional: true,
            },
          ],
          submit: {
            type: "plain_text",
            text: type === "note" ? "Add Note" : "Decline",
          },
          // prettier-ignore
          callback_id: `checkWithTech#do${type === "note" ? "Note" : "Decline"}`,
          private_metadata: JSON.stringify(metadata),
        },
      });
      break;
    default:
      await respond({
        text: `Something went wrong internally (unknown action type ${type}). Please report this to the Computing Team.`,
      });
  }
}

function assertIsButtonAction(
  args: SlackActionMiddlewareArgs,
): args is SlackActionMiddlewareArgs<BlockAction<ButtonAction>> {
  return args.payload.type === "button";
}

export async function handleSlackViewEvent(data: SlackViewMiddlewareArgs) {
  if (!assertIsViewSubmitAction(data)) {
    return;
  }
  const { ack, body, view } = data;

  const actorId = body.user.id;
  const actor = await prisma.user.findFirst({
    where: {
      identities: {
        some: {
          provider: "slack",
          provider_key: actorId,
        },
      },
    },
  });
  if (!actor) {
    await ack({
      response_action: "errors",
      errors: {
        request:
          "Please link your Internal Site profile to Slack to use this feature.",
      },
    });
    return;
  }
  if (!userHasPermission(actor.user_id, "CheckWithTech.Admin")) {
    await ack({
      response_action: "errors",
      errors: {
        request: "You do not have permission to use this feature.",
      },
    });
    return;
  }

  const meta = ModelPrivateMetadataSchema.parse(
    JSON.parse(body.view.private_metadata),
  );

  const cwt = await prisma.checkWithTech.findUnique({
    where: {
      cwt_id: meta.cwtID,
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
    await ack({
      response_action: "errors",
      errors: {
        request:
          "Something went wrong internally (CWT object not found). Please report this to the Computing Team.",
      },
    });
    return;
  }

  const values = view.state.values;
  const request = values.request.request.value;
  if (!request) {
    await ack({
      response_action: "errors",
      errors: {
        request: "Request cannot be empty.",
      },
    });
    return;
  }
  const notes = values.notes?.notes.value;
  let newStatus: CheckWithTechStatus | undefined;
  const reqType = body.view.callback_id.replace(/^checkWithTech#do/, "");
  switch (reqType) {
    case "Approve":
      newStatus = "Confirmed";
      break;
    case "Decline":
      newStatus = "Rejected";
      break;
  }
  await prisma.checkWithTech.update({
    where: {
      cwt_id: meta.cwtID,
    },
    data: {
      request,
      notes: notes ?? undefined,
      status: newStatus,
      confirmed_by: newStatus ? actor.user_id : undefined,
      confirmed_at: newStatus ? new Date() : undefined,
    },
  });
  await ack();

  if (!newStatus) {
    return;
  }
  const requestor = cwt.submitted_by_user.identities.find(
    (x) => x.provider === "slack",
  );
  if (!requestor) {
    return;
  }
  const api = await slackApiConnection();
  const responseParts = [
    `Your request for ${
      cwt.event.name
    } has been ${newStatus.toLowerCase()} by ${getUserName(actor)}.`,
    notes ? `Notes: ${notes}` : "",
    `View your event <${env.PUBLIC_URL}/calendar/${cwt.event_id}|here>.`,
  ].filter(Boolean);
  await api.client.chat.postMessage({
    channel: requestor.provider_key,
    text: responseParts.join("\n"),
    mrkdwn: true,
  });

  let newContext;
  switch (newStatus) {
    case "Confirmed":
      newContext = `:white_check_mark: Approved by ${getUserName(actor)}`;
      break;
    case "Rejected":
      newContext = `:x: Declined by ${getUserName(actor)}`;
      break;
  }

  const lines = [
    `*#check-with-tech request from ${getUserName(cwt.submitted_by_user)}*`,
    cwt.event.name,
    dayjs(cwt.event.start_date)
      .tz("Europe/London")
      .format("dddd, MMMM D, YYYY h:mma") +
      " - " +
      (dayjs(cwt.event.end_date).isSame(cwt.event.start_date, "day")
        ? dayjs(cwt.event.end_date).tz("Europe/London").format("h:mma")
        : dayjs(cwt.event.end_date)
            .tz("Europe/London")
            .format("dddd, MMMM D, YYYY h:mma")),
    `${env.PUBLIC_URL}/calendar/${cwt.event_id}`,
    cwt.event.location,
    request,
  ];

  await api.client.chat.update({
    channel: meta.channelID,
    ts: meta.messageTS,
    text: [...lines, newContext].join("\n"),
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
            text: newContext!,
            emoji: true,
          },
        ],
      },
    ],
  });
}

function assertIsViewSubmitAction(
  args: SlackViewMiddlewareArgs,
): args is SlackViewMiddlewareArgs<ViewSubmitAction> {
  return args.body.type === "view_submission";
}
