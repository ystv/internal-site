import { notFound } from "next/navigation";
import invariant from "@/lib/invariant";
import { getUserName } from "@/components/UserHelpers";
import { getCurrentUser, UserType } from "@/lib/auth/server";
import { CurrentUserAttendeeRow } from "@/app/(authenticated)/calendar/[eventID]/AttendeeStatus";
import { AttendStatusLabels } from "@/features/calendar/statuses";
import { SignupSheetsView } from "@/app/(authenticated)/calendar/[eventID]/SignupSheet";
import { DateTime } from "@/components/DateTimeHelpers";
import { isSameDay } from "date-fns";
import { twMerge } from "tailwind-merge";
import { EventObjectType, getEvent } from "@/features/calendar/events";
import {
  canManage,
  canManageAnySignupSheet,
  getAllCrewPositions,
} from "@/features/calendar";
import {
  CrewPositionsProvider,
  MembersProvider,
} from "@/components/FormFieldPreloadedData";
import { getAllUsers } from "@/features/people";
import { EventActionsUI } from "./EventActionsUI";
import { Alert, Text } from "@mantine/core";
import { TbInfoCircle, TbAlertTriangle } from "react-icons/tb";
import slackApiConnection, {
  isSlackEnabled,
} from "@/lib/slack/slackApiConnection";
import { ConversationsInfoResponse } from "@slack/web-api/dist/response";
import { Suspense } from "react";
import SlackChannelName from "@/components/slack/SlackChannelName";

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
          <SignupSheetsView event={event} me={me} />
        </MembersProvider>
      </CrewPositionsProvider>
    );
  }
  return <SignupSheetsView event={event} me={me} />;
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

  const me = await getCurrentUser();
  let allMembers;
  if (canManage(event, me)) {
    allMembers = await getAllUsers();
  }
  return (
    <>
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
      ) : (
        <>
          {event.is_tentative && (
            <Alert
              variant="light"
              className="!bg-[#f3f3f4] !text-[--mantine-color-default-color] dark:!bg-[--mantine-color-gray-filled]"
              title="Tentative Event"
              icon={<TbInfoCircle />}
            >
              This event has not been confirmed by the producer/host yet. Please
              check back later for updates.
            </Alert>
          )}
        </>
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
