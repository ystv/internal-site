import {
  Avatar,
  Card,
  Group,
  Skeleton,
  Space,
  Stack,
  Table,
  TableTbody,
  TableTd,
  TableTh,
  TableThead,
  TableTr,
} from "@mantine/core";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { DateTime } from "@/components/DateTimeHelpers";
import { ICalCopyButton } from "@/components/ICalCopyButton";
import { PageInfo } from "@/components/PageInfo";
import { SignoutButton } from "@/components/SignoutButton";
import SlackLoginButton from "@/components/slack/SlackLoginButton";
import SlackUserInfo from "@/components/slack/SlackUserInfo";
import { getUserName } from "@/components/UserHelpers";
import * as Calendar from "@/features/calendar";
import * as People from "@/features/people";
import { getCurrentUser, mustGetCurrentUser } from "@/lib/auth/server";
import { env } from "@/lib/env";
import invariant from "@/lib/invariant";
import { isSlackEnabled } from "@/lib/slack/slackApiConnection";

import { UserPreferences } from "./UserPreferences";
import { hasWrapped } from "../../wrapped/util";

export default async function MePage() {
  return <UserPage id={(await mustGetCurrentUser()).user_id} />;
}

export async function UserPage(props: { id: number }) {
  const user = await People.getUserSecure(props.id);
  if (!user) {
    notFound();
  }
  const me = await getCurrentUser();
  const isMe = me.user_id === props.id;
  const prefs = People.preferenceDefaults(user.preferences);
  const slackUser = user.identities.find((i) => i.provider === "slack");
  return (
    <div>
      <PageInfo title={isMe ? "My Profile" : getUserName(user)} />
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
          {isMe && <SignoutButton />}
        </Group>
      </Card>
      <Space h={"md"} />
      {isMe && (
        <Card withBorder>
          <Stack gap={0}>
            <h2 className="mt-0">Preferences</h2>
            <UserPreferences value={prefs} />
          </Stack>
        </Card>
      )}
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
      <Suspense fallback={<Skeleton height={38} animate />}>
        <Wrapped userID={user.user_id} />
      </Suspense>
      <Space h={"md"} />
      {isSlackEnabled && isMe && (
        <>
          {!slackUser ? (
            <Card withBorder>
              <h2 className="mt-0">Link your account to Slack</h2>
              <Suspense>
                <Group>
                  <SlackLoginButton mantineCompat redirect="/user/me" />
                </Group>
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
      <Space h={"md"} />
      <Suspense fallback={<Skeleton height={38} animate />}>
        <MyEvents userID={user.user_id} />
      </Suspense>
    </div>
  );
}

async function Wrapped({ userID }: { userID: number }) {
  const me = await People.getUserSecure(userID);
  invariant(me, "no user");
  const has2024 = await hasWrapped(me.email, 2024);
  if (!has2024) {
    return null;
  }
  return (
    <Card withBorder>
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
    </Card>
  );
}

async function MyEvents({ userID }: { userID: number }) {
  const events = await Calendar.getAllEventsForUser(userID);
  if (events.length === 0) {
    return null;
  }
  return (
    <Card withBorder>
      <h2>My Events</h2>
      <Table>
        <TableThead>
          <TableTr>
            <TableTh>Event</TableTh>
            <TableTh>Date</TableTh>
            <TableTh>Role</TableTh>
          </TableTr>
        </TableThead>
        <TableTbody>
          {events.map((event) => (
            <TableTr key={event.event_id}>
              <TableTd>
                <Link href={`/calendar/${event.event_id}`}>{event.name}</Link>
              </TableTd>
              <TableTd>
                <DateTime val={event.start_date.toUTCString()} format="date" />
              </TableTd>
              <TableTd>
                {event.signup_sheets
                  // getAllEventsForUser pre-filters this to only include our crews
                  .flatMap((sheet) => sheet.crews.map((c) => c.positions.name))
                  .join(", ")}
              </TableTd>
            </TableTr>
          ))}
        </TableTbody>
      </Table>
    </Card>
  );
}
