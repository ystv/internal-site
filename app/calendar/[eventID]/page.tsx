import { EventObjectType, getEvent } from "@/features/calendar";
import { notFound } from "next/navigation";
import { getUserName } from "@/components/UserCommon";
import { getCurrentUser } from "@/lib/auth/legacy";
import { CurrentUserAttendeeRow } from "@/app/calendar/[eventID]/AttendeeStatus";
import { AttendStatusLabels } from "@/features/calendar/statuses";

async function AttendeesView({ event }: { event: EventObjectType }) {
  const me = await getCurrentUser();
  const isCurrentUserAttending = event.attendees.some(
    (att) => att.user_id === me.id,
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
        {event.attendees.map((att) => (
          <tr key={att.user_id}>
            {att.user_id === me.id ? (
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
  const event = await getEvent(parseInt(params.eventID, 10));
  if (!event) {
    notFound();
  }
  return (
    <div>
      <h1>{event.name}</h1>
      <p>
        {event.start_date.toLocaleDateString()}{" "}
        {event.start_date.toLocaleTimeString()} -{" "}
        {event.end_date.toLocaleTimeString()}
      </p>
      <p>{event.description}</p>
      {event.users_events_created_byTousers && (
        <p>Host: {getUserName(event.users_events_created_byTousers)}</p>
      )}
      {event.location && <p>Location: {event.location}</p>}
      {event.event_type === "show" ? (
        <b>Shows TODO</b>
      ) : (
        <AttendeesView event={event} />
      )}
    </div>
  );
}
