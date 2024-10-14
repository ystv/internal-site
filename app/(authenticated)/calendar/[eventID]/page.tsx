import { CurrentUserAttendeeRow } from "@/app/(authenticated)/calendar/[eventID]/AttendeeStatus";
import { SignupSheetsView } from "@/app/(authenticated)/calendar/[eventID]/SignupSheet";
import { CrewPositionsProvider, MembersProvider } from "@/components/forms";
import { DateTime } from "@/components/helpers/DateTimeHelpers";
import { PageInfo } from "@/components/helpers/PageInfo";
import { getUserName } from "@/components/helpers/UserHelpers";
import SlackChannelName from "@/components/slack/SlackChannelName";
import SlackLoginButton from "@/components/slack/SlackLoginButton";
import {
  canManage,
  canManageAnySignupSheet,
  getAllCrewPositions,
  getLatestRequest,
} from "@/features/calendar";
import { getEvent, type EventObjectType } from "@/features/calendar/events";
import { AttendStatusLabels } from "@/features/calendar/statuses";
import { getAllUsers } from "@/features/people";
import {
  hasPermission,
  mustGetCurrentUser,
  type UserType,
} from "@/lib/auth/server";
import invariant from "@/lib/invariant";
import slackApiConnection, {
  isSlackEnabled,
} from "@/lib/slack/slackApiConnection";
import { Alert, Space } from "@mantine/core";
import { isSameDay } from "date-fns";
import dayjs from "dayjs";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { TbAlertTriangle, TbInfoCircle, TbTool } from "react-icons/tb";
import { twMerge } from "tailwind-merge";
import {
  CheckWithTechAdminBanner,
  CheckWithTechPromptContents,
} from "./CheckWithTech";
import { EventActionsUI } from "./EventActionsUI";

async function AttendeesView({
  event,
  me,
}: {
  event: EventObjectType;
  me: UserType;
}) {
  invariant(event.attendees, "no attendees for AttendeesView");
  const isCurrentUserAttending = event.attendees.some(
    (att) => att.user_id === me.user_id,
  );
  return (
    <table className={"mx-auto w-full max-w-2xl"}>
      <thead>
        <tr>
          <th>Name</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {event.attendees!.map((att) => (
          <tr key={att.user_id} className={"text-center"}>
            {att.user_id === me.user_id ? (
              <CurrentUserAttendeeRow
                event={event}
                me={me}
                readOnly={event.is_cancelled}
              />
            ) : (
              <>
                <td>{getUserName(att.users)}</td>
                <td className={"text-sm"}>
                  {att.attend_status in AttendStatusLabels
                    ? AttendStatusLabels[
                        att.attend_status as keyof typeof AttendStatusLabels
                      ]
                    : AttendStatusLabels.unknown}
                </td>
              </>
            )}
          </tr>
        ))}
        {!isCurrentUserAttending && (
          <tr className={"text-center"}>
            <CurrentUserAttendeeRow
              event={event}
              me={me}
              readOnly={event.is_cancelled}
            />
          </tr>
        )}
      </tbody>
    </table>
  );
}

async function CheckWithTechPrompt({
  event,
  me,
}: {
  event: EventObjectType;
  me: UserType;
}) {
  if (!canManageAnySignupSheet(event, me)) {
    return null;
  }
  if (dayjs(event.start_date).isBefore(new Date())) {
    // no point checking something in the past
    return null;
  }
  if (event.signup_sheets.length === 0) {
    // signup sheets take priority
    return null;
  }
  if (!isSlackEnabled) {
    return null;
  }
  const cwt = await getLatestRequest(event.event_id);

  if (cwt && (await hasPermission("CheckWithTech.Admin"))) {
    return <CheckWithTechAdminBanner cwt={cwt} />;
  }

  if (event.adam_rms_project_id !== null) {
    // Assume already checked
    return null;
  }

  if (!(await hasPermission("CheckWithTech.Submit"))) {
    return null;
  }

  let contents;
  if (!cwt) {
    contents = <CheckWithTechPromptContents eventID={event.event_id} />;
  } else {
    switch (cwt.status) {
      case "Rejected":
        // Don't show rejected CWTs, just prompt to create a new one
        contents = <CheckWithTechPromptContents eventID={event.event_id} />;
        break;
      case "Requested":
        contents = (
          <Alert
            variant="light"
            color="blue"
            title="#CheckWithTech"
            icon={<TbTool />}
          >
            Your #CheckWithTech has been submitted to the tech team. Keep an eye
            on Slack in case they need any further details!
          </Alert>
        );
        break;
      case "Confirmed":
        contents = null; // Don't show anything if it's already confirmed, reduce banner fatigue
        break;
      default:
        invariant(false, `unexpected CWT status: ${cwt.status}`);
    }
  }
  return (
    <>
      {contents}
      <Space h={"lg"} />
    </>
  );
}

async function ShowView({
  event,
  me,
}: {
  event: EventObjectType;
  me: UserType;
}) {
  if (canManageAnySignupSheet(event, me)) {
    // TODO(WEB-40): this pre-loads quite a bit of information that we don't actually need until you go to edit a sheet.
    //  Would be better to either load it on-demand dynamically, or move the edit view to a sub-page.
    const [positions, members] = await Promise.all([
      getAllCrewPositions(),
      getAllUsers(),
    ]);
    return (
      <CrewPositionsProvider positions={positions}>
        <MembersProvider members={members}>
          <CheckWithTechPrompt event={event} me={me} />
          <SignupSheetsView event={event} me={me} />
        </MembersProvider>
      </CrewPositionsProvider>
    );
  }
  return <SignupSheetsView event={event} me={me} />;
}

async function SlackBanner(props: { event: EventObjectType }) {
  if (!props.event.slack_channel_id) {
    return null;
  }
  const me = await mustGetCurrentUser();
  if (me.identities.find((x) => x.provider === "slack")) {
    return null;
  }

  const channelInfo = await (
    await slackApiConnection()
  ).client.conversations.info({
    channel: props.event.slack_channel_id,
  });

  return (
    <Alert variant="light" color="blue" title="Slack" icon={<TbInfoCircle />}>
      This event has a Slack channel: #{channelInfo.channel?.name}.&nbsp;
      Connect your Slack account to join it automatically.
      <br />
      <SlackLoginButton slackClientID={process.env.SLACK_CLIENT_ID!} />
    </Alert>
  );
}

export default async function EventPage({
  params,
}: {
  params: { eventID: string };
}) {
  const event = await getEvent(parseInt(params.eventID, 10));
  if (!event) {
    notFound();
  }

  const me = await mustGetCurrentUser();
  let allMembers;
  if (canManage(event, me)) {
    allMembers = await getAllUsers();
  }
  return (
    <>
      <PageInfo title={event.name} />
      {event.is_cancelled ? (
        <Alert
          variant="light"
          color="red"
          title="Event Cancelled"
          icon={<TbAlertTriangle />}
        >
          Unfortunately this event has been cancelled. If you have any
          questions, please contact the producer/host.
        </Alert>
      ) : event.is_tentative ? (
        <Alert
          variant="light"
          className="!bg-[#f3f3f4] !text-[--mantine-color-default-color] dark:!bg-[--mantine-color-gray-filled]"
          title="Tentative Event"
          icon={<TbInfoCircle />}
        >
          This event has not been confirmed by the producer/host yet. Please
          check back later for updates.
        </Alert>
      ) : (
        <Suspense fallback={null}>
          <SlackBanner event={event} />
        </Suspense>
      )}
      <div
        className={
          "flex w-full flex-col items-center justify-between sm:flex-row"
        }
      >
        <div className="w-fit grow font-bold">
          <h1
            className={twMerge(
              "text-4xl font-bold",
              event.is_cancelled && "text-danger-4 line-through",
              event.is_tentative && "italic text-gray-600",
            )}
          >
            {event.name}
          </h1>
        </div>
        {canManage(event, me) && (
          <MembersProvider members={allMembers!}>
            <EventActionsUI event={event} />
          </MembersProvider>
        )}
      </div>
      <div
        className={twMerge(
          "text-center sm:text-left",
          event.is_cancelled && "line-through",
        )}
      >
        <strong>
          <DateTime val={event.start_date.toISOString()} format="datetime" /> -{" "}
          {isSameDay(event.start_date, event.end_date) ? (
            <DateTime val={event.end_date.toISOString()} format="time" />
          ) : (
            <DateTime val={event.end_date.toISOString()} format="datetime" />
          )}
          {isSlackEnabled && event.slack_channel_id && (
            <Suspense>
              <SlackChannelName slackChannelID={event.slack_channel_id} />
            </Suspense>
          )}
        </strong>
      </div>
      <div>
        {event.description.split(/(\r\n|\r|\n)/g).map((p, idx) => (
          <p key={idx}>{p}</p>
        ))}
      </div>
      {event.host_user && event.event_type !== "show" && (
        <div className={"py-2"}>
          <strong className={"text-sm"}>
            Host: {getUserName(event.host_user)}
          </strong>
        </div>
      )}
      {event.location && <p>Location: {event.location}</p>}
      {event.event_type === "show" ? (
        <ShowView event={event} me={me} />
      ) : (
        <AttendeesView event={event} me={me} />
      )}
    </>
  );
}
