import { FormResponse } from "@/components/Form";
import { getUserName } from "@/components/UserHelpers";
import { getCurrentUser } from "@/lib/auth/server";
import { env } from "@/lib/env";
import slackApiConnection, {
  isSlackEnabled,
} from "@/lib/slack/slackApiConnection";
import { KnownBlock } from "@slack/types/dist/block-kit/blocks";

export async function submit(
  type: "bug" | "feature",
  description: string,
  path?: string,
): Promise<FormResponse> {
  if (!isSlackEnabled) {
    return {
      ok: false,
      errors: {
        root: "Slack integration isn't enabled, you shouldn't be seeing this",
      },
    };
  }
  if (env.SLACK_USER_FEEDBACK_CHANNEL == undefined) {
    return {
      ok: false,
      errors: {
        root: "No feedback channel specified, please contact computing team",
      },
    };
  }

  const slack = slackApiConnection();
  const me = await getCurrentUser();
  const slackIdentity = me.identities.find((x) => x.provider === "slack");
  const blocks: KnownBlock[] = [
    {
      type: "rich_text",
      elements: [
        {
          type: "rich_text_section",
          elements: [
            {
              type: "text",
              text: `New ${
                type === "bug" ? "bug report" : "feature request"
              } from `,
              style: {
                bold: true,
              },
            },
            slackIdentity
              ? {
                  type: "user",
                  user_id: slackIdentity.provider_key,
                  style: {
                    bold: true,
                  },
                }
              : {
                  type: "text",
                  text: getUserName(me),
                  style: {
                    bold: true,
                  },
                },
            type === "bug" && path !== undefined
              ? {
                  type: "text",
                  text: ` at path \`${path}\``,
                  style: {
                    bold: true,
                  },
                }
              : (null as any),
          ].filter(Boolean),
        },
      ],
    },
    {
      type: "section",
      text: {
        text: description,
        type: "plain_text",
      },
    },
    {
      type: "context",
      elements: [
        {
          type: "plain_text",
          text: 'To accept this feedback, use the "Create new issue" Linear shortcut. Use the "User Feedback" label.',
          emoji: true,
        },
      ],
    },
  ];
  if (type === "bug" && env.SENTRY_PROJECT_ID) {
    blocks.splice(2, 0, {
      type: "actions",
      elements: [
        {
          type: "button",
          text: {
            type: "plain_text",
            text: ":sentry: Search Sentry",
            emoji: true,
          },
          url: `https://ystv.sentry.io/issues/?project=${
            env.SENTRY_PROJECT_ID
          }&query=user.email%3A${encodeURIComponent(me.email)}&statsPeriod=7d`,
          action_id: "userFeedback#searchSentry",
        },
      ],
    });
  }
  const status = await slack.client.chat.postMessage({
    channel: env.SLACK_USER_FEEDBACK_CHANNEL!,
    blocks,
    text: `New ${
      type === "bug" ? "bug report" : "feature request"
    } from ${getUserName(me)}`,
  });

  if (status.ok) {
    return {
      ok: true,
    };
  } else {
    return {
      ok: false,
      errors: {
        root: status.error,
      },
    };
  }
}
