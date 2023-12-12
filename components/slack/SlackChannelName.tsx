import slackApiConnection, {
  isSlackEnabled,
} from "@/lib/slack/slackApiConnection";
import { Text } from "@mantine/core";
import { ConversationsInfoResponse } from "@slack/web-api/dist/response";

export default async function SlackChannelName({
  slackChannelID,
}: {
  slackChannelID: string;
}) {
  let eventChannelInfo: ConversationsInfoResponse | null = null;
  if (isSlackEnabled) {
    const slackApp = await slackApiConnection();
    if (slackChannelID) {
      eventChannelInfo = await slackApp.client.conversations.info({
        channel: slackChannelID,
      });
    }
  }

  return (
    <>
      {eventChannelInfo?.ok && (
        <Text>Slack channel: #{eventChannelInfo.channel?.name}</Text>
      )}
    </>
  );
}
