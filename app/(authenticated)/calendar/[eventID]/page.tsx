import { notFound } from "next/navigation";
import invariant from "tiny-invariant";
import { getUserName } from "@/components/UserHelpers";
import { getCurrentUser, UserType } from "@/lib/auth/server";
import { CurrentUserAttendeeRow } from "@/app/(authenticated)/calendar/[eventID]/AttendeeStatus";
import { AttendStatusLabels } from "@/features/calendar/statuses";
import { SignupSheetsView } from "@/app/(authenticated)/calendar/[eventID]/SignupSheet";
import { formatDateTime, formatTime } from "@/components/DateTimeHelpers";
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
    // TODO(WEB-40): this pre-loads quite a bit of information (~56k gzipped, 4MB uncompressed)
    //  that we don't actually need until you go to edit a sheet.
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
  return (
    <>
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
            )}
          >
            {event.is_cancelled && <span>CANCELLED: </span>}
            {event.name}
          </h1>
        </div>
        {canManage(event, me) && <EventActionsUI event={event} />}
      </div>
      <div
        className={twMerge(
          "text-center sm:text-left",
          event.is_cancelled && "line-through",
        )}
      >
        <strong>
          {formatDateTime(event.start_date)} -{" "}
          {isSameDay(event.start_date, event.end_date)
            ? formatTime(event.end_date)
            : formatDateTime(event.end_date)}
        </strong>
      </div>
      <p>{event.description}</p>
      {event.updated_by_user && event.event_type !== "show" && (
        <div className={"py-2"}>
          <strong className={"text-sm"}>
            Host: {getUserName(event.updated_by_user)}
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
