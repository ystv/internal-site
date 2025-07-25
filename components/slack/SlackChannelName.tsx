import { Text } from "@mantine/core";
import { type ConversationsInfoResponse } from "@slack/web-api/dist/types/response";

import slackApiConnection, {
  isSlackEnabled,
} from "@/lib/slack/slackApiConnection";

export default async function SlackChannelName({
  slackChannelID,
}: {
  slackChannelID: string;
}) {
  let eventChannelInfo: ConversationsInfoResponse | null = null;
  if (isSlackEnabled) {
    const slackApp = slackApiConnection();
    if (slackChannelID) {
      eventChannelInfo = await slackApp.client.conversations.info({
        channel: slackChannelID,
      });
    }
  }

  return (
    <>
      {eventChannelInfo?.ok && (
        <Text>
          Slack channel:&nbsp;
          <a
            href={`https://ystv.slack.com/archives/${eventChannelInfo.channel?.id}`}
          >
            #{eventChannelInfo.channel?.name}
          </a>
        </Text>
      )}
    </>
  );
}
