import { getUserName } from "../../components/UserHelpers";
import { userHasPermission } from "@/lib/auth/core";
import { prisma } from "@/lib/db";
import invariant from "@/lib/invariant";
import slackApiConnection from "@/lib/slack/slackApiConnection";
import {
  CheckWithTech,
  CheckWithTechStatus,
  Event,
  Identity,
  User,
} from "@prisma/client";
import * as AdamRMS from "@/lib/adamrms";
import {
  SlackActionMiddlewareArgs,
  BlockAction,
  ButtonAction,
  SlackViewMiddlewareArgs,
  ViewSubmitAction,
  ContextBlock,
  Block,
  SectionBlock,
  RichTextBlock,
} from "@slack/bolt";
import dayjs from "dayjs";
import { env } from "@/lib/env";
import { z } from "zod";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { addProjectToAdamRMS } from "./adamRMS";

dayjs.extend(utc);
dayjs.extend(timezone);

const ModelPrivateMetadataSchema = z.object({
  cwtID: z.number(),
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

  const api = await slackApiConnection();

  if (!actor) {
    await api.client.chat.postEphemeral({
      channel: body.channel!.id,
      user: body.user.id,
      text: `Please <${env.PUBLIC_URL}/user/me|link your Internal Site profile to Slack> to use this feature.`,
    });
    return;
  }
  if (!(await userHasPermission(actor.user_id, "CheckWithTech.Admin"))) {
    await api.client.chat.postEphemeral({
      channel: body.channel!.id,
      user: body.user.id,
      text: "You do not have permission to use this feature.",
    });
    return;
  }

  const type = action.action_id.replace(/^checkWithTech#/, "");
  invariant(action.value, "Value not found in action");
  const cwtID = parseInt(action.value);
  const cwt = await prisma.checkWithTech.findUnique({
    where: {
      cwt_id: cwtID,
    },
    include: {
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
    await api.client.chat.postEphemeral({
      channel: body.channel!.id,
      user: body.user.id,
      text: "Something went wrong internally (CWT object not found). Please report this to the Computing Team.",
    });
    return;
  }
  invariant(body.message, "Message not found in action body");
  invariant(body.channel, "Channel not found in action body");

  const requestorHasSlack = cwt.submitted_by_user.identities.some(
    (x) => x.provider === "slack",
  );

  const metadata: ModalPrivateMetadata = {
    cwtID,
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
                text: "Add any relevant notes here. These will be visible to the requestor and other members of the tech team.",
              },
              optional: true,
            },
            cwt.unsure &&
              ({
                type: "context",
                elements: [
                  {
                    type: "plain_text",
                    text:
                      cwt.submitted_by_user.first_name +
                      " indicated they were unsure of what they need - please get in touch and amend as needed.",
                  },
                ],
              } satisfies ContextBlock),
            {
              type: "context",
              elements: [
                {
                  type: "plain_text",
                  text: "This will send a message to the requestor, containing the above note.",
                },
              ],
            },
            !requestorHasSlack &&
              ({
                type: "rich_text",
                elements: [
                  {
                    type: "rich_text_section",
                    elements: [
                      {
                        type: "text",
                        text: "The requestor does not have a linked Slack account, so they will not receive a message. Please get in touch with them directly.",
                        style: {
                          bold: true,
                        },
                      },
                    ],
                  },
                ],
              } satisfies RichTextBlock),
          ].filter((x) => !!x),
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
                text: "Add any relevant notes here. These will be visible to the requestor and other members of the tech team.",
              },
              optional: true,
            },
            {
              type: "context",
              elements: [
                {
                  type: "plain_text",
                  text:
                    type === "note"
                      ? "This will not send a message to the requestor - you will need to get in touch with them directly."
                      : "This will send a message to the requestor, containing the above note.",
                },
              ],
            },
            !requestorHasSlack &&
              ({
                type: "rich_text",
                elements: [
                  {
                    type: "rich_text_section",
                    elements: [
                      {
                        type: "text",
                        text: "The requestor does not have a linked Slack account, so they will not receive a message. Please get in touch with them directly.",
                        style: {
                          bold: true,
                        },
                      },
                    ],
                  },
                ],
              } satisfies RichTextBlock),
          ].filter((x) => !!x),
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
      await api.client.chat.postEphemeral({
        channel: body.channel!.id,
        user: body.user.id,
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
  if (!(await userHasPermission(actor.user_id, "CheckWithTech.Admin"))) {
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
  const notes = values.notes?.notes.value;
  let newStatus: CheckWithTechStatus | undefined;
  const reqType = body.view.callback_id.replace(/^checkWithTech#do/, "");
  let request;
  switch (reqType) {
    case "Approve":
      newStatus = "Confirmed";
      request = values.request?.request.value;
      if (!request) {
        await ack({
          response_action: "errors",
          errors: {
            request: "Request cannot be empty.",
          },
        });
        return;
      }
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
  await _sendCWTFollowUpAndUpdateMessage(
    cwt,
    actor,
    newStatus,
    notes ?? "",
    request,
  );
}

export interface FullCheckWithTech extends CheckWithTech {
  event: Event;
  submitted_by_user: User & {
    identities: Identity[];
  };
}

export async function _sendCWTFollowUpAndUpdateMessage(
  cwt: FullCheckWithTech,
  actor: User,
  newStatus: CheckWithTechStatus,
  newNotes: string = "",
  newRequest?: string,
) {
  if (
    newStatus === "Confirmed" &&
    env.ADAMRMS_BASE !== "" &&
    (await userHasPermission(actor.user_id, "CalendarIntegration.Admin"))
  ) {
    let armsID = cwt.event.adam_rms_project_id;
    if (!armsID) {
      armsID = await addProjectToAdamRMS(cwt.event_id, actor.user_id);
    }
    await AdamRMS.newQuickProjectComment(
      armsID!,
      `Check With Tech confirmed by ${getUserName(actor)}<br/>${newRequest}` +
        (newNotes.length > 0 ? `<br/>Notes: ${newNotes}` : ""),
    );
  }

  invariant(cwt.slack_message_ts, "Slack message TS not found");
  invariant(
    env.SLACK_CHECK_WITH_TECH_CHANNEL,
    "SLACK_CHECK_WITH_TECH_CHANNEL not set",
  );
  const api = await slackApiConnection();

  // First update the existing channel message, then DM the requestor if
  // they have a linked Slack account.
  let newContext;
  switch (newStatus) {
    case "Confirmed":
      newContext = `:white_check_mark: Approved by ${getUserName(actor)}`;
      break;
    case "Rejected":
      newContext = `:x: Declined by ${getUserName(actor)}`;
      break;
    case "Requested":
      invariant(false, "CWTFollowUp: Expected status other than Requested");
    default:
      invariant(false, "CWTFollowUp: Unknown status " + newStatus);
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
    newRequest ?? cwt.request,
  ];

  try {
    await api.client.chat.update({
      channel: env.SLACK_CHECK_WITH_TECH_CHANNEL,
      ts: cwt.slack_message_ts,
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
              text: newContext,
              emoji: true,
            },
          ],
        },
      ],
    });
  } catch (e) {
    console.error("Failed to update #check-with-tech message");
    console.error(e);
    // Still try to DM the requestor
  }

  const requestor = cwt.submitted_by_user.identities.find(
    (x) => x.provider === "slack",
  );
  if (!requestor) {
    return;
  }
  const responseParts = [
    `Your #check-with-tech request for ${
      cwt.event.name
    } has been ${newStatus.toLowerCase()} by ${getUserName(actor)}.`,
    newNotes ? `Notes: ${newNotes}` : "",
    `View your event <${env.PUBLIC_URL}/calendar/${cwt.event_id}|here>.`,
  ].filter(Boolean);
  await api.client.chat.postMessage({
    channel: requestor.provider_key,
    text: responseParts.join("\n"),
    mrkdwn: true,
  });
}

function assertIsViewSubmitAction(
  args: SlackViewMiddlewareArgs,
): args is SlackViewMiddlewareArgs<ViewSubmitAction> {
  return args.body.type === "view_submission";
}
