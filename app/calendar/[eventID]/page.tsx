import { getEvent } from "@/features/calendar";
import { notFound } from "next/navigation";

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
      <p>
        Host: {event.users_events_created_byTousers?.first_name}{" "}
        {event.users_events_created_byTousers?.last_name}
      </p>
    </div>
  );
}
