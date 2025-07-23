import { Avatar, Card, Group, Stack, Text } from "@mantine/core";
import * as Sentry from "@sentry/nextjs";
import { type App } from "@slack/bolt";
import { redirect } from "next/navigation";

import { removeSlackLink } from "@/features/people";
import { mustGetCurrentUser } from "@/lib/auth/server";
import slackApiConnection, {
  isSlackEnabled,
} from "@/lib/slack/slackApiConnection";

import SlackLogoutButton from "./SlackLogoutButton";

export default async function SlackUserInfo({
  slack_user_id,
}: {
  slack_user_id: string;
}) {
  let slackApp: App | null = null;

  if (isSlackEnabled) {
    slackApp = slackApiConnection();
    const slack_user = await slackApp.client.users.profile.get({
      user: slack_user_id,
    });

    const cal_user = await mustGetCurrentUser();

    // async function

    return (
      <Card withBorder>
        <Group>
          <Avatar src={slack_user.profile?.image_48} radius="xl" />
          <Stack gap={5}>
            <Text size="sm" fw={800} style={{ lineHeight: 1 }}>
              {slack_user.profile?.display_name ||
                slack_user.profile?.real_name}
            </Text>
            <Text size="sm" fw={500} style={{ lineHeight: 1 }}>
              {slack_user.profile?.email}
            </Text>
          </Stack>
          <SlackLogoutButton
            action={async () => {
              "use server";
              return Sentry.withServerActionInstrumentation(
                "SlackUserInfo.logOut",
                async () => {
                  const removeSuccess = await removeSlackLink(cal_user.user_id);
                  if (removeSuccess) {
                    redirect("/user/me");
                  } else {
                    return false;
                  }
                },
              );
            }}
          />
        </Group>
      </Card>
    );
  }
}
