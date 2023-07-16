import { EventObjectType, getEvent } from "@/features/calendar";
import { notFound } from "next/navigation";
import invariant from "tiny-invariant";
import { getUserName } from "@/components/UserCommon";
import { getCurrentUser } from "@/lib/auth/server";
import { CurrentUserAttendeeRow } from "@/app/calendar/[eventID]/AttendeeStatus";
import { AttendStatusLabels } from "@/features/calendar/statuses";
import { SignupSheetsView } from "@/app/calendar/[eventID]/SignupSheet";

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

export default async function EventPage({
  params,
}: {
  params: { eventID: string };
}) {
  const me = await getCurrentUser();
  const event = await getEvent(parseInt(params.eventID, 10));
  if (!event) {
    notFound();
  }
  return (
    <div>
      <h1 className="text-2xl font-bold">{event.name}</h1>
      <p>
        {event.start_date.toLocaleDateString()}{" "}
        {event.start_date.toLocaleTimeString()} -{" "}
        {event.end_date.toLocaleTimeString()}
      </p>
      <p>{event.description}</p>
      {event.users_events_created_byTousers && event.event_type !== "show" && (
        <p>Host: {getUserName(event.users_events_created_byTousers)}</p>
      )}
      {event.location && <p>Location: {event.location}</p>}
      {event.event_type === "show" ? (
        <SignupSheetsView event={event} me={me} />
      ) : (
        <AttendeesView event={event} />
      )}
    </div>
  );
}
