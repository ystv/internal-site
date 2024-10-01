import { mustGetCurrentUser, requirePermission } from "@/lib/auth/server";
import * as People from "@/features/people";
import * as Calendar from "@/features/calendar";
import { notFound } from "next/navigation";
import { getUserName } from "@/components/UserHelpers";
import {
  Avatar,
  Button,
  Card,
  CopyButton,
  Group,
  Skeleton,
  Space,
  Stack,
} from "@mantine/core";
import { UserPreferences } from "./UserPreferences";
import { ICalCopyButton } from "@/components/ICalCopyButton";
import SlackLoginButton from "@/components/slack/SlackLoginButton";
import SlackUserInfo from "@/components/slack/SlackUserInfo";
import { Suspense } from "react";
import { isSlackEnabled } from "@/lib/slack/slackApiConnection";
import { hasWrapped } from "../../wrapped/util";
import Link from "next/link";
import { env } from "@/lib/env";
import { SignoutButton } from "@/components/SignoutButton";

export default async function UserPage({ params }: { params: { id: string } }) {
  let user: People.SecureUser;
  if (params.id === "me") {
    user = People.SecureUserModel.parse(await mustGetCurrentUser());
  } else {
    await requirePermission(
      "ManageMembers.Members.List",
      "ManageMembers.Members.Admin",
      "ManageMembers.Admin",
    );
    const dbUser = await People.getUser(parseInt(params.id, 10));
    if (!dbUser) {
      notFound();
    }
    user = People.SecureUserModel.parse(dbUser);
  }
  const prefs = People.preferenceDefaults(user.preferences);
  const slackUser = user.identities.find((i) => i.provider === "slack");
  return (
    <div>
      <Card withBorder>
        <Group>
          {user.avatar && (
            <>
              <Avatar src={user.avatar} radius={28} size={56} />
            </>
          )}
          <Stack gap={3}>
            <h2 className="my-0">{getUserName(user)}</h2>
            <h4 className="my-0 text-[--mantine-color-placeholder]">
              {user.email}
            </h4>
          </Stack>
          <SignoutButton />
        </Group>
      </Card>
      <Space h={"md"} />
      <Card withBorder>
        <Stack gap={0}>
          <h2 className="mt-0">Preferences</h2>
          <UserPreferences value={prefs} userID={user.user_id} />
        </Stack>
      </Card>
      <Space h={"md"} />
      <Card withBorder>
        <Group>
          <Stack gap={0} className="w-full">
            <h2 className="mt-0">Add Calendar to Google Calendar</h2>
            <Stack gap={0}>
              <p>Add this URL as a new calendar in Google Calendar:</p>
              {await (async () => {
                const link = `${
                  env.PUBLIC_URL
                }/iCal/${await Calendar.encodeUserID(user.user_id)}`;

                return (
                  <Group>
                    <input disabled className="sm:max-w-96" value={link} />
                    <ICalCopyButton link={link} />
                  </Group>
                );
              })()}
            </Stack>
          </Stack>
        </Group>
      </Card>
      <Space h={"md"} />
      <Card withBorder>
        <Suspense fallback={<Skeleton height={38} animate />}>
          <Wrapped />
        </Suspense>
      </Card>
      <Space h={"md"} />
      {isSlackEnabled && (
        <>
          {!slackUser ? (
            <Card withBorder>
              <h2 className="mt-0">Link your account to Slack</h2>
              <Suspense>
                <SlackLoginButton
                  slackClientID={process.env.SLACK_CLIENT_ID!}
                />
              </Suspense>
            </Card>
          ) : (
            <Card withBorder>
              <h2 className="mt-0">Manage Slack link</h2>
              <Suspense
                fallback={
                  <>
                    <Card withBorder>
                      <Group>
                        <Skeleton height={38} circle />
                      </Group>
                    </Card>
                  </>
                }
              >
                <SlackUserInfo slack_user_id={slackUser.provider_key} />
              </Suspense>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

async function Wrapped() {
  const me = await mustGetCurrentUser();
  const has2024 = await hasWrapped(me.email, 2024);
  if (!has2024) {
    return null;
  }
  return (
    <Group>
      <div>
        <h2 className="mt-0">YSTV Wrapped</h2>
        <p className="my-1">Watch back previous years&apos; YSTV Wrapped.</p>
        <ul>
          <li>
            <Link href="/wrapped?year=2024">YSTV Wrapped 2024</Link>
          </li>
        </ul>
      </div>
    </Group>
  );
}
