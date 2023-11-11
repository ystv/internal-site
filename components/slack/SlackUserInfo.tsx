import { setUserSlackID } from "@/features/people";
import { mustGetCurrentUser } from "@/lib/auth/server";
import slackConnect, { isSlackEnabled } from "@/lib/slack/slackConnect";
import {
  Avatar,
  Group,
  Stack,
  Text,
  Button,
  Card,
  HoverCard,
} from "@mantine/core";
import { redirect } from "next/navigation";
import { AiFillDelete } from "react-icons/ai";
import SlackLogoutButton from "./SlackLogoutButton";
import { App } from "@slack/bolt";

export default async function SlackUserInfo({
  slack_user_id,
}: {
  slack_user_id: string;
}) {
  let slackApp: App | null = null;

  if (isSlackEnabled) {
    slackApp = await slackConnect();
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
          <form
            action={async () => {
              "use server";
              setUserSlackID(cal_user.user_id, "");
              redirect("/user/me");
            }}
            className="ml-auto"
          >
            <SlackLogoutButton />
          </form>
        </Group>
      </Card>
    );
  }
}
