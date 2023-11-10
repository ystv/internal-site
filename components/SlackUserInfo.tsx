import { setUserSlackID } from "@/features/people";
import { mustGetCurrentUser } from "@/lib/auth/server";
import slackConnect from "@/lib/slack/slackConnect";
import { Avatar, Group, Stack, Text, Button, Card } from "@mantine/core";
import { Form, useForm } from "@mantine/form";
import { redirect } from "next/navigation";

export default async function SlackUserInfo({
  slack_user_id,
}: {
  slack_user_id: string;
}) {
  const slackApp = await slackConnect();

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
            {slack_user.profile?.display_name || slack_user.profile?.real_name}
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
          <Button
            variant="filled"
            color="red"
            className="ml-auto"
            type="submit"
          >
            Remove
          </Button>
        </form>
      </Group>
    </Card>
  );
}
