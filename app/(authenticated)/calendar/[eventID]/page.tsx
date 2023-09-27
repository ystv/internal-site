import { notFound } from "next/navigation";
import invariant from "tiny-invariant";
import { getUserName } from "@/components/UserHelpers";
import { getCurrentUser } from "@/lib/auth/server";
import { CurrentUserAttendeeRow } from "@/app/(authenticated)/calendar/[eventID]/AttendeeStatus";
import { AttendStatusLabels } from "@/features/calendar/statuses";
import { SignupSheetsView } from "@/app/(authenticated)/calendar/[eventID]/SignupSheet";
import { formatDateTime, formatTime } from "@/components/DateTimeHelpers";
import { isSameDay } from "date-fns";
import { EventObjectType, getEvent } from "@/features/calendar/events";
import {
  canManageAnySignupSheet,
  getAllCrewPositions,
} from "@/features/calendar";
import {
  CrewPositionsProvider,
  MembersProvider,
} from "@/components/FormFieldPreloadedData";
import { getAllUsers } from "@/features/people";
import { EventActionsUI } from "./EventActionsUI";

async function AttendeesView({ event }: { event: EventObjectType }) {
  invariant(event.attendees, "no attendees for AttendeesView");
  const me = await getCurrentUser();
  const isCurrentUserAttending = event.attendees.some(
    (att) => att.user_id === me.user_id,
  );
  return (
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {event.attendees!.map((att) => (
          <tr key={att.user_id}>
            {att.user_id === me.user_id ? (
              <CurrentUserAttendeeRow event={event} me={me} />
            ) : (
              <>
                <td>{getUserName(att.users)}</td>
                <td>
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
          <tr>
            <CurrentUserAttendeeRow event={event} me={me} />
          </tr>
        )}
      </tbody>
    </table>
  );
}

async function ShowView(props: { event: EventObjectType }) {
  const me = await getCurrentUser();
  if (canManageAnySignupSheet(props.event, me)) {
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
          <SignupSheetsView event={props.event} me={me} />
        </MembersProvider>
      </CrewPositionsProvider>
    );
  }
  return <SignupSheetsView event={props.event} me={me} />;
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
  return (
    <>
      <div
        className={
          "flex w-full flex-col items-center justify-between pb-4 sm:flex-row sm:pb-0"
        }
      >
        <div className="w-fit grow font-bold">
          <h1>{event.name}</h1>
        </div>
        <EventActionsUI event={event} />
      </div>
      <strong>
        {formatDateTime(event.start_date)} -{" "}
        {isSameDay(event.start_date, event.end_date)
          ? formatTime(event.end_date)
          : formatDateTime(event.end_date)}
      </strong>
      <p>{event.description}</p>
      {event.updated_by_user && event.event_type !== "show" && (
        <p>Host: {getUserName(event.updated_by_user)}</p>
      )}
      {event.location && <p>Location: {event.location}</p>}
      {event.event_type === "show" ? (
        <ShowView event={event} />
      ) : (
        <AttendeesView event={event} />
      )}
    </>
  );
}
